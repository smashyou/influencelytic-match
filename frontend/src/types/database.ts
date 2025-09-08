// Database Types for Influencelytic-Match
// These types match the database schema created in migrations

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          user_type: 'influencer' | 'brand'
          first_name: string | null
          last_name: string | null
          username: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      social_connections: {
        Row: {
          id: string
          user_id: string
          platform: 'instagram' | 'facebook' | 'tiktok' | 'youtube' | 'twitter' | 'linkedin'
          platform_user_id: string
          username: string | null
          display_name: string | null
          avatar_url: string | null
          access_token: string | null
          refresh_token: string | null
          expires_at: string | null
          follower_count: number
          following_count: number
          post_count: number
          is_verified: boolean
          is_active: boolean
          last_sync_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['social_connections']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['social_connections']['Insert']>
      }
      influencer_analytics: {
        Row: {
          id: string
          user_id: string
          platform: string
          engagement_rate: number
          avg_likes: number
          avg_comments: number
          avg_shares: number
          avg_saves: number
          audience_age_13_17: number
          audience_age_18_24: number
          audience_age_25_34: number
          audience_age_35_44: number
          audience_age_45_54: number
          audience_age_55_plus: number
          audience_male: number
          audience_female: number
          audience_other: number
          top_locations: string[]
          interests: string[]
          fake_follower_percentage: number
          sentiment_score: number
          niche_categories: string[]
          content_types: string[]
          posting_frequency_per_week: number
          best_posting_times: string[]
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['influencer_analytics']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['influencer_analytics']['Insert']>
      }
      brand_profiles: {
        Row: {
          id: string
          user_id: string
          company_name: string
          industry: string | null
          website_url: string | null
          description: string | null
          logo_url: string | null
          company_size: string | null
          target_demographics: Record<string, any>
          brand_values: string[]
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['brand_profiles']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['brand_profiles']['Insert']>
      }
      campaigns: {
        Row: {
          id: string
          brand_id: string
          title: string
          description: string | null
          brief: string | null
          campaign_type: 'sponsored_post' | 'product_review' | 'brand_ambassador' | 'event_coverage' | 'content_creation'
          budget_min: number
          budget_max: number
          currency: string
          target_age_min: number
          target_age_max: number
          target_gender: 'male' | 'female' | 'all' | null
          target_locations: string[]
          target_interests: string[]
          required_platforms: string[]
          min_followers: number
          max_followers: number | null
          min_engagement_rate: number
          max_fake_followers: number
          deliverables: string[]
          hashtags: string[]
          content_guidelines: string | null
          application_deadline: string | null
          campaign_start_date: string | null
          campaign_end_date: string | null
          status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled'
          max_applications: number | null
          selected_influencers_count: number
          total_budget_allocated: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['campaigns']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['campaigns']['Insert']>
      }
      campaign_applications: {
        Row: {
          id: string
          campaign_id: string
          influencer_id: string
          status: 'pending' | 'accepted' | 'rejected' | 'completed'
          proposed_rate: number | null
          currency: string
          application_message: string | null
          portfolio_links: string[]
          ai_match_score: number | null
          brand_rating: number | null
          influencer_rating: number | null
          completion_proof: string[]
          brand_feedback: string | null
          influencer_notes: string | null
          applied_at: string
          responded_at: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['campaign_applications']['Row'], 'id' | 'applied_at' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['campaign_applications']['Insert']>
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string | null
          data: Record<string, any>
          is_read: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          email_notifications: boolean
          push_notifications: boolean
          marketing_emails: boolean
          match_notifications: boolean
          payment_notifications: boolean
          weekly_digest: boolean
          preferred_currency: string
          timezone: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_preferences']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['user_preferences']['Insert']>
      }
    }
  }
}

// Helper types for easier usage
export type Profile = Database['public']['Tables']['profiles']['Row']
export type SocialConnection = Database['public']['Tables']['social_connections']['Row']
export type InfluencerAnalytics = Database['public']['Tables']['influencer_analytics']['Row']
export type BrandProfile = Database['public']['Tables']['brand_profiles']['Row']
export type Campaign = Database['public']['Tables']['campaigns']['Row']
export type CampaignApplication = Database['public']['Tables']['campaign_applications']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']
export type UserPreferences = Database['public']['Tables']['user_preferences']['Row']

// Enums for consistent type checking
export const PlatformTypes = {
  INSTAGRAM: 'instagram',
  FACEBOOK: 'facebook',
  TIKTOK: 'tiktok',
  YOUTUBE: 'youtube',
  TWITTER: 'twitter',
  LINKEDIN: 'linkedin'
} as const

export const CampaignStatus = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const

export const ApplicationStatus = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  COMPLETED: 'completed'
} as const

export const UserType = {
  INFLUENCER: 'influencer',
  BRAND: 'brand'
} as const