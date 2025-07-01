
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { UserCheck } from 'lucide-react';
import { MOCK_DEMOGRAPHICS_AGE, MOCK_DEMOGRAPHICS_GENDER, MOCK_LOCATIONS, COLORS } from './mockData';

const DemographicsTab = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Age Distribution</CardTitle>
          <CardDescription>Breakdown by age groups</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={MOCK_DEMOGRAPHICS_AGE}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {MOCK_DEMOGRAPHICS_AGE.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Gender Distribution</CardTitle>
          <CardDescription>Breakdown by gender</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={MOCK_DEMOGRAPHICS_GENDER}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {MOCK_DEMOGRAPHICS_GENDER.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Geographic Distribution</CardTitle>
          <CardDescription>Top follower locations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={MOCK_LOCATIONS}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
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

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-primary" />
            Demographic Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-md">
            <h4 className="font-medium mb-2">AI-Powered Demographic Insights:</h4>
            <ul className="space-y-2">
              <li className="flex gap-2">
                <span>•</span> 
                <span className="text-sm text-muted-foreground">Your audience is primarily millennial and Gen Z (18-34), making you ideal for youth-focused brands</span>
              </li>
              <li className="flex gap-2">
                <span>•</span> 
                <span className="text-sm text-muted-foreground">Female audience (62%) is significantly higher than your niche average (54%)</span>
              </li>
              <li className="flex gap-2">
                <span>•</span> 
                <span className="text-sm text-muted-foreground">Your international audience (58%) is more diverse than typical accounts in your category (42%)</span>
              </li>
              <li className="flex gap-2">
                <span>•</span> 
                <span className="text-sm text-muted-foreground">Growing audience in Australia (+27% this quarter) suggests opportunity for regional partnerships</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DemographicsTab;
