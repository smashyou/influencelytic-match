
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
      <TabsList className="mb-6 md:mb-8 w-full flex justify-start overflow-x-auto">
        <TabsTrigger value="overview" className="flex-1 md:flex-none">Overview</TabsTrigger>
        <TabsTrigger value="platforms" className="flex-1 md:flex-none">Platforms</TabsTrigger>
        <TabsTrigger value="analytics" className="flex-1 md:flex-none">Analytics</TabsTrigger>
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
