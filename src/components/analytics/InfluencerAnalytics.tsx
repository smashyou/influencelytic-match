// src/components/analytics/InfluencerAnalytics.tsx - Fixed TypeScript Issues
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrendingUp,
  Users,
  Heart,
  MessageCircle,
  Shield,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Target,
  DollarSign,
  RefreshCw,
  Eye,
  Share2,
  BookOpen,
  Calendar,
  MapPin,
  Star,
  Zap,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { apiService } from "@/services/api";

// Import the centralized types instead of defining locally
import type { AnalyticsData, SocialConnection } from "@/types/api";

interface EngagementData {
  platform: string;
  followers: number;
  engagement_rate: number;
  avg_likes: number;
  avg_comments: number;
  growth_rate: number;
}

const InfluencerAnalytics: React.FC = () => {
  const { user } = useAuth();

  // Use the centralized types here
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [connections, setConnections] = useState<SocialConnection[]>([]);
  const [engagementData, setEngagementData] = useState<EngagementData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState("30d");

  useEffect(() => {
    if (user) {
      Promise.all([fetchAnalytics(), fetchConnections()]).finally(() =>
        setLoading(false)
      );
    }
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      setError(null);
      const data = await apiService.getInfluencerAnalytics();

      // Ensure multipliers property exists with default values
      const processedData: AnalyticsData = {
        ...data,
        pricing_suggestion: {
          ...data.pricing_suggestion,
          multipliers: data.pricing_suggestion.multipliers || {
            engagement: 1.0,
            niche: 1.0,
            demand: 1.0,
            urgency: 1.0,
          },
        },
      };

      setAnalytics(processedData);

      // Mock engagement data for now - replace with real data later
      setEngagementData([
        {
          platform: "Instagram",
          followers: 25400,
          engagement_rate: 4.2,
          avg_likes: 850,
          avg_comments: 95,
          growth_rate: 12.5,
        },
        {
          platform: "TikTok",
          followers: 18900,
          engagement_rate: 6.8,
          avg_likes: 1200,
          avg_comments: 140,
          growth_rate: 28.3,
        },
        {
          platform: "YouTube",
          followers: 8500,
          engagement_rate: 5.1,
          avg_likes: 420,
          avg_comments: 85,
          growth_rate: 15.7,
        },
      ]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load analytics data";
      setError(message);
      console.error("Analytics fetch error:", err);
    }
  };

  const fetchConnections = async () => {
    try {
      const data = await apiService.getSocialConnections();

      // Ensure last_sync_at property exists for all connections
      const processedConnections: SocialConnection[] = data.map(
        (connection) => ({
          ...connection,
          last_sync_at: connection.last_sync_at || new Date().toISOString(),
        })
      );

      setConnections(processedConnections);
    } catch (err) {
      console.error("Connections fetch error:", err);
    }
  };

  const refreshAnalytics = async () => {
    setRefreshing(true);
    try {
      await apiService.refreshAnalytics();
      await fetchAnalytics();
      toast({
        title: "Analytics Updated",
        description: "Your analytics data has been refreshed successfully.",
      });
    } catch (err) {
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh analytics. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const getAuthenticityColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 75) return "text-yellow-600";
    return "text-red-600";
  };

  const getSentimentColor = (score: number) => {
    if (score > 0.1) return "text-green-600";
    if (score > -0.1) return "text-yellow-600";
    return "text-red-600";
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !analytics) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Failed to Load Analytics
            </h3>
            <p className="text-muted-foreground mb-4 text-center">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No data state
  if (!analytics && connections.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Analytics Data</h3>
            <p className="text-muted-foreground mb-4 text-center">
              Connect your social media accounts to start seeing analytics.
            </p>
            <Button
              onClick={() =>
                (window.location.href = "/dashboard?tab=platforms")
              }
            >
              Connect Platforms
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            AI-powered insights for your influencer profile
          </p>
        </div>
        <Button
          onClick={refreshAnalytics}
          disabled={refreshing}
          variant="outline"
        >
          {refreshing ? (
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Refresh
        </Button>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Followers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(analytics?.platform_metrics?.total_followers || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across {connections.length} platform
              {connections.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Engagement Rate
            </CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(analytics?.platform_metrics?.avg_engagement_rate || 0).toFixed(
                1
              )}
              %
            </div>
            <p className="text-xs text-muted-foreground">
              Average across platforms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Authenticity Score
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${getAuthenticityColor(
                analytics?.overall_score?.authenticity || 0
              )}`}
            >
              {(analytics?.overall_score?.authenticity || 0).toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Real follower percentage
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Suggested Rate
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                analytics?.pricing_suggestion?.suggested_price || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">Per sponsored post</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="authenticity">Authenticity</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="platforms">Platforms</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            {/* Sentiment Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Content Sentiment Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analytics?.sentiment_analysis ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Overall Sentiment</span>
                      <Badge
                        variant={
                          analytics.sentiment_analysis.overall_sentiment > 0
                            ? "default"
                            : "secondary"
                        }
                      >
                        {analytics.sentiment_analysis.overall_sentiment > 0.1
                          ? "Positive"
                          : analytics.sentiment_analysis.overall_sentiment >
                            -0.1
                          ? "Neutral"
                          : "Negative"}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Positive</span>
                        <span>
                          {(
                            analytics.sentiment_analysis.sentiment_distribution
                              .positive * 100
                          ).toFixed(1)}
                          %
                        </span>
                      </div>
                      <Progress
                        value={
                          analytics.sentiment_analysis.sentiment_distribution
                            .positive * 100
                        }
                        className="h-2"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Neutral</span>
                        <span>
                          {(
                            analytics.sentiment_analysis.sentiment_distribution
                              .neutral * 100
                          ).toFixed(1)}
                          %
                        </span>
                      </div>
                      <Progress
                        value={
                          analytics.sentiment_analysis.sentiment_distribution
                            .neutral * 100
                        }
                        className="h-2"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Negative</span>
                        <span>
                          {(
                            analytics.sentiment_analysis.sentiment_distribution
                              .negative * 100
                          ).toFixed(1)}
                          %
                        </span>
                      </div>
                      <Progress
                        value={
                          analytics.sentiment_analysis.sentiment_distribution
                            .negative * 100
                        }
                        className="h-2"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Based on{" "}
                      {analytics.sentiment_analysis.post_count_analyzed} recent
                      posts
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No sentiment data available
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Campaign Matches */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Top Campaign Matches
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analytics?.campaign_matches?.length ? (
                  <div className="space-y-4">
                    {analytics.campaign_matches
                      .slice(0, 3)
                      .map((match, index) => (
                        <div
                          key={match.campaign_id}
                          className="border rounded-lg p-4"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium">
                              {match.campaign_title}
                            </h4>
                            <Badge variant="secondary">
                              {match.match_score}% match
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            by {match.brand_name}
                          </p>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div>
                              <span className="text-muted-foreground">
                                Reach:
                              </span>
                              <div className="font-medium">
                                {formatNumber(
                                  match.estimated_performance.estimated_reach
                                )}
                              </div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                Engagement:
                              </span>
                              <div className="font-medium">
                                {formatNumber(
                                  match.estimated_performance
                                    .estimated_engagement
                                )}
                              </div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                ROI:
                              </span>
                              <div className="font-medium">
                                {match.estimated_performance.estimated_roi.toFixed(
                                  1
                                )}
                                x
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    <Button variant="outline" className="w-full">
                      View All Opportunities
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No campaign matches found
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="authenticity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Fake Follower Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics?.fake_follower_analysis ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <div
                      className={`text-4xl font-bold mb-2 ${getAuthenticityColor(
                        100 -
                          analytics.fake_follower_analysis
                            .fake_follower_percentage
                      )}`}
                    >
                      {(
                        100 -
                        analytics.fake_follower_analysis
                          .fake_follower_percentage
                      ).toFixed(1)}
                      %
                    </div>
                    <p className="text-muted-foreground">Authentic Followers</p>
                    <div className="mt-4">
                      <Progress
                        value={
                          100 -
                          analytics.fake_follower_analysis
                            .fake_follower_percentage
                        }
                        className="h-3"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4">
                    <div className="flex justify-between items-center">
                      <span>Confidence Score</span>
                      <Badge variant="outline">
                        {analytics.fake_follower_analysis.confidence_score.toFixed(
                          1
                        )}
                        %
                      </Badge>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">
                        Risk Factors Detected:
                      </h4>
                      {analytics.fake_follower_analysis.risk_factors.length >
                      0 ? (
                        <ul className="space-y-1">
                          {analytics.fake_follower_analysis.risk_factors.map(
                            (factor, index) => (
                              <li
                                key={index}
                                className="flex items-center gap-2 text-sm"
                              >
                                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                {factor}
                              </li>
                            )
                          )}
                        </ul>
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          No risk factors detected
                        </div>
                      )}
                    </div>

                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-medium mb-2">
                        Analysis Explanation:
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {analytics.fake_follower_analysis.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No authenticity data available
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="opportunities" className="space-y-4">
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            {/* Pricing Suggestions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Pricing Intelligence
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analytics?.pricing_suggestion ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        {formatCurrency(
                          analytics.pricing_suggestion.suggested_price
                        )}
                      </div>
                      <p className="text-muted-foreground">
                        Suggested rate per post
                      </p>
                    </div>

                    <div className="bg-muted p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm">Price Range</span>
                        <span className="text-sm font-medium">
                          {formatCurrency(
                            analytics.pricing_suggestion.price_range.min
                          )}{" "}
                          -{" "}
                          {formatCurrency(
                            analytics.pricing_suggestion.price_range.max
                          )}
                        </span>
                      </div>
                    </div>

                    {analytics.pricing_suggestion.multipliers && (
                      <div className="space-y-2">
                        <h4 className="font-medium">Pricing Factors:</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex justify-between">
                            <span>Engagement:</span>
                            <span>
                              {(
                                analytics.pricing_suggestion.multipliers
                                  .engagement * 100
                              ).toFixed(0)}
                              %
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Niche Premium:</span>
                            <span>
                              {(
                                analytics.pricing_suggestion.multipliers.niche *
                                100
                              ).toFixed(0)}
                              %
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Market Demand:</span>
                            <span>
                              {(
                                analytics.pricing_suggestion.multipliers
                                  .demand * 100
                              ).toFixed(0)}
                              %
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Urgency:</span>
                            <span>
                              {(
                                analytics.pricing_suggestion.multipliers
                                  .urgency * 100
                              ).toFixed(0)}
                              %
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-blue-900">
                        {analytics.pricing_suggestion.explanation}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No pricing data available
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Campaign Opportunities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Best Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analytics?.campaign_matches?.length ? (
                  <div className="space-y-4">
                    {analytics.campaign_matches.map((match, index) => (
                      <div
                        key={match.campaign_id}
                        className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-medium">
                              {match.campaign_title}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              by {match.brand_name}
                            </p>
                          </div>
                          <Badge
                            variant={
                              match.match_score >= 80
                                ? "default"
                                : match.match_score >= 60
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {match.match_score}% match
                          </Badge>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mb-3 text-xs">
                          <div className="text-center">
                            <Eye className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                            <div className="font-medium">
                              {formatNumber(
                                match.estimated_performance.estimated_reach
                              )}
                            </div>
                            <div className="text-muted-foreground">Reach</div>
                          </div>
                          <div className="text-center">
                            <Heart className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                            <div className="font-medium">
                              {formatNumber(
                                match.estimated_performance.estimated_engagement
                              )}
                            </div>
                            <div className="text-muted-foreground">
                              Engagement
                            </div>
                          </div>
                          <div className="text-center">
                            <TrendingUp className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                            <div className="font-medium">
                              {match.estimated_performance.estimated_roi.toFixed(
                                1
                              )}
                              x
                            </div>
                            <div className="text-muted-foreground">ROI</div>
                          </div>
                        </div>

                        {match.recommendations.length > 0 && (
                          <div className="border-t pt-2">
                            <p className="text-xs text-muted-foreground mb-1">
                              AI Recommendations:
                            </p>
                            <ul className="text-xs space-y-1">
                              {match.recommendations
                                .slice(0, 2)
                                .map((rec, i) => (
                                  <li
                                    key={i}
                                    className="flex items-start gap-1"
                                  >
                                    <Star className="h-3 w-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                                    {rec}
                                  </li>
                                ))}
                            </ul>
                          </div>
                        )}

                        <Button size="sm" className="w-full mt-3">
                          Apply Now
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No opportunities found
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Complete your profile to get better matches
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="platforms" className="space-y-4">
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {connections.map((connection) => (
              <Card key={connection.platform}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base capitalize flex items-center gap-2">
                    {connection.platform === "instagram" && (
                      <span className="text-pink-500">📷</span>
                    )}
                    {connection.platform === "youtube" && (
                      <span className="text-red-500">🎥</span>
                    )}
                    {connection.platform === "tiktok" && (
                      <span className="text-black">🎵</span>
                    )}
                    {connection.platform === "twitter" && (
                      <span className="text-blue-400">🐦</span>
                    )}
                    {connection.platform === "facebook" && (
                      <span className="text-blue-600">👥</span>
                    )}
                    {connection.platform === "linkedin" && (
                      <span className="text-blue-700">💼</span>
                    )}
                    {connection.platform}
                  </CardTitle>
                  {connection.is_verified && (
                    <Badge variant="secondary" className="text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        @{connection.username}
                      </span>
                      <Badge
                        variant={connection.is_active ? "default" : "secondary"}
                      >
                        {connection.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="font-medium">
                          {formatNumber(connection.follower_count)}
                        </div>
                        <div className="text-muted-foreground">Followers</div>
                      </div>
                      <div>
                        <div className="font-medium">
                          {formatNumber(connection.following_count)}
                        </div>
                        <div className="text-muted-foreground">Following</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="font-medium">
                          {formatNumber(connection.post_count)}
                        </div>
                        <div className="text-muted-foreground">Posts</div>
                      </div>
                      <div>
                        <div className="font-medium">
                          {connection.last_sync_at
                            ? new Date(
                                connection.last_sync_at
                              ).toLocaleDateString()
                            : "Never"}
                        </div>
                        <div className="text-muted-foreground">Last Sync</div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() =>
                          apiService.syncSocialData(connection.platform)
                        }
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Sync
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() =>
                          apiService.disconnectSocial(connection.platform)
                        }
                      >
                        Disconnect
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {connections.length === 0 && (
              <Card className="col-span-full">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Share2 className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No Platforms Connected
                  </h3>
                  <p className="text-muted-foreground mb-4 text-center">
                    Connect your social media accounts to start tracking
                    analytics and finding opportunities.
                  </p>
                  <Button
                    onClick={() =>
                      (window.location.href = "/dashboard?tab=platforms")
                    }
                  >
                    Connect Platforms
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InfluencerAnalytics;
