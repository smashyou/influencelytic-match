
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MOCK_GROWTH_DATA, MOCK_ENGAGEMENT_DATA, MOCK_DEMOGRAPHICS_AGE, MOCK_LOCATIONS, COLORS } from './mockData';

interface OverviewTabProps {
  connectedPlatforms: string[];
}

const OverviewTab = ({ connectedPlatforms }: OverviewTabProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Follower Growth</CardTitle>
          <CardDescription>Across all platforms</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Engagement Rate (%)</CardTitle>
          <CardDescription>Average engagement by platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Audience Age Distribution</CardTitle>
          <CardDescription>Breakdown by age groups</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={MOCK_DEMOGRAPHICS_AGE}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {MOCK_DEMOGRAPHICS_AGE.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Top Follower Locations</CardTitle>
          <CardDescription>Geographic distribution</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={MOCK_LOCATIONS}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8">
                  {MOCK_LOCATIONS.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OverviewTab;
