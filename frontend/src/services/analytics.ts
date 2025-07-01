// src/services/analytics.ts - Fixed Analytics Service
import { toast } from "@/components/ui/use-toast";
import { authService } from "./auth";
import type {
  AnalyticsData,
  User,
  InfluencerSearchCriteria,
} from "@/types/api";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

class AnalyticsService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...authService.getAuthHeaders(),
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An error occurred";
      toast({
        title: "Analytics Error",
        description: message,
        variant: "destructive",
      });
      throw error;
    }
  }

  async getInfluencerAnalytics(userId?: string): Promise<AnalyticsData> {
    try {
      const endpoint = userId
        ? `/api/analytics/influencer/${userId}`
        : "/api/analytics/influencer";

      const response = await this.request<AnalyticsData>(endpoint);
      return response;
    } catch (error) {
      // Return default analytics data if API call fails
      console.error("Failed to fetch analytics:", error);
      return {
        fake_follower_analysis: {
          fake_follower_percentage: 0,
          confidence_score: 0,
          risk_factors: [],
          explanation: "Unable to analyze fake followers at this time.",
        },
        sentiment_analysis: {
          overall_sentiment: 0,
          sentiment_distribution: {
            positive: 0,
            neutral: 0,
            negative: 0,
          },
          explanation: "Unable to analyze sentiment at this time.",
          post_count_analyzed: 0,
        },
        campaign_matches: [],
        pricing_suggestion: {
          suggested_price: 0,
          price_range: {
            min: 0,
            max: 0,
          },
          explanation: "Unable to calculate pricing suggestions at this time.",
        },
        overall_score: {
          authenticity: 0,
          brand_safety: 0,
          engagement_quality: 0,
        },
        platform_metrics: {
          total_followers: 0,
          avg_engagement_rate: 0,
          platforms_connected: 0,
          verified_accounts: 0,
        },
      };
    }
  }

  async getAiInsights(userId?: string): Promise<Record<string, unknown>> {
    try {
      const endpoint = userId
        ? `/api/analytics/ai-insights?user_id=${userId}`
        : "/api/analytics/ai-insights";

      return await this.request<Record<string, unknown>>(endpoint);
    } catch (error) {
      console.error("Failed to fetch AI insights:", error);
      return {};
    }
  }

  async getCampaignMatches(): Promise<AnalyticsData["campaign_matches"]> {
    try {
      return await this.request<AnalyticsData["campaign_matches"]>(
        "/api/ai/campaign-matches"
      );
    } catch (error) {
      console.error("Failed to fetch campaign matches:", error);
      return [];
    }
  }

  async getInfluencerSuggestions(
    criteria: InfluencerSearchCriteria
  ): Promise<User[]> {
    try {
      return await this.request<User[]>("/api/ai/influencer-suggestions", {
        method: "POST",
        body: JSON.stringify(criteria),
      });
    } catch (error) {
      console.error("Failed to fetch influencer suggestions:", error);
      return [];
    }
  }

  async getPricingSuggestion(
    influencerId: string,
    campaignData: Record<string, unknown>
  ): Promise<AnalyticsData["pricing_suggestion"]> {
    try {
      return await this.request<AnalyticsData["pricing_suggestion"]>(
        "/api/ai/pricing-suggestion",
        {
          method: "POST",
          body: JSON.stringify({
            influencer_id: influencerId,
            ...campaignData,
          }),
        }
      );
    } catch (error) {
      console.error("Failed to fetch pricing suggestion:", error);
      return {
        suggested_price: 0,
        price_range: { min: 0, max: 0 },
        explanation: "Unable to calculate pricing suggestion at this time.",
      };
    }
  }

  async refreshAnalytics(): Promise<void> {
    try {
      await this.request<void>("/api/analytics/refresh", {
        method: "POST",
      });

      toast({
        title: "Analytics Refreshed",
        description: "Your analytics data has been updated successfully.",
      });
    } catch (error) {
      console.error("Failed to refresh analytics:", error);
      // Error already handled by request method
    }
  }

  // Helper method to check if analytics data is empty/default
  isAnalyticsDataEmpty(data: AnalyticsData): boolean {
    return (
      data.platform_metrics.total_followers === 0 &&
      data.platform_metrics.platforms_connected === 0 &&
      data.campaign_matches.length === 0
    );
  }

  // Helper method to format analytics numbers
  formatAnalyticsNumber(num: number, decimals: number = 1): string {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(decimals)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(decimals)}K`;
    }
    return num.toFixed(decimals);
  }

  // Helper method to get authenticity color class
  getAuthenticityColorClass(percentage: number): string {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 75) return "text-yellow-600";
    return "text-red-600";
  }

  // Helper method to get sentiment color class
  getSentimentColorClass(score: number): string {
    if (score > 0.1) return "text-green-600";
    if (score > -0.1) return "text-yellow-600";
    return "text-red-600";
  }
}

export const analyticsService = new AnalyticsService();
