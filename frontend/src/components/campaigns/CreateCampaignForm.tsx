import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, DollarSign, Users, Target, Hash, FileText, AlertCircle } from 'lucide-react';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const campaignSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  brief: z.string().min(50, 'Campaign brief must be at least 50 characters'),
  campaign_type: z.enum(['sponsored_post', 'product_review', 'brand_ambassador', 'event_coverage', 'content_creation']),
  budget_min: z.number().min(50, 'Minimum budget must be at least $50'),
  budget_max: z.number().min(50, 'Maximum budget must be at least $50'),
  
  // Target audience
  target_age_min: z.number().min(13).max(65),
  target_age_max: z.number().min(13).max(65),
  target_gender: z.enum(['all', 'male', 'female']),
  target_locations: z.array(z.string()).min(1, 'Select at least one location'),
  target_interests: z.array(z.string()).min(1, 'Select at least one interest'),
  
  // Influencer requirements
  required_platforms: z.array(z.string()).min(1, 'Select at least one platform'),
  min_followers: z.number().min(100),
  max_followers: z.number().optional(),
  min_engagement_rate: z.number().min(0.5).max(20),
  max_fake_followers: z.number().min(0).max(50),
  
  // Campaign details
  deliverables: z.array(z.string()).min(1, 'Add at least one deliverable'),
  hashtags: z.array(z.string()),
  content_guidelines: z.string(),
  
  // Dates
  application_deadline: z.string(),
  campaign_start_date: z.string(),
  campaign_end_date: z.string(),
  
  // Options
  max_applications: z.number().optional(),
  auto_approve: z.boolean().default(false),
});

type CampaignFormData = z.infer<typeof campaignSchema>;

const platformOptions = [
  { value: 'instagram', label: 'Instagram', icon: '📷' },
  { value: 'tiktok', label: 'TikTok', icon: '🎵' },
  { value: 'youtube', label: 'YouTube', icon: '📹' },
  { value: 'twitter', label: 'Twitter', icon: '🐦' },
  { value: 'linkedin', label: 'LinkedIn', icon: '💼' },
];

const interestOptions = [
  'Fashion', 'Beauty', 'Fitness', 'Travel', 'Food', 
  'Technology', 'Gaming', 'Music', 'Art', 'Photography',
  'Lifestyle', 'Business', 'Education', 'Entertainment', 'Sports'
];

const locationOptions = [
  'United States', 'Canada', 'United Kingdom', 'Australia',
  'Germany', 'France', 'Japan', 'Brazil', 'India', 'Global'
];

