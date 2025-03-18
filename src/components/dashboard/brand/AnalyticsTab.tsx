
import React, { useState } from 'react';
import AnalyticsHeader from './analytics/AnalyticsHeader';
import OverviewTabContent from './analytics/OverviewTabContent';
import FollowersTabContent from './analytics/FollowersTabContent';
import EngagementTabContent from './analytics/EngagementTabContent';
import DemographicsTabContent from './analytics/DemographicsTabContent';

const AnalyticsTab = () => {
  const [selectedInfluencer, setSelectedInfluencer] = useState('all');
  const [activeSubTab, setActiveSubTab] = useState('overview');
  
  return (
    <div className="space-y-4 md:space-y-6 w-full overflow-x-hidden">
      <AnalyticsHeader 
        selectedInfluencer={selectedInfluencer} 
        setSelectedInfluencer={setSelectedInfluencer} 
      />
      
      <div className="flex space-x-4 mb-4 border-b">
        <button 
          className={`pb-2 px-4 ${activeSubTab === 'overview' ? 'border-b-2 border-primary font-medium' : 'text-muted-foreground'}`}
          onClick={() => setActiveSubTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`pb-2 px-4 ${activeSubTab === 'followers' ? 'border-b-2 border-primary font-medium' : 'text-muted-foreground'}`}
          onClick={() => setActiveSubTab('followers')}
        >
          Followers
        </button>
        <button 
          className={`pb-2 px-4 ${activeSubTab === 'engagement' ? 'border-b-2 border-primary font-medium' : 'text-muted-foreground'}`}
          onClick={() => setActiveSubTab('engagement')}
        >
          Engagement
        </button>
        <button 
          className={`pb-2 px-4 ${activeSubTab === 'demographics' ? 'border-b-2 border-primary font-medium' : 'text-muted-foreground'}`}
          onClick={() => setActiveSubTab('demographics')}
        >
          Demographics
        </button>
      </div>
      
      <div className="w-full">
        {activeSubTab === 'overview' && <OverviewTabContent />}
        {activeSubTab === 'followers' && <FollowersTabContent />}
        {activeSubTab === 'engagement' && <EngagementTabContent />}
        {activeSubTab === 'demographics' && <DemographicsTabContent />}
      </div>
    </div>
  );
};

export default AnalyticsTab;
