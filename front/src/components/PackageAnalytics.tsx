import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, AlertTriangle, Package } from 'lucide-react';

interface PackageAnalyticsProps {
  packageInfo: {
    name: string;
    version: string;
  } | null;
}

const PackageAnalytics: React.FC<PackageAnalyticsProps> = ({ packageInfo }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPackageData = async () => {
      if (!packageInfo) return;
      
      setLoading(true);
      setError(null);
      
      try {
        console.log('Sending request with:', packageInfo); // Debug log
        
        const response = await fetch('http://localhost:3000/api/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            packageName: packageInfo.name,
            packageVersion: packageInfo.version
          }),
        });
    
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
    
        const jsonData = await response.json();
        console.log('Received data:', jsonData); // Debug log
        console.log('DEBUG: ', jsonData.downloads)
        setData(jsonData);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPackageData();
  }, [packageInfo]);

  if (!packageInfo) return null;

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!data) return null;


  const formatXAxis = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit'
    });
  };
  
  const formatYAxis = (num) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm text-gray-600">
            {new Date(label).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
          <p className="text-sm font-semibold text-blue-600">
            {payload[0].value.toLocaleString()} downloads
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <Card>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={data.downloads.daily}
              margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatXAxis}
                interval="preserveStartEnd"
                minTickGap={50}
              />
              <YAxis 
                tickFormatter={formatYAxis}
                width={60}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="downloads" 
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Download Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Downloads (Last Week)</span>
                <span className="font-bold">{data.downloads.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Daily Average</span>
                <span className="font-bold">{data.downloads.averageDaily.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Growth Rate</span>
                <span className={`font-bold ${
                  data.downloads.growthRate > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {data.downloads.growthRate > 0 ? '+' : ''}{data.downloads.growthRate}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Security Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.security && Object.entries(data.security.vulnerabilities).some(([_, count]) => count > 0) ? (
              <Alert variant="destructive">
                <AlertDescription>
                  Found vulnerabilities:
                  {Object.entries(data.security.vulnerabilities)
                    .filter(([_, count]) => count > 0)
                    .map(([severity, count]) => (
                      ` ${count} ${severity}`
                    )).join(', ')}
                </AlertDescription>
              </Alert>
            ) : (
              <Alert>
                <AlertDescription>
                  No vulnerabilities found
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PackageAnalytics;