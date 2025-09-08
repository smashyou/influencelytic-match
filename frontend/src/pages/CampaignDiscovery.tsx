import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Search,
  Filter,
  DollarSign,
  Calendar,
  Users,
  Target,
  TrendingUp,
  ChevronRight,
  MapPin,
  Hash,
  Sparkles,
  Clock,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Campaign {
  id: string;
  title: string;
  description: string;
  campaign_type: string;
  budget_min: number;
  budget_max: number;
  currency: string;
  target_age_min: number;
  target_age_max: number;
  target_gender: string;
  target_locations: string[];
  target_interests: string[];
  required_platforms: string[];
  min_followers: number;
  max_followers: number | null;
  min_engagement_rate: number;
  application_deadline: string;
  campaign_start_date: string;
  campaign_end_date: string;
  status: string;
  max_applications: number | null;
  deliverables: string[];
  hashtags: string[];
  brand_id: string;
  created_at: string;
  
  // Joined data
  brand?: {
    company_name: string;
    logo_url: string;
    industry: string;
  };
  _count?: {
    applications: number;
  };
  match_score?: number;
}

interface Filters {
  search: string;
  platforms: string[];
  budgetMin: number;
  budgetMax: number;
  campaignType: string;
  location: string;
  sortBy: string;
}

const platformIcons: Record<string, string> = {
  instagram: '📷',
  tiktok: '🎵',
  youtube: '📹',
  twitter: '🐦',
  linkedin: '💼',
  facebook: '👥'
};

const campaignTypeLabels: Record<string, { label: string; color: string }> = {
  sponsored_post: { label: 'Sponsored Post', color: 'bg-blue-100 text-blue-700' },
  product_review: { label: 'Product Review', color: 'bg-purple-100 text-purple-700' },
  brand_ambassador: { label: 'Brand Ambassador', color: 'bg-green-100 text-green-700' },
  event_coverage: { label: 'Event Coverage', color: 'bg-orange-100 text-orange-700' },
  content_creation: { label: 'Content Creation', color: 'bg-pink-100 text-pink-700' }
};