export function CreateCampaignForm() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState('basics');
  const [deliverableInput, setDeliverableInput] = useState('');
  const [hashtagInput, setHashtagInput] = useState('');

  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      campaign_type: 'sponsored_post',
      target_gender: 'all',
      target_age_min: 18,
      target_age_max: 35,
      min_followers: 1000,
      min_engagement_rate: 2.0,
      max_fake_followers: 20,
      required_platforms: [],
      target_locations: [],
      target_interests: [],
      deliverables: [],
      hashtags: [],
      auto_approve: false,
    },
  });

  const onSubmit = async (data: CampaignFormData) => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create campaign
      const { data: campaign, error } = await supabase
        .from('campaigns')
        .insert({
          brand_id: user.id,
          ...data,
          status: 'draft',
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Campaign created successfully!');
      navigate(`/dashboard/campaigns/${campaign.id}`);
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast.error('Failed to create campaign');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addDeliverable = () => {
    if (deliverableInput.trim()) {
      const current = form.getValues('deliverables');
      form.setValue('deliverables', [...current, deliverableInput.trim()]);
      setDeliverableInput('');
    }
  };

  const addHashtag = () => {
    if (hashtagInput.trim()) {
      const tag = hashtagInput.trim().startsWith('#') 
        ? hashtagInput.trim() 
        : `#${hashtagInput.trim()}`;
      const current = form.getValues('hashtags');
      form.setValue('hashtags', [...current, tag]);
      setHashtagInput('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create New Campaign</CardTitle>
          <CardDescription>
            Define your campaign requirements and find the perfect influencers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs value={currentStep} onValueChange={setCurrentStep}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basics">Basics</TabsTrigger>
                  <TabsTrigger value="audience">Audience</TabsTrigger>
                  <TabsTrigger value="requirements">Requirements</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                </TabsList>

                <TabsContent value="basics" className="space-y-4 mt-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Campaign Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Summer Fashion Collection Launch" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="campaign_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Campaign Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select campaign type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="sponsored_post">Sponsored Post</SelectItem>
                            <SelectItem value="product_review">Product Review</SelectItem>
                            <SelectItem value="brand_ambassador">Brand Ambassador</SelectItem>
                            <SelectItem value="event_coverage">Event Coverage</SelectItem>
                            <SelectItem value="content_creation">Content Creation</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Short Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Brief description of your campaign..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          This will be shown in campaign listings
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="brief"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Campaign Brief</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Detailed campaign brief, objectives, and expectations..."
                            className="min-h-[150px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Provide detailed information for influencers
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="budget_min"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Minimum Budget ($)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="500"
                              {...field}
                              onChange={e => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="budget_max"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum Budget ($)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="5000"
                              {...field}
                              onChange={e => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setCurrentStep('audience')}
                  >
                    Next: Target Audience
                  </Button>
                </TabsContent>

                <TabsContent value="audience" className="space-y-4 mt-6">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="target_age_min"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age Range: {field.value} - {form.watch('target_age_max')}</FormLabel>
                          <FormControl>
                            <div className="flex gap-4 items-center">
                              <span className="text-sm">Min</span>
                              <Slider
                                min={13}
                                max={65}
                                step={1}
                                value={[field.value]}
                                onValueChange={([value]) => field.onChange(value)}
                                className="flex-1"
                              />
                              <span className="text-sm">Max</span>
                              <Slider
                                min={13}
                                max={65}
                                step={1}
                                value={[form.watch('target_age_max')]}
                                onValueChange={([value]) => form.setValue('target_age_max', value)}
                                className="flex-1"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="target_gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Gender</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="all">All Genders</SelectItem>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="target_locations"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Locations</FormLabel>
                          <div className="grid grid-cols-2 gap-2">
                            {locationOptions.map(location => (
                              <label key={location} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  value={location}
                                  checked={field.value?.includes(location)}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    const current = field.value || [];
                                    if (e.target.checked) {
                                      field.onChange([...current, value]);
                                    } else {
                                      field.onChange(current.filter(v => v !== value));
                                    }
                                  }}
                                  className="rounded"
                                />
                                <span className="text-sm">{location}</span>
                              </label>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="target_interests"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Interests</FormLabel>
                          <div className="flex flex-wrap gap-2">
                            {interestOptions.map(interest => (
                              <Badge
                                key={interest}
                                variant={field.value?.includes(interest) ? 'default' : 'outline'}
                                className="cursor-pointer"
                                onClick={() => {
                                  const current = field.value || [];
                                  if (current.includes(interest)) {
                                    field.onChange(current.filter(v => v !== interest));
                                  } else {
                                    field.onChange([...current, interest]);
                                  }
                                }}
                              >
                                {interest}
                              </Badge>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep('basics')}
                    >
                      Previous
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setCurrentStep('requirements')}
                    >
                      Next: Influencer Requirements
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="requirements" className="space-y-4 mt-6">
                  <FormField
                    control={form.control}
                    name="required_platforms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Required Platforms</FormLabel>
                        <div className="grid grid-cols-2 gap-3">
                          {platformOptions.map(platform => (
                            <label 
                              key={platform.value} 
                              className={`
                                flex items-center space-x-2 p-3 rounded-lg border cursor-pointer
                                ${field.value?.includes(platform.value) 
                                  ? 'border-primary bg-primary/5' 
                                  : 'border-gray-200'
                                }
                              `}
                            >
                              <input
                                type="checkbox"
                                value={platform.value}
                                checked={field.value?.includes(platform.value)}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  const current = field.value || [];
                                  if (e.target.checked) {
                                    field.onChange([...current, value]);
                                  } else {
                                    field.onChange(current.filter(v => v !== value));
                                  }
                                }}
                                className="rounded"
                              />
                              <span className="text-lg">{platform.icon}</span>
                              <span className="text-sm font-medium">{platform.label}</span>
                            </label>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="min_followers"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Minimum Followers</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="1000"
                              {...field}
                              onChange={e => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="max_followers"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum Followers (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="No limit"
                              {...field}
                              onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="min_engagement_rate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Minimum Engagement Rate: {field.value}%
                        </FormLabel>
                        <FormControl>
                          <Slider
                            min={0.5}
                            max={20}
                            step={0.5}
                            value={[field.value]}
                            onValueChange={([value]) => field.onChange(value)}
                          />
                        </FormControl>
                        <FormDescription>
                          Average engagement rate across platforms
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="max_fake_followers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Maximum Fake Followers: {field.value}%
                        </FormLabel>
                        <FormControl>
                          <Slider
                            min={0}
                            max={50}
                            step={5}
                            value={[field.value]}
                            onValueChange={([value]) => field.onChange(value)}
                          />
                        </FormControl>
                        <FormDescription>
                          AI will detect and filter fake followers
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep('audience')}
                    >
                      Previous
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setCurrentStep('details')}
                    >
                      Next: Campaign Details
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="details" className="space-y-4 mt-6">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="deliverables"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Deliverables</FormLabel>
                          <div className="flex gap-2">
                            <Input
                              placeholder="e.g., 3 Instagram posts"
                              value={deliverableInput}
                              onChange={(e) => setDeliverableInput(e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  addDeliverable();
                                }
                              }}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={addDeliverable}
                            >
                              Add
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {field.value?.map((deliverable, index) => (
                              <Badge key={index} variant="secondary">
                                {deliverable}
                                <button
                                  type="button"
                                  className="ml-2 text-xs"
                                  onClick={() => {
                                    field.onChange(field.value.filter((_, i) => i !== index));
                                  }}
                                >
                                  ×
                                </button>
                              </Badge>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="hashtags"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Required Hashtags</FormLabel>
                          <div className="flex gap-2">
                            <Input
                              placeholder="Enter hashtag"
                              value={hashtagInput}
                              onChange={(e) => setHashtagInput(e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  addHashtag();
                                }
                              }}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={addHashtag}
                            >
                              Add
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {field.value?.map((tag, index) => (
                              <Badge key={index} variant="outline">
                                {tag}
                                <button
                                  type="button"
                                  className="ml-2 text-xs"
                                  onClick={() => {
                                    field.onChange(field.value.filter((_, i) => i !== index));
                                  }}
                                >
                                  ×
                                </button>
                              </Badge>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="content_guidelines"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Content Guidelines</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Specific guidelines for content creation..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="application_deadline"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Application Deadline</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="campaign_start_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Campaign Start</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="campaign_end_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Campaign End</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="max_applications"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Max Applications (Optional)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="No limit"
                                {...field}
                                onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                              />
                            </FormControl>
                            <FormDescription>
                              Limit the number of applications
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="auto_approve"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Auto-approve
                              </FormLabel>
                              <FormDescription>
                                Automatically approve high-match influencers
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep('requirements')}
                    >
                      Previous
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Creating...' : 'Create Campaign'}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Campaign Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Be specific about your expectations and deliverables</p>
          <p>• Set realistic budgets based on influencer tier and platform</p>
          <p>• Allow enough time between deadline and campaign start</p>
          <p>• Use clear hashtags and brand mentions</p>
          <p>• Consider micro-influencers (1K-10K followers) for higher engagement</p>
        </CardContent>
      </Card>
    </div>
  );
}