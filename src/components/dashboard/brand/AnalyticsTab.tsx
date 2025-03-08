
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

// Mock data for charts
const MOCK_FOLLOWERS_DATA = [
  {
    name: 'Jan',
    instagram: 12500,
    youtube: 8400,
    tiktok: 15600,
  },
  {
    name: 'Feb',
    instagram: 13200,
    youtube: 9100,
    tiktok: 17200,
  },
  {
    name: 'Mar',
    instagram: 14100,
    youtube: 9800,
    tiktok: 19500,
  },
  {
    name: 'Apr',
    instagram: 15000,
    youtube: 10500,
    tiktok: 22000,
  },
  {
    name: 'May',
    instagram: 16200,
    youtube: 11200,
    tiktok: 24800,
  },
  {
    name: 'Jun',
    instagram: 17500,
    youtube: 12100,
    tiktok: 28000,
  },
];

const MOCK_ENGAGEMENT_DATA = [
  {
    name: 'Jan',
    instagram: 5.2,
    youtube: 7.8,
    tiktok: 9.2,
  },
  {
    name: 'Feb',
    instagram: 5.4,
    youtube: 7.5,
    tiktok: 9.5,
  },
  {
    name: 'Mar',
    instagram: 5.7,
    youtube: 7.9,
    tiktok: 9.8,
  },
  {
    name: 'Apr',
    instagram: 5.9,
    youtube: 8.2,
    tiktok: 10.1,
  },
  {
    name: 'May',
    instagram: 6.1,
    youtube: 8.4,
    tiktok: 10.5,
  },
  {
    name: 'Jun',
    instagram: 6.3,
    youtube: 8.7,
    tiktok: 10.8,
  },
];

const MOCK_DEMOGRAPHICS_DATA = [
  { name: '18-24', value: 35 },
  { name: '25-34', value: 40 },
  { name: '35-44', value: 15 },
  { name: '45+', value: 10 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const AnalyticsTab = () => {
  const [selectedInfluencer, setSelectedInfluencer] = useState('all');
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Influencer Analytics</h2>
        <Select 
          value={selectedInfluencer} 
          onValueChange={setSelectedInfluencer}
        >
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Select influencer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Influencers</SelectItem>
            <SelectItem value="emma">Emma Johnson</SelectItem>
            <SelectItem value="mike">Mike Chen</SelectItem>
            <SelectItem value="sophia">Sophia Rivera</SelectItem>
            <SelectItem value="james">James Wilson</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="followers">Followers</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Followers Growth</CardTitle>
                <CardDescription>
                  Follower count across platforms over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={MOCK_FOLLOWERS_DATA}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="instagram" stroke="#E1306C" activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="youtube" stroke="#FF0000" />
                      <Line type="monotone" dataKey="tiktok" stroke="#69C9D0" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Engagement Rate</CardTitle>
                <CardDescription>
                  Average engagement rate across platforms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={MOCK_ENGAGEMENT_DATA}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="instagram" stroke="#E1306C" activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="youtube" stroke="#FF0000" />
                      <Line type="monotone" dataKey="tiktok" stroke="#69C9D0" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Audience Demographics</CardTitle>
                <CardDescription>
                  Breakdown of audience demographics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={MOCK_DEMOGRAPHICS_DATA}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {MOCK_DEMOGRAPHICS_DATA.map((entry, index) => (
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
          </div>
        </TabsContent>
        
        <TabsContent value="followers">
          <Card>
            <CardHeader>
              <CardTitle>Followers Growth</CardTitle>
              <CardDescription>
                Detailed followers data across platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={MOCK_FOLLOWERS_DATA}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="instagram" stroke="#E1306C" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="youtube" stroke="#FF0000" />
                    <Line type="monotone" dataKey="tiktok" stroke="#69C9D0" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="engagement">
          <Card>
            <CardHeader>
              <CardTitle>Engagement Rate</CardTitle>
              <CardDescription>
                Detailed engagement metrics across platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={MOCK_ENGAGEMENT_DATA}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="instagram" stroke="#E1306C" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="youtube" stroke="#FF0000" />
                    <Line type="monotone" dataKey="tiktok" stroke="#69C9D0" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="demographics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Age Distribution</CardTitle>
                <CardDescription>
                  Breakdown of audience age groups
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={MOCK_DEMOGRAPHICS_DATA}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {MOCK_DEMOGRAPHICS_DATA.map((entry, index) => (
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
                <CardTitle>Geographic Distribution</CardTitle>
                <CardDescription>
                  Top countries and regions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { country: 'USA', value: 45 },
                        { country: 'UK', value: 15 },
                        { country: 'Canada', value: 12 },
                        { country: 'Australia', value: 8 },
                        { country: 'Germany', value: 6 },
                        { country: 'Other', value: 14 },
                      ]}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="country" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" name="Percentage" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsTab;
