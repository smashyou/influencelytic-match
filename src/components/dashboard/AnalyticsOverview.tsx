
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Instagram, Facebook, Youtube, Linkedin, Twitter, UserCheck, MessageSquare, ArrowUpRight } from 'lucide-react';

interface AnalyticsOverviewProps {
  connectedPlatforms: string[];
}

const AnalyticsOverview = ({ connectedPlatforms }: AnalyticsOverviewProps) => {
  // This would be replaced with actual API data
  const mockAnalytics = {
    totalFollowers: 128450,
    totalEngagement: 15680,
    recentGrowth: 2.7,
    platformBreakdown: [
      { platform: 'instagram', followers: 62400, engagement: 7840 },
      { platform: 'youtube', followers: 45700, engagement: 5730 },
      { platform: 'twitter', followers: 11350, engagement: 1250 },
      { platform: 'facebook', followers: 9000, engagement: 880 },
    ]
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return <Instagram className="h-5 w-5 text-pink-500" />;
      case 'facebook':
        return <Facebook className="h-5 w-5 text-blue-600" />;
      case 'youtube':
        return <Youtube className="h-5 w-5 text-red-600" />;
      case 'linkedin':
        return <Linkedin className="h-5 w-5 text-blue-700" />;
      case 'twitter':
        return <Twitter className="h-5 w-5 text-blue-400" />;
      default:
        return null;
    }
  };

  // Only show platforms that are connected
  const filteredBreakdown = mockAnalytics.platformBreakdown.filter(item => 
    connectedPlatforms.includes(item.platform)
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Followers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <UserCheck className="mr-2 h-4 w-4 text-muted-foreground" />
              <div className="text-2xl font-bold">
                {connectedPlatforms.length > 0 
                  ? mockAnalytics.totalFollowers.toLocaleString() 
                  : '—'}
              </div>
              {connectedPlatforms.length > 0 && (
                <div className="ml-auto flex items-center text-emerald-500 text-sm">
                  <ArrowUpRight className="mr-1 h-4 w-4" />
                  {mockAnalytics.recentGrowth}%
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <MessageSquare className="mr-2 h-4 w-4 text-muted-foreground" />
              <div className="text-2xl font-bold">
                {connectedPlatforms.length > 0 
                  ? mockAnalytics.totalEngagement.toLocaleString() 
                  : '—'}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Connected Platforms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{connectedPlatforms.length}</div>
            <div className="flex mt-2 gap-1">
              {connectedPlatforms.map(platform => (
                <div key={platform} className="p-1">
                  {getPlatformIcon(platform)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {connectedPlatforms.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Platform Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredBreakdown.map(item => (
                <div key={item.platform} className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center">
                    <div className="mr-3">{getPlatformIcon(item.platform)}</div>
                    <div>
                      <p className="font-medium capitalize">{item.platform}</p>
                      <p className="text-sm text-muted-foreground">{item.followers.toLocaleString()} followers</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{item.engagement.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">engagements</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground mb-4">Connect your social media platforms to see analytics</p>
            <Button 
              variant="outline" 
              onClick={() => document.querySelector('[data-value="platforms"]')?.click()}
            >
              Connect Platforms
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AnalyticsOverview;
