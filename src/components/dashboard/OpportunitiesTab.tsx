import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, MapPin, Users, DollarSign, Tag } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

// Campaign type definition
interface Campaign {
  id: string;
  title: string;
  brand: string;
  description: string;
  audienceAge: string;
  audienceGender: string;
  location: string;
  campaignType: string;
  estimatedEarnings: string;
  category: string;
  platform: string;
}

const OpportunitiesTab = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    audienceAge: "",
    audienceGender: "",
    location: "",
    campaignType: "",
    category: "",
    earnings: [0, 2000]
  });

  // Fetch campaigns from the database
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const { data, error } = await supabase
          .from('campaigns')
          .select('*')
          .eq('status', 'active');
        
        if (error) {
          console.error('Error fetching campaigns:', error);
          setCampaigns(MOCK_CAMPAIGNS);
          setFilteredCampaigns(MOCK_CAMPAIGNS);
        } else if (data && data.length > 0) {
          const formattedCampaigns: Campaign[] = data.map(campaign => ({
            id: campaign.id,
            title: campaign.title,
            brand: campaign.brand_name || 'Unknown Brand',
            description: campaign.description || '',
            audienceAge: campaign.audience_age || '18-34',
            audienceGender: campaign.audience_gender || 'All',
            location: campaign.location || 'Global',
            campaignType: campaign.campaign_type || 'National',
            estimatedEarnings: campaign.estimated_earnings || '$500-$1000',
            category: campaign.category || 'General',
            platform: campaign.platform || 'instagram',
          }));
          
          setCampaigns(formattedCampaigns);
          setFilteredCampaigns(formattedCampaigns);
        } else {
          setCampaigns(MOCK_CAMPAIGNS);
          setFilteredCampaigns(MOCK_CAMPAIGNS);
        }
      } catch (error) {
        console.error('Error:', error);
        setCampaigns(MOCK_CAMPAIGNS);
        setFilteredCampaigns(MOCK_CAMPAIGNS);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const results = campaigns.filter(campaign => 
      campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.brand.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredCampaigns(results);
  };

  const applyFilters = () => {
    let results = campaigns;
    
    if (filters.audienceAge) {
      results = results.filter(campaign => campaign.audienceAge === filters.audienceAge);
    }
    
    if (filters.audienceGender) {
      results = results.filter(campaign => campaign.audienceGender === filters.audienceGender);
    }
    
    if (filters.location) {
      results = results.filter(campaign => campaign.location.includes(filters.location));
    }
    
    if (filters.campaignType) {
      results = results.filter(campaign => campaign.campaignType === filters.campaignType);
    }
    
    if (filters.category) {
      results = results.filter(campaign => campaign.category === filters.category);
    }
    
    results = results.filter(campaign => {
      const minEarning = parseInt(campaign.estimatedEarnings.split('-')[0].replace(/\D/g, ''));
      return minEarning >= filters.earnings[0] && minEarning <= filters.earnings[1];
    });
    
    setFilteredCampaigns(results);
  };

  const resetFilters = () => {
    setFilters({
      audienceAge: "",
      audienceGender: "",
      location: "",
      campaignType: "",
      category: "",
      earnings: [0, 2000]
    });
    setFilteredCampaigns(campaigns);
  };

  const handleApply = async (campaignId: string) => {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData.user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to apply for campaigns",
          variant: "destructive",
        });
        return;
      }
      
      const { error } = await supabase
        .from('campaign_applications')
        .insert({
          campaign_id: campaignId,
          user_id: userData.user.id,
          status: 'pending',
          applied_at: new Date().toISOString(),
        });
      
      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Already applied",
            description: "You have already applied to this campaign",
            variant: "default",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Application submitted",
          description: "Your application has been submitted successfully",
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Error applying to campaign:', error);
      toast({
        title: "Application failed",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch(platform) {
      case 'instagram':
        return '📱';
      case 'tiktok':
        return '🎵';
      case 'youtube':
        return '🎥';
      default:
        return '📱';
    }
  };

  const MOCK_CAMPAIGNS: Campaign[] = [
    {
      id: "1",
      title: "Summer Fashion Collection",
      brand: "StyleHub",
      description: "Promote our new summer fashion collection on Instagram with creative photoshoots.",
      audienceAge: "18-34",
      audienceGender: "All",
      location: "United States",
      campaignType: "National",
      estimatedEarnings: "$1,200-$1,800",
      category: "Fashion",
      platform: "instagram",
    },
    {
      id: "2",
      title: "Fitness App Launch",
      brand: "FitLife",
      description: "Create engaging content showcasing our new fitness app features and your workout routine.",
      audienceAge: "24-45",
      audienceGender: "All",
      location: "Global",
      campaignType: "National",
      estimatedEarnings: "$800-$1,500",
      category: "Fitness",
      platform: "tiktok",
    },
    {
      id: "3",
      title: "Local Coffee Shop Promotion",
      brand: "BrewMorning",
      description: "Visit our coffee shop and create authentic content about your experience.",
      audienceAge: "18-35",
      audienceGender: "All",
      location: "Los Angeles, CA",
      campaignType: "Local",
      estimatedEarnings: "$300-$500",
      category: "Food & Beverage",
      platform: "instagram",
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Find Campaign Opportunities</CardTitle>
          <CardDescription>
            Discover active brand campaigns that match your audience and style
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2 mb-4">
            <Input 
              placeholder="Search for campaigns, brands, or keywords..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" variant="default">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </form>

          {showFilters && (
            <div className="p-4 border rounded-md mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="audience-age">Target Audience Age</Label>
                <Select 
                  value={filters.audienceAge} 
                  onValueChange={(value) => setFilters({...filters, audienceAge: value})}
                >
                  <SelectTrigger id="audience-age">
                    <SelectValue placeholder="Select age range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="13-17">13-17</SelectItem>
                    <SelectItem value="18-24">18-24</SelectItem>
                    <SelectItem value="18-34">18-34</SelectItem>
                    <SelectItem value="24-45">24-45</SelectItem>
                    <SelectItem value="35-50">35-50</SelectItem>
                    <SelectItem value="50+">50+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="audience-gender">Target Audience Gender</Label>
                <Select 
                  value={filters.audienceGender} 
                  onValueChange={(value) => setFilters({...filters, audienceGender: value})}
                >
                  <SelectTrigger id="audience-gender">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All</SelectItem>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input 
                  id="location" 
                  placeholder="Country, region, or city" 
                  value={filters.location}
                  onChange={(e) => setFilters({...filters, location: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="campaign-type">Campaign Type</Label>
                <Select 
                  value={filters.campaignType} 
                  onValueChange={(value) => setFilters({...filters, campaignType: value})}
                >
                  <SelectTrigger id="campaign-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="National">National</SelectItem>
                    <SelectItem value="Local">Local</SelectItem>
                    <SelectItem value="Global">Global</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Industry / Category</Label>
                <Select 
                  value={filters.category} 
                  onValueChange={(value) => setFilters({...filters, category: value})}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fashion">Fashion</SelectItem>
                    <SelectItem value="Beauty">Beauty</SelectItem>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Food & Beverage">Food & Beverage</SelectItem>
                    <SelectItem value="Fitness">Fitness</SelectItem>
                    <SelectItem value="Travel">Travel</SelectItem>
                    <SelectItem value="Gaming">Gaming</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Estimated Earnings</Label>
                <div className="pt-5 px-2">
                  <Slider 
                    value={filters.earnings}
                    onValueChange={(value) => setFilters({...filters, earnings: value as [number, number]})}
                    max={2000}
                    step={100}
                    className="mt-2"
                  />
                  <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                    <span>${filters.earnings[0]}</span>
                    <span>${filters.earnings[1]}+</span>
                  </div>
                </div>
              </div>

              <div className="col-span-full flex gap-2 mt-2">
                <Button 
                  type="button" 
                  variant="default" 
                  onClick={applyFilters} 
                  className="flex-1"
                >
                  Apply Filters
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetFilters}
                >
                  Reset
                </Button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading campaigns...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCampaigns.length > 0 ? (
                filteredCampaigns.map(campaign => (
                  <Card key={campaign.id} className="overflow-hidden">
                    <div className="border-l-4 border-primary p-4 flex flex-col gap-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            {campaign.title} 
                            <span>{getPlatformIcon(campaign.platform)}</span>
                          </h3>
                          <p className="text-sm text-muted-foreground">By {campaign.brand}</p>
                        </div>
                        <Badge variant="outline" className="bg-primary/10 text-primary">
                          {campaign.category}
                        </Badge>
                      </div>
                      
                      <p className="text-sm">{campaign.description}</p>
                      
                      <Separator className="my-1" />
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>Age: {campaign.audienceAge}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{campaign.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          <span>{campaign.campaignType}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          <span className="font-medium text-green-600">{campaign.estimatedEarnings}</span>
                        </div>
                      </div>
                      
                      <div className="mt-2">
                        <Button size="sm" onClick={() => handleApply(campaign.id)}>Apply Now</Button>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No campaigns found matching your criteria.</p>
                  <Button variant="outline" onClick={resetFilters} className="mt-2">Reset Filters</Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OpportunitiesTab;
