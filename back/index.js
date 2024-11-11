require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

async function getDownloadStats(packageName, period = 'last-week') {
  try {
    const response = await axios.get(
      `https://api.npmjs.org/downloads/point/${period}/${packageName}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching download stats:', error);
    throw error;
  }
}

async function getYearlyDownloads(packageName) {
  try {
    const metadataResponse = await axios.get(
      `https://registry.npmjs.org/${packageName}`
    );
    
    const createdDate = new Date(metadataResponse.data.time.created);
    const currentDate = new Date();

    const formatDate = (date) => {
      return date.toISOString().split('T')[0];
    };
    
    const yearlyDownloads = [];
    let startDate = new Date(createdDate);

    startDate.setDate(1);
    
    while (startDate < currentDate) {
      let endDate = new Date(startDate);
      endDate.setFullYear(startDate.getFullYear() + 1);

      if (endDate > currentDate) {
        endDate = new Date(currentDate);
      }

      endDate.setDate(endDate.getDate() - 1);

      if (startDate >= endDate) {
        break;
      }
      
      const start = formatDate(startDate);
      const end = formatDate(endDate);
      
      try {
        const response = await axios.get(
          `https://api.npmjs.org/downloads/point/${start}:${end}/${packageName}`
        );
        
        yearlyDownloads.push({
          year: startDate.getFullYear(),
          downloads: response.data.downloads,
          startDate: start,
          endDate: end
        });
      } catch (error) {
        if (error.response?.status === 404) {
          console.warn(`No data available for ${start} to ${end}`);
        } else {
          throw error;
        }
      }

      startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() + 1);
    }
    
    return yearlyDownloads;
    
  } catch (error) {
    console.error('Error fetching yearly downloads:', error);
    if (error.response?.data) {
      console.error('API Error:', error.response.data);
    }
    throw error;
  }
}

async function getPackageInfo(packageName) {
  try {
    const response = await axios.get(
      `https://registry.npmjs.org/${packageName}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching package info:', error);
    throw error;
  }
}

async function checkVulnerabilities(packageName, packageVersion) {
  try {
    const response = await axios.post(
      'https://registry.npmjs.org/-/npm/v1/security/audits',
      {
        name: packageName,
        packageVersion: packageVersion,
        requires: {
          [packageName]: packageVersion
        },
        dependencies: {
          [packageName]: {
            packageVersion: packageVersion
          }
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error checking vulnerabilities:', error);
    throw error;
  }
}

app.post('/api/analyze', async (req, res) => {
  try {
    const { packageName, packageVersion } = req.body;
    if (!packageName || !packageVersion) {
      return res.status(400).json({ error: 'Package name and packageVersion are required' });
    }

    const [downloadStats, yearlyDownloads, vulnerabilities, packageInfo] = await Promise.all([
      getDownloadStats(packageName),
      getYearlyDownloads(packageName),
      checkVulnerabilities(packageName, packageVersion),
      getPackageInfo(packageName)
    ]);

    const currentDate = new Date();
    const createdDate = new Date(packageInfo.time.created);
    const daysSinceCreation = (currentDate - createdDate) / (1000 * 60 * 60 * 24);
    const averageDailyDownloads = downloadStats.downloads / daysSinceCreation;

    const oldestDownloads = yearlyDownloads[0].downloads;
    const newestDownloads = yearlyDownloads[yearlyDownloads.length - 1].downloads;
    const growthRate = ((newestDownloads - oldestDownloads) / oldestDownloads) * 100;

    const response = {
      downloads: {
        total: downloadStats.downloads,
        daily: averageDailyDownloads,
        yearly: yearlyDownloads.map(year => ({
          year: year.year,
          startDate: year.startDate,
          endDate: year.endDate,
          downloads: year.downloads
        })),
        growthRate: Number(growthRate.toFixed(1))
      },
      security: {
        vulnerabilities: vulnerabilities.metadata.vulnerabilities,
        advisories: vulnerabilities.advisories
      },
      packageInfo: {
        name: packageInfo.name,
        packageVersion: packageVersion,
        description: packageInfo.description,
        maintainers: packageInfo.maintainers,
        lastPublish: packageInfo.time[packageVersion]
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze package' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});