export function CampaignDiscovery() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    search: '',
    platforms: [],
    budgetMin: 0,
    budgetMax: 10000,
    campaignType: '',
    location: '',
    sortBy: 'match_score'
  });
  const [activeTab, setActiveTab] = useState('all');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [appliedCampaigns, setAppliedCampaigns] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchUserProfile();
    fetchCampaigns();
    fetchUserApplications();
  }, [filters]);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user profile and connections
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      const { data: connections } = await supabase
        .from('social_connections')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      const { data: analytics } = await supabase
        .from('influencer_analytics')
        .select('*')
        .eq('user_id', user.id);

      setUserProfile({
        ...profile,
        connections,
        analytics
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchUserApplications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('campaign_applications')
        .select('campaign_id')
        .eq('influencer_id', user.id);

      if (data) {
        setAppliedCampaigns(new Set(data.map(app => app.campaign_id)));
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('campaigns')
        .select(`
          *,
          brand:brand_profiles!campaigns_brand_id_fkey(
            company_name,
            logo_url,
            industry
          )
        `)
        .eq('status', 'active')
        .gte('application_deadline', new Date().toISOString());

      // Apply filters
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters.campaignType) {
        query = query.eq('campaign_type', filters.campaignType);
      }

      if (filters.location) {
        query = query.contains('target_locations', [filters.location]);
      }

      if (filters.budgetMin > 0) {
        query = query.gte('budget_max', filters.budgetMin);
      }

      if (filters.budgetMax < 10000) {
        query = query.lte('budget_min', filters.budgetMax);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Calculate match scores if user has profile
      let processedCampaigns = data || [];
      if (userProfile) {
        processedCampaigns = await calculateMatchScores(processedCampaigns);
      }

      // Apply platform filter
      if (filters.platforms.length > 0) {
        processedCampaigns = processedCampaigns.filter(campaign => 
          campaign.required_platforms.some(platform => 
            filters.platforms.includes(platform)
          )
        );
      }

      // Sort campaigns
      processedCampaigns.sort((a, b) => {
        switch (filters.sortBy) {
          case 'match_score':
            return (b.match_score || 0) - (a.match_score || 0);
          case 'budget_high':
            return b.budget_max - a.budget_max;
          case 'budget_low':
            return a.budget_min - b.budget_min;
          case 'deadline':
            return new Date(a.application_deadline).getTime() - new Date(b.application_deadline).getTime();
          case 'newest':
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          default:
            return 0;
        }
      });

      setCampaigns(processedCampaigns);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast.error('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const calculateMatchScores = async (campaigns: Campaign[]) => {
    // Simple client-side match scoring (would be better on backend)
    return campaigns.map(campaign => {
      let score = 50; // Base score

      if (!userProfile) return { ...campaign, match_score: score };

      // Platform match
      const userPlatforms = userProfile.connections?.map((c: any) => c.platform) || [];
      const platformMatch = campaign.required_platforms.filter(p => 
        userPlatforms.includes(p)
      ).length / campaign.required_platforms.length;
      score += platformMatch * 20;

      // Follower count match
      const avgFollowers = userProfile.connections?.reduce((acc: number, c: any) => 
        acc + c.follower_count, 0
      ) / (userProfile.connections?.length || 1);
      
      if (avgFollowers >= campaign.min_followers && 
          (!campaign.max_followers || avgFollowers <= campaign.max_followers)) {
        score += 15;
      }

      // Engagement rate match
      const avgEngagement = userProfile.analytics?.reduce((acc: number, a: any) => 
        acc + a.engagement_rate, 0
      ) / (userProfile.analytics?.length || 1);
      
      if (avgEngagement >= campaign.min_engagement_rate) {
        score += 15;
      }

      return { ...campaign, match_score: Math.min(100, Math.round(score)) };
    });
  };

  const getFilteredCampaigns = () => {
    switch (activeTab) {
      case 'recommended':
        return campaigns.filter(c => (c.match_score || 0) >= 70);
      case 'new':
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        return campaigns.filter(c => new Date(c.created_at) > threeDaysAgo);
      case 'closing_soon':
        const weekFromNow = new Date();
        weekFromNow.setDate(weekFromNow.getDate() + 7);
        return campaigns.filter(c => new Date(c.application_deadline) < weekFromNow);
      default:
        return campaigns;
    }
  };

  const formatBudget = (min: number, max: number, currency: string = 'USD') => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0
    });
    return `${formatter.format(min)} - ${formatter.format(max)}`;
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const days = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (days < 0) return 'Expired';
    if (days === 0) return 'Today';
    if (days === 1) return '1 day left';
    return `${days} days left`;
  };

  const handleApply = (campaignId: string) => {
    navigate(`/campaigns/${campaignId}/apply`);
  };

  const filteredCampaigns = getFilteredCampaigns();

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Discover Campaigns</h1>
        <p className="text-muted-foreground">
          Find perfect brand partnerships that match your audience and content style
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search campaigns..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-10"
            />
          </div>
        </div>

        <Select
          value={filters.sortBy}
          onValueChange={(value) => setFilters({ ...filters, sortBy: value })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="match_score">Best Match</SelectItem>
            <SelectItem value="budget_high">Highest Budget</SelectItem>
            <SelectItem value="budget_low">Lowest Budget</SelectItem>
            <SelectItem value="deadline">Deadline</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
          </SelectContent>
        </Select>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filter Campaigns</SheetTitle>
              <SheetDescription>
                Narrow down campaigns to find the perfect match
              </SheetDescription>
            </SheetHeader>
            
            <div className="space-y-6 mt-6">
              {/* Platform Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Platforms</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(platformIcons).map(([platform, icon]) => (
                    <label key={platform} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filters.platforms.includes(platform)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilters({
                              ...filters,
                              platforms: [...filters.platforms, platform]
                            });
                          } else {
                            setFilters({
                              ...filters,
                              platforms: filters.platforms.filter(p => p !== platform)
                            });
                          }
                        }}
                        className="rounded"
                      />
                      <span>{icon}</span>
                      <span className="text-sm capitalize">{platform}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Budget Range */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Budget Range: ${filters.budgetMin} - ${filters.budgetMax}
                </label>
                <div className="space-y-2">
                  <Slider
                    min={0}
                    max={10000}
                    step={100}
                    value={[filters.budgetMin, filters.budgetMax]}
                    onValueChange={([min, max]) => 
                      setFilters({ ...filters, budgetMin: min, budgetMax: max })
                    }
                  />
                </div>
              </div>

              {/* Campaign Type */}
              <div>
                <label className="text-sm font-medium mb-2 block">Campaign Type</label>
                <Select
                  value={filters.campaignType}
                  onValueChange={(value) => setFilters({ ...filters, campaignType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All types</SelectItem>
                    <SelectItem value="sponsored_post">Sponsored Post</SelectItem>
                    <SelectItem value="product_review">Product Review</SelectItem>
                    <SelectItem value="brand_ambassador">Brand Ambassador</SelectItem>
                    <SelectItem value="event_coverage">Event Coverage</SelectItem>
                    <SelectItem value="content_creation">Content Creation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Location Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Location</label>
                <Select
                  value={filters.location}
                  onValueChange={(value) => setFilters({ ...filters, location: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All locations</SelectItem>
                    <SelectItem value="United States">United States</SelectItem>
                    <SelectItem value="Canada">Canada</SelectItem>
                    <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                    <SelectItem value="Australia">Australia</SelectItem>
                    <SelectItem value="Global">Global</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => setFilters({
                  search: '',
                  platforms: [],
                  budgetMin: 0,
                  budgetMax: 10000,
                  campaignType: '',
                  location: '',
                  sortBy: 'match_score'
                })}
              >
                Reset Filters
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Campaign Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">
            All Campaigns
            <Badge variant="secondary" className="ml-2">
              {campaigns.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="recommended">
            <Sparkles className="h-4 w-4 mr-1" />
            Recommended
          </TabsTrigger>
          <TabsTrigger value="new">
            New
          </TabsTrigger>
          <TabsTrigger value="closing_soon">
            <Clock className="h-4 w-4 mr-1" />
            Closing Soon
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Campaign Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-muted-foreground">No campaigns found matching your criteria</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setFilters({
                search: '',
                platforms: [],
                budgetMin: 0,
                budgetMax: 10000,
                campaignType: '',
                location: '',
                sortBy: 'match_score'
              })}
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((campaign) => (
            <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={campaign.brand?.logo_url} />
                      <AvatarFallback>
                        {campaign.brand?.company_name?.charAt(0) || 'B'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        {campaign.brand?.company_name || 'Brand'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {campaign.brand?.industry}
                      </p>
                    </div>
                  </div>
                  {campaign.match_score && (
                    <Badge variant="secondary" className="text-xs">
                      {campaign.match_score}% match
                    </Badge>
                  )}
                </div>
                
                <CardTitle className="line-clamp-2">{campaign.title}</CardTitle>
                
                <div className="flex items-center gap-2 mt-2">
                  <Badge 
                    className={campaignTypeLabels[campaign.campaign_type]?.color || ''}
                    variant="secondary"
                  >
                    {campaignTypeLabels[campaign.campaign_type]?.label}
                  </Badge>
                  {appliedCampaigns.has(campaign.id) && (
                    <Badge variant="outline" className="text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Applied
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {campaign.description}
                </p>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <DollarSign className="h-3 w-3" />
                      Budget
                    </span>
                    <span className="font-medium">
                      {formatBudget(campaign.budget_min, campaign.budget_max, campaign.currency)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Users className="h-3 w-3" />
                      Followers
                    </span>
                    <span className="font-medium">
                      {campaign.min_followers.toLocaleString()}+
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <TrendingUp className="h-3 w-3" />
                      Min Engagement
                    </span>
                    <span className="font-medium">
                      {campaign.min_engagement_rate}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      Deadline
                    </span>
                    <span className="font-medium text-orange-600">
                      {getDaysUntilDeadline(campaign.application_deadline)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {campaign.required_platforms.map(platform => (
                    <span key={platform} className="text-lg">
                      {platformIcons[platform]}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap gap-1">
                  {campaign.target_locations.slice(0, 2).map(location => (
                    <Badge key={location} variant="outline" className="text-xs">
                      <MapPin className="h-2 w-2 mr-1" />
                      {location}
                    </Badge>
                  ))}
                  {campaign.target_locations.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{campaign.target_locations.length - 2} more
                    </Badge>
                  )}
                </div>

                <Button
                  className="w-full"
                  onClick={() => handleApply(campaign.id)}
                  disabled={appliedCampaigns.has(campaign.id)}
                >
                  {appliedCampaigns.has(campaign.id) ? (
                    <>Applied</>
                  ) : (
                    <>
                      View Details
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}