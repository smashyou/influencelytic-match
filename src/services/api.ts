// src/services/api.ts - Complete Fixed API Service
import { toast } from "@/components/ui/use-toast";
import type {
  ApiResponse,
  User,
  AuthResponse,
  SocialConnection,
  Campaign,
  CampaignApplication,
  Transaction,
  AnalyticsData,
  PaymentHistory,
  StripeAccountStatus,
  Notification,
  CreateCampaignRequest,
  CampaignFilters,
  ApplyCampaignRequest,
  CreatePaymentIntentRequest,
  InfluencerSearchCriteria,
  TrendingTopic,
  TrendingHashtag,
  UserType,
} from "@/types/api";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

interface SignUpData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  user_type: UserType;
}

interface SignInData {
  email: string;
  password: string;
}

class APIService {
  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
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
        title: "API Error",
        description: message,
        variant: "destructive",
      });
      throw error;
    }
  }

  // Authentication Methods
  async signUp(userData: SignUpData): Promise<AuthResponse> {
    return this.request<AuthResponse>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async signIn(credentials: SignInData): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>("/api/auth/signin", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    if (response.session?.access_token) {
      localStorage.setItem("token", response.session.access_token);
    }

    return response;
  }

  async signOut(): Promise<void> {
    localStorage.removeItem("token");
    return this.request<void>("/api/auth/signout", { method: "POST" });
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request<ApiResponse<User>>("/api/auth/me");
  }

  // Social Media Methods
  async getSocialConnections(): Promise<SocialConnection[]> {
    try {
      return await this.request<SocialConnection[]>("/api/social/connections");
    } catch (error) {
      console.error("Failed to fetch social connections:", error);
      return [];
    }
  }

  async initiateSocialAuth(platform: string): Promise<{ auth_url: string }> {
    return this.request<{ auth_url: string }>(`/api/social/auth/${platform}`);
  }

  async disconnectSocial(platform: string): Promise<void> {
    return this.request<void>(`/api/social/connections/${platform}`, {
      method: "DELETE",
    });
  }

  async syncSocialData(platform: string): Promise<void> {
    return this.request<void>(`/api/social/sync/${platform}`, {
      method: "POST",
    });
  }

  // Analytics Methods
  async getInfluencerAnalytics(userId?: string): Promise<AnalyticsData> {
    try {
      const endpoint = userId
        ? `/api/analytics/influencer/${userId}`
        : "/api/analytics/influencer";
      return await this.request<AnalyticsData>(endpoint);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
      // Return default analytics data structure
      return {
        fake_follower_analysis: {
          fake_follower_percentage: 0,
          confidence_score: 0,
          risk_factors: [],
          explanation: "Analytics data not available",
        },
        sentiment_analysis: {
          overall_sentiment: 0,
          sentiment_distribution: {
            positive: 0,
            neutral: 0,
            negative: 0,
          },
          explanation: "Sentiment analysis not available",
          post_count_analyzed: 0,
        },
        campaign_matches: [],
        pricing_suggestion: {
          suggested_price: 0,
          price_range: { min: 0, max: 0 },
          explanation: "Pricing suggestion not available",
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

  async refreshAnalytics(): Promise<void> {
    return this.request<void>("/api/analytics/refresh", { method: "POST" });
  }

  // Campaign Methods
  async getCampaigns(filters?: CampaignFilters): Promise<Campaign[]> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              params.append(key, value.join(","));
            } else {
              params.append(key, value.toString());
            }
          }
        });
      }

      const queryString = params.toString();
      return await this.request<Campaign[]>(
        `/api/campaigns${queryString ? `?${queryString}` : ""}`
      );
    } catch (error) {
      console.error("Failed to fetch campaigns:", error);
      return [];
    }
  }

  async getCampaign(id: string): Promise<Campaign | null> {
    try {
      return await this.request<Campaign>(`/api/campaigns/${id}`);
    } catch (error) {
      console.error("Failed to fetch campaign:", error);
      return null;
    }
  }

  async createCampaign(campaignData: CreateCampaignRequest): Promise<Campaign> {
    return this.request<Campaign>("/api/campaigns", {
      method: "POST",
      body: JSON.stringify(campaignData),
    });
  }

  async updateCampaign(
    id: string,
    updates: Partial<CreateCampaignRequest>
  ): Promise<Campaign> {
    return this.request<Campaign>(`/api/campaigns/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  async applyCampaign(
    campaignId: string,
    applicationData: ApplyCampaignRequest
  ): Promise<CampaignApplication> {
    return this.request<CampaignApplication>(
      `/api/campaigns/${campaignId}/apply`,
      {
        method: "POST",
        body: JSON.stringify(applicationData),
      }
    );
  }

  async getCampaignApplications(
    campaignId?: string
  ): Promise<CampaignApplication[]> {
    try {
      const endpoint = campaignId
        ? `/api/campaigns/${campaignId}/applications`
        : "/api/applications";
      return await this.request<CampaignApplication[]>(endpoint);
    } catch (error) {
      console.error("Failed to fetch campaign applications:", error);
      return [];
    }
  }

  async updateApplicationStatus(
    applicationId: string,
    status: string,
    feedback?: string
  ): Promise<CampaignApplication> {
    return this.request<CampaignApplication>(
      `/api/applications/${applicationId}`,
      {
        method: "PUT",
        body: JSON.stringify({ status, brand_feedback: feedback }),
      }
    );
  }

  // Payment Methods
  async createPaymentIntent(
    data: CreatePaymentIntentRequest
  ): Promise<{ client_secret: string }> {
    return this.request<{ client_secret: string }>(
      "/api/payments/create-payment-intent",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  }

  async getPaymentHistory(): Promise<PaymentHistory> {
    try {
      return await this.request<PaymentHistory>("/api/payments/history");
    } catch (error) {
      console.error("Failed to fetch payment history:", error);
      return {
        transactions: [],
        summary: {
          total_earned: 0,
          total_spent: 0,
          pending_amount: 0,
          completed_transactions: 0,
          failed_transactions: 0,
        },
      };
    }
  }

  async createStripeAccount(): Promise<{
    account_id: string;
    onboarding_url: string;
  }> {
    return this.request<{ account_id: string; onboarding_url: string }>(
      "/api/payments/connect/create-account",
      {
        method: "POST",
      }
    );
  }

  async getStripeAccountStatus(): Promise<StripeAccountStatus> {
    try {
      return await this.request<StripeAccountStatus>(
        "/api/payments/connect/status"
      );
    } catch (error) {
      console.error("Failed to fetch Stripe account status:", error);
      return {
        status: "not_created",
        details_submitted: false,
        charges_enabled: false,
        payouts_enabled: false,
      };
    }
  }

  async requestPayout(amount: number): Promise<void> {
    return this.request<void>("/api/payments/request-payout", {
      method: "POST",
      body: JSON.stringify({ amount }),
    });
  }

  // AI-powered Features
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
        explanation: "Pricing suggestion not available",
      };
    }
  }

  // Notification Methods
  async getNotifications(): Promise<Notification[]> {
    try {
      return await this.request<Notification[]>("/api/notifications");
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      return [];
    }
  }

  async markNotificationRead(id: string): Promise<void> {
    return this.request<void>(`/api/notifications/${id}/read`, {
      method: "PUT",
    });
  }

  async markAllNotificationsRead(): Promise<void> {
    return this.request<void>("/api/notifications/read-all", {
      method: "PUT",
    });
  }

  // Profile Methods
  async updateProfile(updates: Partial<User>): Promise<User> {
    return this.request<User>("/api/profile", {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  async getBrandProfile(): Promise<Record<string, unknown> | null> {
    try {
      return await this.request<Record<string, unknown> | null>(
        "/api/profile/brand"
      );
    } catch (error) {
      console.error("Failed to fetch brand profile:", error);
      return null;
    }
  }

  async updateBrandProfile(
    updates: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>("/api/profile/brand", {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  // Search and Discovery Methods
  async searchInfluencers(
    query: string,
    filters?: Record<string, unknown>
  ): Promise<User[]> {
    try {
      const params = new URLSearchParams({ q: query });
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        });
      }
      return await this.request<User[]>(
        `/api/search/influencers?${params.toString()}`
      );
    } catch (error) {
      console.error("Failed to search influencers:", error);
      return [];
    }
  }

  async getTrendingTopics(): Promise<TrendingTopic[]> {
    try {
      return await this.request<TrendingTopic[]>("/api/trends/topics");
    } catch (error) {
      console.error("Failed to fetch trending topics:", error);
      return [];
    }
  }

  async getTrendingHashtags(): Promise<TrendingHashtag[]> {
    try {
      return await this.request<TrendingHashtag[]>("/api/trends/hashtags");
    } catch (error) {
      console.error("Failed to fetch trending hashtags:", error);
      return [];
    }
  }
}

export const apiService = new APIService();

// Re-export specific service instances
export { authService } from "./auth";
export { analyticsService } from "./analytics";
export { campaignsService } from "./campaigns";
export { paymentsService } from "./payments";
