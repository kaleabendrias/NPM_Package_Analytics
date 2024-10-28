import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, AlertTriangle, Package } from 'lucide-react';

// Define types for download data
interface DownloadData {
  date: string;
  downloads: number;
  vulnerabilities: number;
}

const PackageAnalytics: React.FC = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('7d');

  // Sample data - in real app, this would come from NPM API
  const downloadData: DownloadData[] = [
    { date: '2024-10-18', downloads: 1234, vulnerabilities: 2 },
    { date: '2024-10-19', downloads: 1456, vulnerabilities: 2 },
    { date: '2024-10-20', downloads: 1789, vulnerabilities: 1 },
    { date: '2024-10-21', downloads: 2100, vulnerabilities: 1 },
    { date: '2024-10-22', downloads: 2300, vulnerabilities: 0 },
    { date: '2024-10-23', downloads: 2500, vulnerabilities: 0 },
    { date: '2024-10-24', downloads: 2700, vulnerabilities: 0 }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Package Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={downloadData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="downloads" 
                  stroke="#2563eb"
                  strokeWidth={2} 
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
                <span>Total Downloads</span>
                <span className="font-bold">14,079</span>
              </div>
              <div className="flex justify-between">
                <span>Daily Average</span>
                <span className="font-bold">2,011</span>
              </div>
              <div className="flex justify-between">
                <span>Growth Rate</span>
                <span className="font-bold text-green-600">+14.8%</span>
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
            <Alert>
              <AlertDescription>
                2 medium severity vulnerabilities found in dependencies
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PackageAnalytics;
