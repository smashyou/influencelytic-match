import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
  ArrowLeft,
  DollarSign,
  Calendar,
  Users,
  Target,
  Hash,
  FileText,
  Link,
  Plus,
  X,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  MapPin,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const applicationSchema = z.object({
  proposed_rate: z.number().min(1, 'Please enter your rate'),
  application_message: z.string().min(50, 'Message must be at least 50 characters'),
  portfolio_links: z.array(z.string().url('Please enter valid URLs')),
  availability_confirmation: z.boolean().refine(val => val === true, {
    message: 'You must confirm your availability'
  })
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

interface Campaign {
  id: string;
  title: string;
  description: string;
  brief: string;
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
  max_fake_followers: number;
  deliverables: string[];
  hashtags: string[];
  content_guidelines: string;
  application_deadline: string;
  campaign_start_date: string;
  campaign_end_date: string;
  brand?: {
    company_name: string;
    logo_url: string;
    industry: string;
    description: string;
  };
}

interface UserProfile {
  connections: Array<{
    platform: string;
    follower_count: number;
    username: string;
  }>;
  analytics: Array<{
    platform: string;
    engagement_rate: number;
    fake_follower_percentage: number;
  }>;
}

export function CampaignApplication() {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [matchScore, setMatchScore] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [portfolioLink, setPortfolioLink] = useState('');
  const [alreadyApplied, setAlreadyApplied] = useState(false);

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      proposed_rate: 0,
      application_message: '',
      portfolio_links: [],
      availability_confirmation: false
    }
  });

  useEffect(() => {
    if (campaignId) {
      fetchCampaignDetails();
      fetchUserProfile();
      checkExistingApplication();
    }
  }, [campaignId]);

  const fetchCampaignDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select(`
          *,
          brand:brand_profiles!campaigns_brand_id_fkey(
            company_name,
            logo_url,
            industry,
            description
          )
        `)
        .eq('id', campaignId)
        .single();

      if (error) throw error;
      setCampaign(data);
    } catch (error) {
      console.error('Error fetching campaign:', error);
      toast.error('Failed to load campaign details');
      navigate('/campaigns');
    }
  };

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: connections } = await supabase
        .from('social_connections')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      const { data: analytics } = await supabase
        .from('influencer_analytics')
        .select('*')
        .eq('user_id', user.id);

      setUserProfile({ connections: connections || [], analytics: analytics || [] });
      
      // Calculate match score
      if (connections && analytics) {
        calculateMatchScore(connections, analytics);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkExistingApplication = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('campaign_applications')
        .select('id')
        .eq('campaign_id', campaignId)
        .eq('influencer_id', user.id)
        .single();

      if (data) {
        setAlreadyApplied(true);
      }
    } catch (error) {
      // No existing application
    }
  };

  const calculateMatchScore = (connections: any[], analytics: any[]) => {
    if (!campaign) return;
    
    let score = 50;

    // Platform match
    const userPlatforms = connections.map(c => c.platform);
    const platformMatch = campaign.required_platforms.filter(p => 
      userPlatforms.includes(p)
    ).length / campaign.required_platforms.length;
    score += platformMatch * 20;

    // Follower count match
    const avgFollowers = connections.reduce((acc, c) => 
      acc + c.follower_count, 0
    ) / connections.length;
    
    if (avgFollowers >= campaign.min_followers && 
        (!campaign.max_followers || avgFollowers <= campaign.max_followers)) {
      score += 15;
    }

    // Engagement rate match
    const avgEngagement = analytics.reduce((acc, a) => 
      acc + a.engagement_rate, 0
    ) / analytics.length;
    
    if (avgEngagement >= campaign.min_engagement_rate) {
      score += 15;
    }

    setMatchScore(Math.min(100, Math.round(score)));
  };

  const addPortfolioLink = () => {
    if (portfolioLink && portfolioLink.startsWith('http')) {
      const currentLinks = form.getValues('portfolio_links');
      form.setValue('portfolio_links', [...currentLinks, portfolioLink]);
      setPortfolioLink('');
    } else {
      toast.error('Please enter a valid URL');
    }
  };

  const removePortfolioLink = (index: number) => {
    const currentLinks = form.getValues('portfolio_links');
    form.setValue('portfolio_links', currentLinks.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ApplicationFormData) => {
    if (!campaign || alreadyApplied) return;

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Call AI matching service to get match score
      const aiMatchResponse = await fetch(`${import.meta.env.VITE_AI_SERVICE_URL}/match`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': import.meta.env.VITE_AI_SERVICE_API_KEY
        },
        body: JSON.stringify({
          influencer_data: {
            user_id: user.id,
            platforms: userProfile?.connections.map(c => c.platform) || [],
            follower_count: userProfile?.connections.reduce((acc, c) => acc + c.follower_count, 0) || 0,
            engagement_rate: userProfile?.analytics[0]?.engagement_rate || 0,
            // ... other influencer data
          },
          campaign_data: {
            campaign_id: campaign.id,
            brand_id: campaign.brand_id,
            required_platforms: campaign.required_platforms,
            min_followers: campaign.min_followers,
            // ... other campaign data
          }
        })
      });

      const aiMatch = await aiMatchResponse.json();

      // Create application
      const { error } = await supabase
        .from('campaign_applications')
        .insert({
          campaign_id: campaign.id,
          influencer_id: user.id,
          proposed_rate: data.proposed_rate,
          currency: campaign.currency,
          application_message: data.application_message,
          portfolio_links: data.portfolio_links,
          ai_match_score: aiMatch.total_score || matchScore,
          status: 'pending'
        });

      if (error) throw error;

      // Create notification for brand
      await supabase.from('notifications').insert({
        user_id: campaign.brand_id,
        type: 'new_application',
        title: 'New Campaign Application',
        message: `You have a new application for "${campaign.title}"`,
        data: { campaign_id: campaign.id, influencer_id: user.id }
      });

      toast.success('Application submitted successfully!');
      navigate('/dashboard/applications');
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="py-12">
            <div className="text-center">Loading campaign details...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="py-12">
            <div className="text-center">Campaign not found</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getDaysUntilDeadline = (deadline: string) => {
    const days = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const deadlineDays = getDaysUntilDeadline(campaign.application_deadline);
  const isExpired = deadlineDays < 0;

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => navigate('/campaigns')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Campaigns
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Campaign Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={campaign.brand?.logo_url} />
                    <AvatarFallback>
                      {campaign.brand?.company_name?.charAt(0) || 'B'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{campaign.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      by {campaign.brand?.company_name} • {campaign.brand?.industry}
                    </p>
                  </div>
                </div>
                <Badge variant={isExpired ? 'destructive' : 'secondary'}>
                  {isExpired ? 'Expired' : `${deadlineDays} days left`}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Campaign Description</h3>
                <p className="text-muted-foreground">{campaign.description}</p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-2">Campaign Brief</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{campaign.brief}</p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-2">Deliverables</h3>
                <ul className="space-y-2">
                  {campaign.deliverables.map((deliverable, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span className="text-sm">{deliverable}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {campaign.content_guidelines && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-2">Content Guidelines</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {campaign.content_guidelines}
                    </p>
                  </div>
                </>
              )}

              {campaign.hashtags.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-2">Required Hashtags</h3>
                    <div className="flex flex-wrap gap-2">
                      {campaign.hashtags.map((tag, index) => (
                        <Badge key={index} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Application Form */}
          {alreadyApplied ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Already Applied</AlertTitle>
              <AlertDescription>
                You have already submitted an application for this campaign.
                You can view your application status in your dashboard.
              </AlertDescription>
            </Alert>
          ) : isExpired ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Applications Closed</AlertTitle>
              <AlertDescription>
                The application deadline for this campaign has passed.
              </AlertDescription>
            </Alert>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Submit Your Application</CardTitle>
                <CardDescription>
                  Tell the brand why you're perfect for this campaign
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="proposed_rate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Rate ({campaign.currency})</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder={`Budget: ${campaign.budget_min} - ${campaign.budget_max}`}
                              {...field}
                              onChange={e => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Enter your rate for the complete campaign deliverables
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="application_message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Why You're Perfect For This Campaign</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Explain your experience, content style, and why you're a great fit..."
                              className="min-h-[150px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Minimum 50 characters. Be specific about your experience and ideas.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="portfolio_links"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Portfolio Links</FormLabel>
                          <div className="flex gap-2">
                            <Input
                              placeholder="https://example.com/portfolio"
                              value={portfolioLink}
                              onChange={(e) => setPortfolioLink(e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  addPortfolioLink();
                                }
                              }}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={addPortfolioLink}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="space-y-2 mt-2">
                            {field.value?.map((link, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <Link className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm flex-1 truncate">{link}</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removePortfolioLink(index)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                          <FormDescription>
                            Add links to relevant work samples
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="availability_confirmation"
                      render={({ field }) => (
                        <FormItem className="flex items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="mt-1"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              I confirm my availability
                            </FormLabel>
                            <FormDescription>
                              I am available from {new Date(campaign.campaign_start_date).toLocaleDateString()} 
                              {' '}to {new Date(campaign.campaign_end_date).toLocaleDateString()} 
                              {' '}and can deliver all requirements on time.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={submitting}
                    >
                      {submitting ? 'Submitting...' : 'Submit Application'}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Match Score */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Match Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-center">
                  <div className="text-3xl font-bold">{matchScore}%</div>
                  <p className="text-sm text-muted-foreground">
                    {matchScore >= 80 ? 'Excellent Match' :
                     matchScore >= 60 ? 'Good Match' :
                     matchScore >= 40 ? 'Fair Match' : 'Low Match'}
                  </p>
                </div>
                <Progress value={matchScore} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Campaign Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Budget Range</span>
                <span className="font-medium">
                  ${campaign.budget_min} - ${campaign.budget_max}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Min Followers</span>
                <span className="font-medium">
                  {campaign.min_followers.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Min Engagement</span>
                <span className="font-medium">{campaign.min_engagement_rate}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Max Fake Followers</span>
                <span className="font-medium">{campaign.max_fake_followers}%</span>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-2">Platforms</p>
                <div className="flex flex-wrap gap-2">
                  {campaign.required_platforms.map(platform => (
                    <Badge key={platform} variant="outline" className="capitalize">
                      {platform}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Locations</p>
                <div className="flex flex-wrap gap-2">
                  {campaign.target_locations.map(location => (
                    <Badge key={location} variant="outline">
                      <MapPin className="h-3 w-3 mr-1" />
                      {location}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Application Deadline</span>
                <span className="font-medium">
                  {new Date(campaign.application_deadline).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Campaign Start</span>
                <span className="font-medium">
                  {new Date(campaign.campaign_start_date).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Campaign End</span>
                <span className="font-medium">
                  {new Date(campaign.campaign_end_date).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}