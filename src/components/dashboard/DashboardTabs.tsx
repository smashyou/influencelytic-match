
import React from 'react';
import AnalyticsOverview from './AnalyticsOverview';
import PlatformsTab from './PlatformsTab';
import OpportunitiesTab from './OpportunitiesTab';
import BusinessMatchTab from './BusinessMatchTab';
import FollowersAnalyticsTab from './FollowersAnalyticsTab';

interface DashboardTabsProps {
  connectedPlatforms: string[];
  handleConnectPlatform: (platform: string) => void;
  navigateToPlatforms: () => void;
  activeTab: string;
}

const DashboardTabs = ({ 
  connectedPlatforms, 
  handleConnectPlatform,
  navigateToPlatforms,
  activeTab
}: DashboardTabsProps) => {
  return (
    <div className="w-full">
      {activeTab === 'overview' && <AnalyticsOverview connectedPlatforms={connectedPlatforms} />}
      {activeTab === 'platforms' && <PlatformsTab connectedPlatforms={connectedPlatforms} handleConnectPlatform={handleConnectPlatform} />}
      {activeTab === 'opportunities' && <OpportunitiesTab />}
      {activeTab === 'business-match' && <BusinessMatchTab />}
      {activeTab === 'followers-analytics' && (
        <FollowersAnalyticsTab 
          connectedPlatforms={connectedPlatforms} 
          navigateToPlatforms={navigateToPlatforms} 
        />
      )}
    </div>
  );
};

export default DashboardTabs;
