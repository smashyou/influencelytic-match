
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { MOCK_DEMOGRAPHICS_DATA, MOCK_GEOGRAPHIC_DATA, COLORS } from './mockData';

const DemographicsTabContent = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      <Card>
        <CardHeader className="p-3 md:p-4">
          <CardTitle className="text-base md:text-lg">Age Distribution</CardTitle>
          <CardDescription className="text-xs md:text-sm">
            Breakdown of audience age groups
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 md:p-4">
          <div className="h-[200px] md:h-[250px]">
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
      
      <Card>
        <CardHeader className="p-3 md:p-4">
          <CardTitle className="text-base md:text-lg">Geographic Distribution</CardTitle>
          <CardDescription className="text-xs md:text-sm">
            Top countries and regions
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 md:p-4">
          <div className="h-[200px] md:h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={MOCK_GEOGRAPHIC_DATA}
                margin={{
                  top: 5,
                  right: 10,
                  left: 0,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="country" tick={{fontSize: 10}} />
                <YAxis tick={{fontSize: 10}} />
                <Tooltip />
                <Legend iconSize={8} wrapperStyle={{fontSize: '10px'}} />
                <Bar dataKey="value" name="Percentage" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DemographicsTabContent;
