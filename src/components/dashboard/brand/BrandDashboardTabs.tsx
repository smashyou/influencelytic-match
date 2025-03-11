
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import CampaignsTab from './CampaignsTab';
import InfluencerSearchTab from './InfluencerSearchTab';
import AnalyticsTab from './AnalyticsTab';

const BrandDashboardTabs = () => {
  return (
    <Tabs defaultValue="campaigns" className="w-full">
      <TabsList className="mb-6 md:mb-8 w-full flex justify-start overflow-x-auto">
        <TabsTrigger value="campaigns" className="flex-1 md:flex-none">Campaigns</TabsTrigger>
        <TabsTrigger value="influencers" className="flex-1 md:flex-none">Find Influencers</TabsTrigger>
        <TabsTrigger value="analytics" className="flex-1 md:flex-none">Analytics</TabsTrigger>
      </TabsList>
      
      <TabsContent value="campaigns">
        <CampaignsTab />
      </TabsContent>
      
      <TabsContent value="influencers">
        <InfluencerSearchTab />
      </TabsContent>
      
      <TabsContent value="analytics">
        <AnalyticsTab />
      </TabsContent>
    </Tabs>
  );
};

export default BrandDashboardTabs;
