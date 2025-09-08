import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  ArrowLeft,
  MoreVertical,
  DollarSign,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  MessageSquare,
  Star,
  TrendingUp,
  Download,
  Filter,
  Mail,
  Sparkles,
  UserCheck,
  AlertCircle,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Campaign {
  id: string;
  title: string;
  status: string;
  budget_min: number;
  budget_max: number;
  application_deadline: string;
  campaign_start_date: string;
  campaign_end_date: string;
  max_applications: number | null;
  selected_influencers_count: number;
  total_budget_allocated: number;
}

interface Application {
  id: string;
  influencer_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  proposed_rate: number;
  application_message: string;
  portfolio_links: string[];
  ai_match_score: number;
  applied_at: string;
  influencer?: {
    email: string;
    first_name: string;
    last_name: string;
    username: string;
    avatar_url: string;
  };
  social_connections?: Array<{
    platform: string;
    follower_count: number;
    engagement_rate: number;
  }>;
}

interface CampaignStats {
  total_applications: number;
  pending_applications: number;
  accepted_applications: number;
  rejected_applications: number;
  average_match_score: number;
  total_reach: number;
  budget_committed: number;
}

export function CampaignManagement() {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<CampaignStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [reviewDialog, setReviewDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('match_score');

  useEffect(() => {
    if (campaignId) {
      fetchCampaignData();
      fetchApplications();
      calculateStats();
    }
  }, [campaignId]);

  const fetchCampaignData = async () => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();

      if (error) throw error;
      setCampaign(data);
    } catch (error) {
      console.error('Error fetching campaign:', error);
      toast.error('Failed to load campaign');
      navigate('/dashboard/campaigns');
    }
  };

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('campaign_applications')
        .select(`
          *,
          influencer:profiles!campaign_applications_influencer_id_fkey(
            email,
            first_name,
            last_name,
            username,
            avatar_url
          )
        `)
        .eq('campaign_id', campaignId);

      if (error) throw error;

      // Fetch social connections for each applicant
      const applicationsWithData = await Promise.all(
        (data || []).map(async (app) => {
          const { data: connections } = await supabase
            .from('social_connections')
            .select('platform, follower_count')
            .eq('user_id', app.influencer_id);

          const { data: analytics } = await supabase
            .from('influencer_analytics')
            .select('platform, engagement_rate')
            .eq('user_id', app.influencer_id);

          return {
            ...app,
            social_connections: connections?.map(conn => ({
              ...conn,
              engagement_rate: analytics?.find(a => a.platform === conn.platform)?.engagement_rate || 0
            }))
          };
        })
      );

      setApplications(applicationsWithData);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = async () => {
    if (!applications.length) return;

    const stats: CampaignStats = {
      total_applications: applications.length,
      pending_applications: applications.filter(a => a.status === 'pending').length,
      accepted_applications: applications.filter(a => a.status === 'accepted').length,
      rejected_applications: applications.filter(a => a.status === 'rejected').length,
      average_match_score: applications.reduce((acc, app) => acc + (app.ai_match_score || 0), 0) / applications.length,
      total_reach: applications.reduce((acc, app) => 
        acc + (app.social_connections?.reduce((sum, conn) => sum + conn.follower_count, 0) || 0), 0
      ),
      budget_committed: applications
        .filter(a => a.status === 'accepted')
        .reduce((acc, app) => acc + app.proposed_rate, 0)
    };

    setStats(stats);
  };

  const handleAcceptApplication = async (application: Application) => {
    try {
      // Update application status
      const { error: updateError } = await supabase
        .from('campaign_applications')
        .update({ 
          status: 'accepted',
          responded_at: new Date().toISOString()
        })
        .eq('id', application.id);

      if (updateError) throw updateError;

      // Update campaign stats
      const { error: campaignError } = await supabase
        .from('campaigns')
        .update({
          selected_influencers_count: (campaign?.selected_influencers_count || 0) + 1,
          total_budget_allocated: (campaign?.total_budget_allocated || 0) + application.proposed_rate
        })
        .eq('id', campaignId);

      if (campaignError) throw campaignError;

      // Send notification to influencer
      await supabase.from('notifications').insert({
        user_id: application.influencer_id,
        type: 'application_accepted',
        title: 'Application Accepted!',
        message: `Your application for "${campaign?.title}" has been accepted!`,
        data: { campaign_id: campaignId, application_id: application.id }
      });

      toast.success('Application accepted successfully');
      fetchApplications();
      fetchCampaignData();
      setReviewDialog(false);
    } catch (error) {
      console.error('Error accepting application:', error);
      toast.error('Failed to accept application');
    }
  };

  const handleRejectApplication = async (application: Application) => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      // Update application status
      const { error: updateError } = await supabase
        .from('campaign_applications')
        .update({ 
          status: 'rejected',
          responded_at: new Date().toISOString(),
          brand_feedback: rejectReason
        })
        .eq('id', application.id);

      if (updateError) throw updateError;

      // Send notification to influencer
      await supabase.from('notifications').insert({
        user_id: application.influencer_id,
        type: 'application_rejected',
        title: 'Application Update',
        message: `Your application for "${campaign?.title}" has been reviewed`,
        data: { campaign_id: campaignId, application_id: application.id, reason: rejectReason }
      });

      toast.success('Application rejected');
      fetchApplications();
      setReviewDialog(false);
      setRejectReason('');
    } catch (error) {
      console.error('Error rejecting application:', error);
      toast.error('Failed to reject application');
    }
  };

  const exportApplications = () => {
    const csvContent = [
      ['Name', 'Email', 'Status', 'Match Score', 'Proposed Rate', 'Total Followers', 'Applied Date'],
      ...applications.map(app => [
        `${app.influencer?.first_name} ${app.influencer?.last_name}`,
        app.influencer?.email,
        app.status,
        app.ai_match_score,
        app.proposed_rate,
        app.social_connections?.reduce((sum, conn) => sum + conn.follower_count, 0) || 0,
        new Date(app.applied_at).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campaign-${campaignId}-applications.csv`;
    a.click();
  };

  const getFilteredApplications = () => {
    let filtered = [...applications];

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(app => app.status === filterStatus);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'match_score':
          return (b.ai_match_score || 0) - (a.ai_match_score || 0);
        case 'rate_low':
          return a.proposed_rate - b.proposed_rate;
        case 'rate_high':
          return b.proposed_rate - a.proposed_rate;
        case 'followers':
          const aFollowers = a.social_connections?.reduce((sum, conn) => sum + conn.follower_count, 0) || 0;
          const bFollowers = b.social_connections?.reduce((sum, conn) => sum + conn.follower_count, 0) || 0;
          return bFollowers - aFollowers;
        case 'date':
          return new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
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

  const filteredApplications = getFilteredApplications();

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard/campaigns')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{campaign.title}</h1>
            <p className="text-muted-foreground">
              Campaign Management Dashboard
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
            {campaign.status}
          </Badge>
          <Button variant="outline" onClick={exportApplications}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_applications || 0}</div>
            {campaign.max_applications && (
              <Progress 
                value={(stats?.total_applications || 0) / campaign.max_applications * 100} 
                className="mt-2 h-1"
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Match Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              {Math.round(stats?.average_match_score || 0)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Reach
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((stats?.total_reach || 0) / 1000000).toFixed(1)}M
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Combined followers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Budget Committed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats?.budget_committed || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              of ${campaign.budget_max} max
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Applications</CardTitle>
            <div className="flex items-center gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="match_score">Match Score</SelectItem>
                  <SelectItem value="rate_low">Rate (Low to High)</SelectItem>
                  <SelectItem value="rate_high">Rate (High to Low)</SelectItem>
                  <SelectItem value="followers">Followers</SelectItem>
                  <SelectItem value="date">Date Applied</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Influencer</TableHead>
                <TableHead>Platforms</TableHead>
                <TableHead>Match Score</TableHead>
                <TableHead>Proposed Rate</TableHead>
                <TableHead>Total Reach</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applied</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No applications found
                  </TableCell>
                </TableRow>
              ) : (
                filteredApplications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={application.influencer?.avatar_url} />
                          <AvatarFallback>
                            {application.influencer?.first_name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {application.influencer?.first_name} {application.influencer?.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            @{application.influencer?.username}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {application.social_connections?.map(conn => (
                          <Badge key={conn.platform} variant="outline" className="text-xs">
                            {conn.platform}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Sparkles className="h-4 w-4 text-yellow-500" />
                        <span className="font-medium">{application.ai_match_score}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      ${application.proposed_rate}
                    </TableCell>
                    <TableCell>
                      {(
                        (application.social_connections?.reduce(
                          (sum, conn) => sum + conn.follower_count,
                          0
                        ) || 0) / 1000
                      ).toFixed(1)}K
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          application.status === 'accepted'
                            ? 'default'
                            : application.status === 'rejected'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {application.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(application.applied_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedApplication(application);
                              setReviewDialog(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Review Application
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Send Message
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="h-4 w-4 mr-2" />
                            Email Influencer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Review Application Dialog */}
      <Dialog open={reviewDialog} onOpenChange={setReviewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Application</DialogTitle>
            <DialogDescription>
              Review the application details and make a decision
            </DialogDescription>
          </DialogHeader>
          
          {selectedApplication && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedApplication.influencer?.avatar_url} />
                  <AvatarFallback>
                    {selectedApplication.influencer?.first_name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">
                    {selectedApplication.influencer?.first_name} {selectedApplication.influencer?.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedApplication.influencer?.email}
                  </p>
                </div>
                <Badge variant="secondary">
                  {selectedApplication.ai_match_score}% Match
                </Badge>
              </div>

              <Separator />

              <div>
                <Label>Application Message</Label>
                <p className="mt-2 text-sm text-muted-foreground">
                  {selectedApplication.application_message}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Proposed Rate</Label>
                  <p className="mt-1 text-lg font-semibold">
                    ${selectedApplication.proposed_rate}
                  </p>
                </div>
                <div>
                  <Label>Total Reach</Label>
                  <p className="mt-1 text-lg font-semibold">
                    {(
                      (selectedApplication.social_connections?.reduce(
                        (sum, conn) => sum + conn.follower_count,
                        0
                      ) || 0) / 1000
                    ).toFixed(1)}K
                  </p>
                </div>
              </div>

              <div>
                <Label>Portfolio Links</Label>
                <div className="mt-2 space-y-1">
                  {selectedApplication.portfolio_links?.map((link, index) => (
                    <a
                      key={index}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline block"
                    >
                      {link}
                    </a>
                  ))}
                </div>
              </div>

              {selectedApplication.status === 'pending' && (
                <>
                  <Separator />
                  
                  <div>
                    <Label>Rejection Reason (if rejecting)</Label>
                    <Textarea
                      className="mt-2"
                      placeholder="Provide feedback for the influencer..."
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                    />
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setReviewDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleRejectApplication(selectedApplication)}
                    >
                      Reject
                    </Button>
                    <Button
                      onClick={() => handleAcceptApplication(selectedApplication)}
                    >
                      Accept Application
                    </Button>
                  </DialogFooter>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}