
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
  // Display the appropriate content based on the active tab
  const renderContent = () => {
    switch(activeTab) {
      case 'overview':
        return <AnalyticsOverview connectedPlatforms={connectedPlatforms} />;
      case 'platforms':
        return <PlatformsTab connectedPlatforms={connectedPlatforms} handleConnectPlatform={handleConnectPlatform} />;
      case 'opportunities':
        return <OpportunitiesTab />;
      case 'business-match':
        return <BusinessMatchTab />;
      case 'followers-analytics':
        return <FollowersAnalyticsTab connectedPlatforms={connectedPlatforms} navigateToPlatforms={navigateToPlatforms} />;
      default:
        return <AnalyticsOverview connectedPlatforms={connectedPlatforms} />;
    }
  };

  return (
    <div className="w-full">
      {renderContent()}
    </div>
  );
};

export default DashboardTabs;
