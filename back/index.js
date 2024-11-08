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

async function getDailyDownloads(packageName, days = 7) {
  try {
    const response = await axios.get(
      `https://api.npmjs.org/downloads/range/last-${days}-days/${packageName}`
    );
    return response.data.downloads;
  } catch (error) {
    console.error('Error fetching daily downloads:', error);
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

    const [downloadStats, dailyDownloads, vulnerabilities, packageInfo] = await Promise.all([
      getDownloadStats(packageName),
      getDailyDownloads(packageName),
      checkVulnerabilities(packageName, packageVersion),
      getPackageInfo(packageName)
    ]);

    const oldestDownloads = dailyDownloads[0].downloads;
    const newestDownloads = dailyDownloads[dailyDownloads.length - 1].downloads;
    const growthRate = ((newestDownloads - oldestDownloads) / oldestDownloads) * 100;

    const response = {
      downloads: {
        total: downloadStats.downloads,
        daily: dailyDownloads.map(day => ({
          date: day.day,
          downloads: day.downloads
        })),
        averageDaily: Math.round(downloadStats.downloads / 7),
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