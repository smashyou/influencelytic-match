
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MOCK_FOLLOWERS_DATA } from './mockData';

const FollowersTabContent = () => {
  return (
    <Card>
      <CardHeader className="p-3 md:p-4">
        <CardTitle className="text-base md:text-lg">Followers Growth</CardTitle>
        <CardDescription className="text-xs md:text-sm">
          Detailed followers data across platforms
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3 md:p-4">
        <div className="h-[250px] md:h-[350px]">
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
  );
};

export default FollowersTabContent;
