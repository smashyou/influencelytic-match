
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
    <div className="space-y-4 md:space-y-6 w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-4">
        <h2 className="text-xl font-semibold">Influencer Analytics</h2>
        <Select 
          value={selectedInfluencer} 
          onValueChange={setSelectedInfluencer}
        >
          <SelectTrigger className="w-full sm:w-[220px]">
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
        <TabsList className="w-full flex mb-4 overflow-x-auto no-scrollbar">
          <TabsTrigger value="overview" className="flex-1 text-sm">Overview</TabsTrigger>
          <TabsTrigger value="followers" className="flex-1 text-sm">Followers</TabsTrigger>
          <TabsTrigger value="engagement" className="flex-1 text-sm">Engagement</TabsTrigger>
          <TabsTrigger value="demographics" className="flex-1 text-sm">Demographics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="w-full">
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
        </TabsContent>
        
        <TabsContent value="followers" className="w-full">
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
        </TabsContent>
        
        <TabsContent value="engagement" className="w-full">
          <Card>
            <CardHeader className="p-3 md:p-4">
              <CardTitle className="text-base md:text-lg">Engagement Rate</CardTitle>
              <CardDescription className="text-xs md:text-sm">
                Detailed engagement metrics across platforms
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 md:p-4">
              <div className="h-[250px] md:h-[350px]">
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
        </TabsContent>
        
        <TabsContent value="demographics" className="w-full">
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsTab;
