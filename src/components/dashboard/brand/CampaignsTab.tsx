
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const CampaignsTab = () => {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    monetizationMethod: '',
    budget: '',
    platform: '',
    duration: '',
    targetAudience: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Here you would normally send this to your backend
    const newCampaign = {
      id: Date.now().toString(),
      ...formData,
      status: 'Active',
      createdAt: new Date().toISOString(),
    };
    
    setCampaigns(prev => [...prev, newCampaign]);
    setShowForm(false);
    setFormData({
      title: '',
      description: '',
      monetizationMethod: '',
      budget: '',
      platform: '',
      duration: '',
      targetAudience: '',
    });
    
    toast({
      title: "Campaign created",
      description: "Your campaign has been created successfully.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Your Campaigns</h2>
        <Button onClick={() => setShowForm(true)}>Create Campaign</Button>
      </div>

      {showForm && (
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle>Create New Campaign</CardTitle>
            <CardDescription>
              Fill out the details for your new influencer marketing campaign
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Campaign Title</Label>
                  <Input 
                    id="title" 
                    name="title" 
                    placeholder="Enter campaign title" 
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="platform">Target Platform</Label>
                  <Select 
                    value={formData.platform} 
                    onValueChange={(value) => handleSelectChange('platform', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="youtube">YouTube</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="twitter">X (Twitter)</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="snapchat">Snapchat</SelectItem>
                      <SelectItem value="all">All Platforms</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="monetizationMethod">Monetization Method</Label>
                  <Select 
                    value={formData.monetizationMethod} 
                    onValueChange={(value) => handleSelectChange('monetizationMethod', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select monetization method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ai_dynamic">AI Suggested Dynamic Pricing</SelectItem>
                      <SelectItem value="profit_sharing">Sales Profit Sharing</SelectItem>
                      <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                      <SelectItem value="affiliate">Affiliate Partnership</SelectItem>
                      <SelectItem value="products">Product Exchange</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="budget">Budget</Label>
                  <Input 
                    id="budget" 
                    name="budget" 
                    placeholder="Enter budget amount" 
                    value={formData.budget}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Campaign Duration</Label>
                  <Input 
                    id="duration" 
                    name="duration" 
                    placeholder="e.g., 30 days" 
                    value={formData.duration}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetAudience">Target Audience</Label>
                  <Input 
                    id="targetAudience" 
                    name="targetAudience" 
                    placeholder="e.g., 18-24 year olds interested in fitness" 
                    value={formData.targetAudience}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Campaign Description</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  placeholder="Describe what you're looking for in this campaign..." 
                  className="min-h-[120px]"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Campaign</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {campaigns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {campaigns.map(campaign => (
            <Card key={campaign.id}>
              <CardHeader>
                <CardTitle>{campaign.title}</CardTitle>
                <CardDescription>Created {new Date(campaign.createdAt).toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Platform:</span>
                    <span className="capitalize">{campaign.platform}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monetization:</span>
                    <span>{campaign.monetizationMethod.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Budget:</span>
                    <span>{campaign.budget}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="text-green-500 font-medium">{campaign.status}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full">View Details</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-muted/40">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">You haven't created any campaigns yet</p>
            <Button onClick={() => setShowForm(true)}>Create Your First Campaign</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CampaignsTab;
