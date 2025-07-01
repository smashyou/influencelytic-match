// src/types/api.ts - Complete API Types
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: "influencer" | "brand" | "admin";
  avatar_url?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User;
  session: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
  };
  message?: string;
}

export interface SocialConnection {
  id: string;
  platform: string;
  platform_user_id: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  follower_count: number;
  following_count: number;
  post_count: number;
  is_verified: boolean;
  is_active: boolean;
  last_sync_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Campaign {
  id: string;
  brand_id: string;
  title: string;
  description?: string;
  brief?: string;
  campaign_type: string;
  budget_min: number;
  budget_max: number;
  currency: string;
  target_age_min: number;
  target_age_max: number;
  target_gender?: string;
  target_locations: string[];
  target_interests: string[];
  required_platforms: string[];
  min_followers: number;
  max_followers?: number;
  min_engagement_rate: number;
  max_fake_followers: number;
  deliverables: string[];
  hashtags: string[];
  content_guidelines?: string;
  application_deadline?: string;
  campaign_start_date?: string;
  campaign_end_date?: string;
  status: string;
  max_applications?: number;
  selected_influencers_count: number;
  total_budget_allocated: number;
  created_at: string;
  updated_at: string;
}

export interface CampaignApplication {
  id: string;
  campaign_id: string;
  influencer_id: string;
  status: string;
  proposed_rate: number;
  currency: string;
  application_message?: string;
  portfolio_links: string[];
  ai_match_score?: number;
  brand_rating?: number;
  influencer_rating?: number;
  completion_proof: string[];
  brand_feedback?: string;
  influencer_notes?: string;
  applied_at: string;
  responded_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  campaign_id: string;
  application_id: string;
  brand_id: string;
  influencer_id: string;
  amount: number;
  currency: string;
  platform_fee_rate: number;
  platform_fee: number;
  brand_fee: number;
  influencer_payout: number;
  stripe_payment_intent_id?: string;
  stripe_transfer_id?: string;
  stripe_account_id?: string;
  transaction_type: string;
  status: string;
  processed_at?: string;
  payout_date?: string;
  refund_amount: number;
  refund_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface AnalyticsData {
  fake_follower_analysis: {
    fake_follower_percentage: number;
    confidence_score: number;
    risk_factors: string[];
    explanation: string;
  };
  sentiment_analysis: {
    overall_sentiment: number;
    sentiment_distribution: {
      positive: number;
      neutral: number;
      negative: number;
    };
    explanation: string;
    post_count_analyzed: number;
  };
  campaign_matches: Array<{
    campaign_id: string;
    campaign_title: string;
    brand_name: string;
    match_score: number;
    recommendations: string[];
    estimated_performance: {
      estimated_reach: number;
      estimated_engagement: number;
      estimated_roi: number;
    };
  }>;
  pricing_suggestion: {
    suggested_price: number;
    price_range: {
      min: number;
      max: number;
    };
    explanation: string;
    multipliers?: {
      engagement: number;
      niche: number;
      demand: number;
      urgency: number;
    };
  };
  overall_score: {
    authenticity: number;
    brand_safety: number;
    engagement_quality: number;
  };
  platform_metrics: {
    total_followers: number;
    avg_engagement_rate: number;
    platforms_connected: number;
    verified_accounts: number;
  };
}

export interface PaymentHistory {
  transactions: Transaction[];
  summary: {
    total_earned: number;
    total_spent: number;
    pending_amount: number;
    completed_transactions: number;
    failed_transactions: number;
  };
}

export interface StripeAccountStatus {
  account_id?: string;
  status: string;
  details_submitted: boolean;
  charges_enabled: boolean;
  payouts_enabled: boolean;
  requirements?: {
    currently_due: string[];
    eventually_due: string[];
    past_due: string[];
  };
  dashboard_url?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message?: string;
  data: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

export interface BrandProfile {
  id: string;
  user_id: string;
  company_name: string;
  industry?: string;
  website_url?: string;
  description?: string;
  logo_url?: string;
  company_size?: string;
  target_demographics: Record<string, unknown>;
  brand_values: string[];
  created_at: string;
  updated_at: string;
}

export interface InfluencerAnalytics {
  id: string;
  user_id: string;
  platform: string;
  engagement_rate: number;
  avg_likes: number;
  avg_comments: number;
  avg_shares: number;
  avg_saves: number;
  audience_age_13_17: number;
  audience_age_18_24: number;
  audience_age_25_34: number;
  audience_age_35_44: number;
  audience_age_45_54: number;
  audience_age_55_plus: number;
  audience_male: number;
  audience_female: number;
  audience_other: number;
  top_locations: Array<{ location: string; percentage: number }>;
  interests: string[];
  fake_follower_percentage: number;
  sentiment_score: number;
  niche_categories: string[];
  content_types: string[];
  posting_frequency_per_week: number;
  best_posting_times: Array<{ day: string; hour: number }>;
  created_at: string;
  updated_at: string;
}

// Request/Response interfaces for API calls
export interface CreateCampaignRequest {
  title: string;
  description?: string;
  brief?: string;
  campaign_type: string;
  budget_min: number;
  budget_max: number;
  currency?: string;
  target_age_min?: number;
  target_age_max?: number;
  target_gender?: string;
  target_locations?: string[];
  target_interests?: string[];
  required_platforms?: string[];
  min_followers?: number;
  max_followers?: number;
  min_engagement_rate?: number;
  max_fake_followers?: number;
  deliverables?: string[];
  hashtags?: string[];
  content_guidelines?: string;
  application_deadline?: string;
  campaign_start_date?: string;
  campaign_end_date?: string;
  max_applications?: number;
}

export interface CampaignFilters {
  status?: string;
  brand_id?: string;
  search?: string;
  min_budget?: number;
  max_budget?: number;
  platforms?: string[];
  page?: number;
  limit?: number;
}

export interface ApplyCampaignRequest {
  proposed_rate: number;
  currency?: string;
  application_message: string;
  portfolio_links?: string[];
}

export interface CreatePaymentIntentRequest {
  campaign_id: string;
  application_id: string;
  amount: number;
  currency?: string;
}

export interface InfluencerSearchCriteria {
  min_followers?: number;
  max_followers?: number;
  platforms?: string[];
  interests?: string[];
  min_engagement?: number;
  budget?: number;
  location?: string;
  verified_only?: boolean;
}

export interface SearchInfluencersRequest {
  query?: string;
  filters?: InfluencerSearchCriteria;
  page?: number;
  limit?: number;
}

export interface TrendingTopic {
  topic: string;
  mentions: number;
  growth: number;
  category?: string;
}

export interface TrendingHashtag {
  hashtag: string;
  posts: number;
  growth: number;
  category?: string;
}

export interface AIInsight {
  id: string;
  subject_type: string;
  subject_id: string;
  insight_type: string;
  confidence_score?: number;
  data: Record<string, unknown>;
  explanation?: string;
  created_at: string;
  updated_at: string;
}

// Error types
export interface APIError {
  error: string;
  message?: string;
  details?: Record<string, unknown>;
  code?: string;
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Social media platform types
export type SocialMediaPlatform =
  | "instagram"
  | "tiktok"
  | "youtube"
  | "facebook"
  | "twitter"
  | "linkedin"
  | "snapchat";

// Campaign status types
export type CampaignStatus =
  | "draft"
  | "active"
  | "paused"
  | "completed"
  | "cancelled";

// Application status types
export type ApplicationStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "completed";

// Transaction status types
export type TransactionStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "refunded";

// User type
export type UserType = "influencer" | "brand" | "admin";
