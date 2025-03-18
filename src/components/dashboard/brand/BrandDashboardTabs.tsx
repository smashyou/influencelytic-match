
import React, { useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import CampaignsTab from './CampaignsTab';
import InfluencerSearchTab from './InfluencerSearchTab';
import AnalyticsTab from './AnalyticsTab';
import { useNavigate } from 'react-router-dom';

interface BrandDashboardTabsProps {
  activeTab?: string;
}

const BrandDashboardTabs = ({ activeTab = 'campaigns' }: BrandDashboardTabsProps) => {
  const navigate = useNavigate();

  const handleTabChange = (value: string) => {
    navigate(`/brand-dashboard?tab=${value}`, { replace: true });
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="mb-6 md:mb-8 w-full flex justify-start overflow-x-auto no-scrollbar">
        <TabsTrigger value="campaigns" className="flex-1 md:flex-none text-sm md:text-base">Campaigns</TabsTrigger>
        <TabsTrigger value="influencers" className="flex-1 md:flex-none text-sm md:text-base">Find Influencers</TabsTrigger>
        <TabsTrigger value="analytics" className="flex-1 md:flex-none text-sm md:text-base">Analytics</TabsTrigger>
      </TabsList>
      
      <TabsContent value="campaigns" className="w-full">
        <CampaignsTab />
      </TabsContent>
      
      <TabsContent value="influencers" className="w-full">
        <InfluencerSearchTab />
      </TabsContent>
      
      <TabsContent value="analytics" className="w-full">
        <AnalyticsTab />
      </TabsContent>
    </Tabs>
  );
};

export default BrandDashboardTabs;
