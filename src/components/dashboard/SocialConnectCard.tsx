import React, { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Instagram, Facebook, Youtube, Linkedin, Twitter, Globe } from 'lucide-react';
import { initiateSocialAuth } from '@/services/social-auth';
import { toast } from '@/components/ui/use-toast';

interface SocialConnectCardProps {
  platform: string;
  isConnected: boolean;
  onConnect: () => void;
}

const SocialConnectCard = ({ platform, isConnected, onConnect }: SocialConnectCardProps) => {
  const [isConnecting, setIsConnecting] = useState(false);

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return <Instagram className="h-8 w-8 text-pink-500" />;
      case 'facebook':
        return <Facebook className="h-8 w-8 text-blue-600" />;
      case 'youtube':
        return <Youtube className="h-8 w-8 text-red-600" />;
      case 'linkedin':
        return <Linkedin className="h-8 w-8 text-blue-700" />;
      case 'twitter':
        return <Twitter className="h-8 w-8 text-blue-400" />;
      case 'tiktok':
        return <div className="h-8 w-8 flex items-center justify-center text-black font-bold">TT</div>;
      case 'snapchat':
        return <div className="h-8 w-8 flex items-center justify-center text-yellow-400 font-bold">SC</div>;
      default:
        return <Globe className="h-8 w-8 text-gray-500" />;
    }
  };

  const getPlatformName = (platform: string) => {
    switch (platform) {
      case 'twitter':
        return 'X / Twitter';
      default:
        return platform.charAt(0).toUpperCase() + platform.slice(1);
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    
    try {
      // This would be replaced with actual OAuth flow
      if (platform === 'instagram') {
        // For Instagram, we have an implementation
        const result = await initiateSocialAuth(platform as any);
        
        if (result) {
          toast({
            title: "Connection successful",
            description: `Your ${getPlatformName(platform)} account is now connected`,
            variant: "default",
          });
          onConnect();
        }
      } else {
        // For other platforms, we show a message
        toast({
          title: "Coming Soon",
          description: `Integration with ${getPlatformName(platform)} is coming soon`,
          variant: "default",
        });
      }
    } catch (error: any) {
      toast({
        title: "Connection failed",
        description: error.message || `Failed to connect to ${getPlatformName(platform)}`,
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Card className="overflow-hidden border shadow-sm transition-all hover:shadow-md">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center p-4">
          <div className="mb-4 p-3 rounded-full bg-muted">{getPlatformIcon(platform)}</div>
          <h3 className="font-semibold text-lg mb-2">{getPlatformName(platform)}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {isConnected
              ? `Your ${getPlatformName(platform)} account is connected`
              : `Connect your ${getPlatformName(platform)} account to track analytics`}
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center pb-6">
        <Button
          variant={isConnected ? "outline" : "default"}
          size="sm"
          onClick={handleConnect}
          disabled={isConnecting}
          className="w-full"
        >
          {isConnecting 
            ? "Connecting..." 
            : isConnected 
              ? "Reconnect" 
              : "Connect"
          }
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SocialConnectCard;
