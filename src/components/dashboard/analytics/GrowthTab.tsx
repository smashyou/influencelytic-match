
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { MOCK_GROWTH_DATA } from './mockData';

interface GrowthTabProps {
  connectedPlatforms: string[];
}

const GrowthTab = ({ connectedPlatforms }: GrowthTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Follower Growth Analysis
        </CardTitle>
        <CardDescription>
          Track your follower count growth across platforms over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={MOCK_GROWTH_DATA}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {connectedPlatforms.includes('instagram') && (
                <Line type="monotone" dataKey="instagram" stroke="#E1306C" activeDot={{ r: 8 }} />
              )}
              {connectedPlatforms.includes('youtube') && (
                <Line type="monotone" dataKey="youtube" stroke="#FF0000" />
              )}
              {connectedPlatforms.includes('tiktok') && (
                <Line type="monotone" dataKey="tiktok" stroke="#69C9D0" />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-6 bg-muted p-4 rounded-md">
          <h4 className="font-medium mb-2">AI-Powered Growth Insights:</h4>
          <ul className="space-y-2">
            <li className="flex gap-2">
              <span>•</span> 
              <span className="text-sm text-muted-foreground">Your TikTok follower growth is 23% above industry average for your niche</span>
            </li>
            <li className="flex gap-2">
              <span>•</span> 
              <span className="text-sm text-muted-foreground">Instagram growth slowed in April - recommend posting more consistently (4-5 times per week)</span>
            </li>
            <li className="flex gap-2">
              <span>•</span> 
              <span className="text-sm text-muted-foreground">YouTube growth is steady, but could improve by publishing longer-form content (8+ minutes)</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default GrowthTab;
