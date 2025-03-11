
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import AnalyticsHeader from './analytics/AnalyticsHeader';
import OverviewTabContent from './analytics/OverviewTabContent';
import FollowersTabContent from './analytics/FollowersTabContent';
import EngagementTabContent from './analytics/EngagementTabContent';
import DemographicsTabContent from './analytics/DemographicsTabContent';

const AnalyticsTab = () => {
  const [selectedInfluencer, setSelectedInfluencer] = useState('all');
  
  return (
    <div className="space-y-4 md:space-y-6 w-full overflow-x-hidden">
      <AnalyticsHeader 
        selectedInfluencer={selectedInfluencer} 
        setSelectedInfluencer={setSelectedInfluencer} 
      />
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full flex mb-4 overflow-x-auto no-scrollbar">
          <TabsTrigger value="overview" className="flex-1 text-sm">Overview</TabsTrigger>
          <TabsTrigger value="followers" className="flex-1 text-sm">Followers</TabsTrigger>
          <TabsTrigger value="engagement" className="flex-1 text-sm">Engagement</TabsTrigger>
          <TabsTrigger value="demographics" className="flex-1 text-sm">Demographics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="w-full">
          <OverviewTabContent />
        </TabsContent>
        
        <TabsContent value="followers" className="w-full">
          <FollowersTabContent />
        </TabsContent>
        
        <TabsContent value="engagement" className="w-full">
          <EngagementTabContent />
        </TabsContent>
        
        <TabsContent value="demographics" className="w-full">
          <DemographicsTabContent />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsTab;
