
import React from 'react';
import SocialConnectCard from './SocialConnectCard';

interface PlatformsTabProps {
  connectedPlatforms: string[];
  handleConnectPlatform: (platform: string) => void;
}

const PlatformsTab = ({ connectedPlatforms, handleConnectPlatform }: PlatformsTabProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <SocialConnectCard 
        platform="instagram" 
        isConnected={connectedPlatforms.includes('instagram')} 
        onConnect={() => handleConnectPlatform('instagram')} 
      />
      <SocialConnectCard 
        platform="facebook" 
        isConnected={connectedPlatforms.includes('facebook')} 
        onConnect={() => handleConnectPlatform('facebook')} 
      />
      <SocialConnectCard 
        platform="tiktok" 
        isConnected={connectedPlatforms.includes('tiktok')} 
        onConnect={() => handleConnectPlatform('tiktok')} 
      />
      <SocialConnectCard 
        platform="youtube" 
        isConnected={connectedPlatforms.includes('youtube')} 
        onConnect={() => handleConnectPlatform('youtube')} 
      />
      <SocialConnectCard 
        platform="twitter" 
        isConnected={connectedPlatforms.includes('twitter')} 
        onConnect={() => handleConnectPlatform('twitter')} 
      />
      <SocialConnectCard 
        platform="linkedin" 
        isConnected={connectedPlatforms.includes('linkedin')} 
        onConnect={() => handleConnectPlatform('linkedin')} 
      />
      <SocialConnectCard 
        platform="snapchat" 
        isConnected={connectedPlatforms.includes('snapchat')} 
        onConnect={() => handleConnectPlatform('snapchat')} 
      />
    </div>
  );
};

export default PlatformsTab;
