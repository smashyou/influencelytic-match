
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import AnalyticsOverview from './AnalyticsOverview';
import PlatformsTab from './PlatformsTab';
import AnalyticsTab from './AnalyticsTab';

interface DashboardTabsProps {
  connectedPlatforms: string[];
  handleConnectPlatform: (platform: string) => void;
  navigateToPlatforms: () => void;
}

const DashboardTabs = ({ 
  connectedPlatforms, 
  handleConnectPlatform,
  navigateToPlatforms 
}: DashboardTabsProps) => {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="mb-8">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="platforms">Platforms</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview">
        <AnalyticsOverview connectedPlatforms={connectedPlatforms} />
      </TabsContent>
      
      <TabsContent value="platforms">
        <PlatformsTab 
          connectedPlatforms={connectedPlatforms} 
          handleConnectPlatform={handleConnectPlatform} 
        />
      </TabsContent>
      
      <TabsContent value="analytics">
        <AnalyticsTab 
          connectedPlatforms={connectedPlatforms} 
          navigateToPlatforms={navigateToPlatforms} 
        />
      </TabsContent>
    </Tabs>
  );
};

export default DashboardTabs;
