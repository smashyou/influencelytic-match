
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { MOCK_FOLLOWERS_DATA, MOCK_ENGAGEMENT_DATA, MOCK_DEMOGRAPHICS_DATA, COLORS } from './mockData';

const OverviewTabContent = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      <Card>
        <CardHeader className="p-3 md:p-4">
          <CardTitle className="text-base md:text-lg">Followers Growth</CardTitle>
          <CardDescription className="text-xs md:text-sm">
            Follower count across platforms over time
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 md:p-4">
          <div className="h-[200px] md:h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={MOCK_FOLLOWERS_DATA}
                margin={{
                  top: 5,
                  right: 10,
                  left: 0,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{fontSize: 10}} />
                <YAxis tick={{fontSize: 10}} />
                <Tooltip />
                <Legend iconSize={8} wrapperStyle={{fontSize: '10px'}} />
                <Line type="monotone" dataKey="instagram" stroke="#E1306C" activeDot={{ r: 6 }} strokeWidth={1.5} />
                <Line type="monotone" dataKey="youtube" stroke="#FF0000" strokeWidth={1.5} />
                <Line type="monotone" dataKey="tiktok" stroke="#69C9D0" strokeWidth={1.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="p-3 md:p-4">
          <CardTitle className="text-base md:text-lg">Engagement Rate</CardTitle>
          <CardDescription className="text-xs md:text-sm">
            Average engagement rate across platforms
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 md:p-4">
          <div className="h-[200px] md:h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={MOCK_ENGAGEMENT_DATA}
                margin={{
                  top: 5,
                  right: 10,
                  left: 0,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{fontSize: 10}} />
                <YAxis tick={{fontSize: 10}} />
                <Tooltip />
                <Legend iconSize={8} wrapperStyle={{fontSize: '10px'}} />
                <Line type="monotone" dataKey="instagram" stroke="#E1306C" activeDot={{ r: 6 }} strokeWidth={1.5} />
                <Line type="monotone" dataKey="youtube" stroke="#FF0000" strokeWidth={1.5} />
                <Line type="monotone" dataKey="tiktok" stroke="#69C9D0" strokeWidth={1.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <Card className="md:col-span-2">
        <CardHeader className="p-3 md:p-4">
          <CardTitle className="text-base md:text-lg">Audience Demographics</CardTitle>
          <CardDescription className="text-xs md:text-sm">
            Breakdown of audience demographics
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 md:p-4">
          <div className="h-[200px] md:h-[250px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={MOCK_DEMOGRAPHICS_DATA}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {MOCK_DEMOGRAPHICS_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconSize={8} wrapperStyle={{fontSize: '10px'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OverviewTabContent;
