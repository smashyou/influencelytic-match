
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertTriangle, TrendingUp, Users, Activity, UserCheck, ShieldAlert } from 'lucide-react';

interface FollowersAnalyticsTabProps {
  connectedPlatforms: string[];
  navigateToPlatforms: () => void;
}

// Mock data for analytics
const MOCK_GROWTH_DATA = [
  { name: 'Jan', instagram: 12400, youtube: 8500, tiktok: 15000 },
  { name: 'Feb', instagram: 13200, youtube: 9000, tiktok: 17500 },
  { name: 'Mar', instagram: 14100, youtube: 9800, tiktok: 21000 },
  { name: 'Apr', instagram: 15000, youtube: 10500, tiktok: 25000 },
  { name: 'May', instagram: 16200, youtube: 11200, tiktok: 29000 },
  { name: 'Jun', instagram: 17500, youtube: 12000, tiktok: 33000 },
];

const MOCK_ENGAGEMENT_DATA = [
  { name: 'Jan', instagram: 3.2, youtube: 4.5, tiktok: 5.8 },
  { name: 'Feb', instagram: 3.5, youtube: 4.2, tiktok: 6.1 },
  { name: 'Mar', instagram: 3.9, youtube: 4.7, tiktok: 5.9 },
  { name: 'Apr', instagram: 3.6, youtube: 5.1, tiktok: 6.3 },
  { name: 'May', instagram: 4.1, youtube: 4.9, tiktok: 6.2 },
  { name: 'Jun', instagram: 4.5, youtube: 5.2, tiktok: 6.5 },
];

const MOCK_DEMOGRAPHICS_AGE = [
  { name: '13-17', value: 5 },
  { name: '18-24', value: 35 },
  { name: '25-34', value: 30 },
  { name: '35-44', value: 18 },
  { name: '45-54', value: 8 },
  { name: '55+', value: 4 },
];

const MOCK_DEMOGRAPHICS_GENDER = [
  { name: 'Female', value: 62 },
  { name: 'Male', value: 36 },
  { name: 'Other', value: 2 },
];

const MOCK_LOCATIONS = [
  { name: 'United States', value: 42 },
  { name: 'United Kingdom', value: 12 },
  { name: 'Canada', value: 8 },
  { name: 'Australia', value: 7 },
  { name: 'Germany', value: 5 },
  { name: 'Others', value: 26 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#AF19FF'];

const FollowersAnalyticsTab = ({ connectedPlatforms, navigateToPlatforms }: FollowersAnalyticsTabProps) => {
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("6m");

  if (connectedPlatforms.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">
            Connect your social media platforms to see follower analytics
          </p>
          <Button onClick={navigateToPlatforms}>
            Connect Platforms
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Followers Analytics
        </h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              {connectedPlatforms.map(platform => (
                <SelectItem key={platform} value={platform}>
                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-full sm:w-[100px]">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">1 Month</SelectItem>
              <SelectItem value="3m">3 Months</SelectItem>
              <SelectItem value="6m">6 Months</SelectItem>
              <SelectItem value="1y">1 Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-6 w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="growth">Follower Growth</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
          <TabsTrigger value="fake-detection">Fake Follower Detection</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
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
        </TabsContent>

        <TabsContent value="growth">
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
        </TabsContent>

        <TabsContent value="engagement">
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
        </TabsContent>

        <TabsContent value="demographics">
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
        </TabsContent>

        <TabsContent value="fake-detection">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-primary" />
                Fake Follower Detection
              </CardTitle>
              <CardDescription>
                AI-powered analysis of your follower authenticity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card className="bg-emerald-50 dark:bg-emerald-950/20">
                  <CardContent className="p-4">
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Overall Authenticity Score</h4>
                    <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-500">93%</div>
                    <p className="text-xs text-muted-foreground mt-1">Excellent score - well above average</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Suspected Fake Followers</h4>
                    <div className="text-3xl font-bold">7%</div>
                    <p className="text-xs text-muted-foreground mt-1">Industry average: 12%</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Bot Activity Score</h4>
                    <div className="text-3xl font-bold">Low</div>
                    <p className="text-xs text-muted-foreground mt-1">Minimal suspicious activity detected</p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-2">Platform Breakdown</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Instagram</span>
                        <span className="text-sm font-medium">95% Authentic</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: '95%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">YouTube</span>
                        <span className="text-sm font-medium">92% Authentic</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: '92%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">TikTok</span>
                        <span className="text-sm font-medium">88% Authentic</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: '88%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-md">
                  <h4 className="font-medium mb-2">AI-Powered Authenticity Insights:</h4>
                  <ul className="space-y-2">
                    <li className="flex gap-2">
                      <span>•</span> 
                      <span className="text-sm text-muted-foreground">Your overall follower authenticity is excellent at 93%, above the industry average of 88%</span>
                    </li>
                    <li className="flex gap-2">
                      <span>•</span> 
                      <span className="text-sm text-muted-foreground">TikTok has slightly more suspicious accounts than your other platforms, but still within normal range</span>
                    </li>
                    <li className="flex gap-2">
                      <span>•</span> 
                      <span className="text-sm text-muted-foreground">Your engagement to follower ratio confirms genuine audience interest in your content</span>
                    </li>
                    <li className="flex gap-2">
                      <span>•</span> 
                      <span className="text-sm text-muted-foreground">Natural follower growth patterns suggest organic reach rather than artificial inflation</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-primary/5 p-4 rounded-md border border-primary/20">
                  <h4 className="font-medium text-primary mb-2">Why This Matters to Businesses:</h4>
                  <p className="text-sm text-muted-foreground">
                    Brands value authentic audiences that drive real engagement and conversions. Your high authenticity score makes you more attractive for partnerships and typically results in higher collaboration rates. We highlight this score to potential business partners to showcase your genuine influence.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FollowersAnalyticsTab;
