
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import CampaignsTab from './CampaignsTab';
import InfluencerSearchTab from './InfluencerSearchTab';
import AnalyticsTab from './AnalyticsTab';

const BrandDashboardTabs = () => {
  return (
    <Tabs defaultValue="campaigns" className="w-full">
      <TabsList className="mb-8">
        <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
        <TabsTrigger value="influencers">Find Influencers</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
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
