
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';

// Mock data for influencers
const MOCK_INFLUENCERS = [
  {
    id: '1',
    name: 'Emma Johnson',
    username: '@emmastyle',
    avatar: 'https://i.pravatar.cc/150?img=1',
    platform: 'instagram',
    followers: 125000,
    engagementRate: 5.2,
    niche: 'Fashion & Lifestyle',
    demographics: {
      ageRange: '18-24',
      genderSplit: '80% Female',
      location: 'United States, UK'
    },
    stats: {
      averageLikes: 4500,
      averageComments: 250,
      averageViews: 35000
    }
  },
  {
    id: '2',
    name: 'Mike Chen',
    username: '@mikefitlife',
    avatar: 'https://i.pravatar.cc/150?img=2',
    platform: 'youtube',
    followers: 450000,
    engagementRate: 7.8,
    niche: 'Fitness & Health',
    demographics: {
      ageRange: '25-34',
      genderSplit: '65% Male',
      location: 'Canada, US, Australia'
    },
    stats: {
      averageLikes: 15000,
      averageComments: 1200,
      averageViews: 120000
    }
  },
  {
    id: '3',
    name: 'Sophia Rivera',
    username: '@sophiacooks',
    avatar: 'https://i.pravatar.cc/150?img=3',
    platform: 'tiktok',
    followers: 890000,
    engagementRate: 9.2,
    niche: 'Cooking & Food',
    demographics: {
      ageRange: '18-35',
      genderSplit: '70% Female',
      location: 'United States, Mexico, Spain'
    },
    stats: {
      averageLikes: 45000,
      averageComments: 3500,
      averageViews: 220000
    }
  },
  {
    id: '4',
    name: 'James Wilson',
    username: '@jamestechtips',
    avatar: 'https://i.pravatar.cc/150?img=4',
    platform: 'youtube',
    followers: 720000,
    engagementRate: 6.4,
    niche: 'Technology & Gadgets',
    demographics: {
      ageRange: '25-44',
      genderSplit: '75% Male',
      location: 'United States, UK, Germany'
    },
    stats: {
      averageLikes: 30000,
      averageComments: 4200,
      averageViews: 180000
    }
  }
];

