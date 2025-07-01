
import React from 'react';
import CampaignsTab from './CampaignsTab';
import InfluencerSearchTab from './InfluencerSearchTab';
import AnalyticsTab from './AnalyticsTab';

interface BrandDashboardTabsProps {
  activeTab?: string;
}

const BrandDashboardTabs = ({ activeTab = 'campaigns' }: BrandDashboardTabsProps) => {
  return (
    <div className="w-full">
      {activeTab === 'campaigns' && <CampaignsTab />}
      {activeTab === 'influencers' && <InfluencerSearchTab />}
      {activeTab === 'analytics' && <AnalyticsTab />}
    </div>
  );
};

export default BrandDashboardTabs;
