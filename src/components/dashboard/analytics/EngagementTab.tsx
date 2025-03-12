
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity } from 'lucide-react';
import { MOCK_ENGAGEMENT_DATA } from './mockData';

interface EngagementTabProps {
  connectedPlatforms: string[];
}

const EngagementTab = ({ connectedPlatforms }: EngagementTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Engagement Analysis
        </CardTitle>
        <CardDescription>
          Track engagement metrics across all your platforms
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={MOCK_ENGAGEMENT_DATA}
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <h4 className="font-medium mb-1">Instagram</h4>
              <div className="text-2xl font-bold text-primary">4.5%</div>
              <p className="text-xs text-muted-foreground">vs. 2.1% industry average</p>
              <div className="text-xs text-emerald-500 mt-1">+2.4% above average</div>
            </CardContent>
          </Card>
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <h4 className="font-medium mb-1">YouTube</h4>
              <div className="text-2xl font-bold text-primary">5.2%</div>
              <p className="text-xs text-muted-foreground">vs. 4.0% industry average</p>
              <div className="text-xs text-emerald-500 mt-1">+1.2% above average</div>
            </CardContent>
          </Card>
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <h4 className="font-medium mb-1">TikTok</h4>
              <div className="text-2xl font-bold text-primary">6.5%</div>
              <p className="text-xs text-muted-foreground">vs. 5.8% industry average</p>
              <div className="text-xs text-emerald-500 mt-1">+0.7% above average</div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 bg-muted p-4 rounded-md">
          <h4 className="font-medium mb-2">AI-Powered Engagement Insights:</h4>
          <ul className="space-y-2">
            <li className="flex gap-2">
              <span>•</span> 
              <span className="text-sm text-muted-foreground">Your Instagram engagement peaks on Wednesdays and Sundays - consider posting more on these days</span>
            </li>
            <li className="flex gap-2">
              <span>•</span> 
              <span className="text-sm text-muted-foreground">Video content receives 34% more engagement than static posts across all platforms</span>
            </li>
            <li className="flex gap-2">
              <span>•</span> 
              <span className="text-sm text-muted-foreground">Content featuring product reviews generates the highest comment rates (8.1%)</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default EngagementTab;