const InfluencerSearchTab = () => {
  const [filters, setFilters] = useState({
    platform: '',
    niche: '',
    minFollowers: 0,
    minEngagementRate: 0,
    ageRange: '',
    location: '',
  });
  const [influencers, setInfluencers] = useState(MOCK_INFLUENCERS);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

  const handlePlatformToggle = (platform: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform) 
        : [...prev, platform]
    );
  };

  const handleFilterChange = (name: string, value: any) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    let filtered = MOCK_INFLUENCERS;
    
    if (selectedPlatforms.length > 0) {
      filtered = filtered.filter(inf => selectedPlatforms.includes(inf.platform));
    }
    
    if (filters.niche) {
      filtered = filtered.filter(inf => inf.niche.toLowerCase().includes(filters.niche.toLowerCase()));
    }
    
    if (filters.minFollowers > 0) {
      filtered = filtered.filter(inf => inf.followers >= filters.minFollowers);
    }
    
    if (filters.minEngagementRate > 0) {
      filtered = filtered.filter(inf => inf.engagementRate >= filters.minEngagementRate);
    }
    
    if (filters.location) {
      filtered = filtered.filter(inf => 
        inf.demographics.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }
    
    setInfluencers(filtered);
  };

  const resetFilters = () => {
    setFilters({
      platform: '',
      niche: '',
      minFollowers: 0,
      minEngagementRate: 0,
      ageRange: '',
      location: '',
    });
    setSelectedPlatforms([]);
    setInfluencers(MOCK_INFLUENCERS);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>
              Refine your search to find the perfect influencers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="text-base">Platforms</Label>
              <div className="flex flex-wrap gap-2">
                {['instagram', 'youtube', 'tiktok', 'facebook', 'twitter', 'linkedin'].map(platform => (
                  <div key={platform} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`platform-${platform}`} 
                      checked={selectedPlatforms.includes(platform)}
                      onCheckedChange={() => handlePlatformToggle(platform)}
                    />
                    <label 
                      htmlFor={`platform-${platform}`}
                      className="text-sm capitalize cursor-pointer"
                    >
                      {platform}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="niche">Niche/Category</Label>
              <Input 
                id="niche" 
                placeholder="e.g., Fashion, Fitness..." 
                value={filters.niche}
                onChange={(e) => handleFilterChange('niche', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="followers">Minimum Followers</Label>
                <span className="text-sm text-muted-foreground">
                  {filters.minFollowers.toLocaleString()}+
                </span>
              </div>
              <Slider 
                id="followers"
                min={0}
                max={1000000}
                step={10000}
                value={[filters.minFollowers]}
                onValueChange={(value) => handleFilterChange('minFollowers', value[0])}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="engagement">Minimum Engagement Rate</Label>
                <span className="text-sm text-muted-foreground">
                  {filters.minEngagementRate}%+
                </span>
              </div>
              <Slider 
                id="engagement"
                min={0}
                max={20}
                step={0.5}
                value={[filters.minEngagementRate]}
                onValueChange={(value) => handleFilterChange('minEngagementRate', value[0])}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input 
                id="location" 
                placeholder="e.g., United States, Europe..." 
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
              />
            </div>
            
            <div className="pt-2 space-y-2">
              <Button onClick={applyFilters} className="w-full">Apply Filters</Button>
              <Button variant="outline" onClick={resetFilters} className="w-full">Reset</Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="md:col-span-3">
        <h2 className="text-xl font-semibold mb-4">Results ({influencers.length} Influencers)</h2>
        
        {influencers.length > 0 ? (
          <div className="space-y-4">
            {influencers.map(influencer => (
              <Card key={influencer.id} className="overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="w-full md:w-1/4 p-4 flex flex-col items-center justify-center bg-muted/20">
                    <div className="w-20 h-20 rounded-full overflow-hidden mb-3">
                      <img 
                        src={influencer.avatar} 
                        alt={influencer.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="font-semibold text-center">{influencer.name}</h3>
                    <p className="text-sm text-muted-foreground text-center">{influencer.username}</p>
                    <p className="text-xs mt-1 capitalize px-2 py-1 rounded-full bg-primary/10 text-primary">
                      {influencer.platform}
                    </p>
                  </div>
                  
                  <div className="w-full md:w-3/4 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Profile Stats</h4>
                        <p className="mt-1">
                          <span className="font-semibold">{influencer.followers.toLocaleString()}</span>
                          <span className="text-muted-foreground text-sm"> Followers</span>
                        </p>
                        <p className="mt-1">
                          <span className="font-semibold">{influencer.engagementRate}%</span>
                          <span className="text-muted-foreground text-sm"> Engagement Rate</span>
                        </p>
                        <p className="mt-1">
                          <span className="font-semibold">{influencer.niche}</span>
                          <span className="text-muted-foreground text-sm"> Niche</span>
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Audience Demographics</h4>
                        <p className="mt-1">
                          <span className="text-muted-foreground text-sm">Age: </span>
                          <span className="font-semibold">{influencer.demographics.ageRange}</span>
                        </p>
                        <p className="mt-1">
                          <span className="text-muted-foreground text-sm">Gender: </span>
                          <span className="font-semibold">{influencer.demographics.genderSplit}</span>
                        </p>
                        <p className="mt-1">
                          <span className="text-muted-foreground text-sm">Location: </span>
                          <span className="font-semibold">{influencer.demographics.location}</span>
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Average Performance</h4>
                        <p className="mt-1">
                          <span className="text-muted-foreground text-sm">Likes: </span>
                          <span className="font-semibold">{influencer.stats.averageLikes.toLocaleString()}</span>
                        </p>
                        <p className="mt-1">
                          <span className="text-muted-foreground text-sm">Comments: </span>
                          <span className="font-semibold">{influencer.stats.averageComments.toLocaleString()}</span>
                        </p>
                        <p className="mt-1">
                          <span className="text-muted-foreground text-sm">Views: </span>
                          <span className="font-semibold">{influencer.stats.averageViews.toLocaleString()}</span>
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex justify-end">
                      <Button size="sm">View Full Profile</Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-muted/40">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">No influencers found matching your criteria</p>
              <Button variant="outline" onClick={resetFilters}>Reset Filters</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default InfluencerSearchTab;
