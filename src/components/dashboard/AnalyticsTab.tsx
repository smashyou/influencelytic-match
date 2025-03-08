
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface AnalyticsTabProps {
  connectedPlatforms: string[];
  navigateToPlatforms: () => void;
}

const AnalyticsTab = ({ connectedPlatforms, navigateToPlatforms }: AnalyticsTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Social Media Analytics</CardTitle>
        <CardDescription>
          Connect your platforms to see detailed analytics
        </CardDescription>
      </CardHeader>
      <CardContent>
        {connectedPlatforms.length > 0 ? (
          <div className="space-y-6">
            {connectedPlatforms.map(platform => (
              <div key={platform} className="p-4 border rounded-md">
                <h3 className="text-lg font-medium capitalize mb-2">{platform} Analytics</h3>
                <p className="text-muted-foreground">Detailed metrics will appear here after integration</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">No platforms connected yet</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={navigateToPlatforms}
            >
              Connect Platforms
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AnalyticsTab;
