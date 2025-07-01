-- Influencelytic-Match Extended Database Schema
-- Run this in Supabase SQL Editor to extend the existing schema

-- 1. Social Media Connections Table
CREATE TABLE IF NOT EXISTS social_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL,
  platform_user_id VARCHAR(255) NOT NULL,
  username VARCHAR(255),
  display_name VARCHAR(255),
  avatar_url TEXT,
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  follower_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  post_count INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, platform, platform_user_id)
);

-- 2. Influencer Analytics Table
CREATE TABLE IF NOT EXISTS influencer_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL,
  engagement_rate DECIMAL(5,2) DEFAULT 0,
  avg_likes INTEGER DEFAULT 0,
  avg_comments INTEGER DEFAULT 0,
  avg_shares INTEGER DEFAULT 0,
  avg_saves INTEGER DEFAULT 0,
  audience_age_13_17 DECIMAL(5,2) DEFAULT 0,
  audience_age_18_24 DECIMAL(5,2) DEFAULT 0,
  audience_age_25_34 DECIMAL(5,2) DEFAULT 0,
  audience_age_35_44 DECIMAL(5,2) DEFAULT 0,
  audience_age_45_54 DECIMAL(5,2) DEFAULT 0,
  audience_age_55_plus DECIMAL(5,2) DEFAULT 0,
  audience_male DECIMAL(5,2) DEFAULT 0,
  audience_female DECIMAL(5,2) DEFAULT 0,
  audience_other DECIMAL(5,2) DEFAULT 0,
  top_locations JSONB DEFAULT '[]',
  interests JSONB DEFAULT '[]',
  fake_follower_percentage DECIMAL(5,2) DEFAULT 0,
  sentiment_score DECIMAL(3,2) DEFAULT 0, -- -1 to 1 scale
  niche_categories JSONB DEFAULT '[]',
  content_types JSONB DEFAULT '[]', -- photo, video, story, reel, etc.
  posting_frequency_per_week INTEGER DEFAULT 0,
  best_posting_times JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, platform)
);

-- 3. Brand Profiles Extension
CREATE TABLE IF NOT EXISTS brand_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  company_name VARCHAR(255) NOT NULL,
  industry VARCHAR(100),
  website_url TEXT,
  description TEXT,
  logo_url TEXT,
  company_size VARCHAR(50),
  target_demographics JSONB DEFAULT '{}',
  brand_values JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- 4. Campaigns Table
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  brief TEXT, -- Campaign brief/requirements
  campaign_type VARCHAR(100) DEFAULT 'sponsored_post', -- sponsored_post, product_review, brand_ambassador, etc.
  budget_min INTEGER DEFAULT 0,
  budget_max INTEGER DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'USD',
  target_age_min INTEGER DEFAULT 13,
  target_age_max INTEGER DEFAULT 65,
  target_gender VARCHAR(50), -- male, female, all
  target_locations JSONB DEFAULT '[]',
  target_interests JSONB DEFAULT '[]',
  required_platforms JSONB DEFAULT '[]',
  min_followers INTEGER DEFAULT 1000,
  max_followers INTEGER,
  min_engagement_rate DECIMAL(5,2) DEFAULT 1.0,
  max_fake_followers DECIMAL(5,2) DEFAULT 20.0,
  deliverables JSONB DEFAULT '[]', -- posts, stories, videos, etc.
  hashtags JSONB DEFAULT '[]',
  content_guidelines TEXT,
  application_deadline TIMESTAMPTZ,
  campaign_start_date TIMESTAMPTZ,
  campaign_end_date TIMESTAMPTZ,
  status VARCHAR(50) DEFAULT 'draft', -- draft, active, paused, completed, cancelled
  max_applications INTEGER,
  selected_influencers_count INTEGER DEFAULT 0,
  total_budget_allocated INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Campaign Applications Table
CREATE TABLE IF NOT EXISTS campaign_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  influencer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending', -- pending, accepted, rejected, completed
  proposed_rate INTEGER,
  currency VARCHAR(3) DEFAULT 'USD',
  application_message TEXT,
  portfolio_links JSONB DEFAULT '[]',
  ai_match_score DECIMAL(5,2), -- 0-100 score
  brand_rating INTEGER, -- 1-5 stars from brand
  influencer_rating INTEGER, -- 1-5 stars from influencer
  completion_proof JSONB DEFAULT '[]', -- URLs to completed work
  brand_feedback TEXT,
  influencer_notes TEXT,
  applied_at TIMESTAMPTZ DEFAULT now(),
  responded_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(campaign_id, influencer_id)
);

-- 6. Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id),
  application_id UUID REFERENCES campaign_applications(id),
  brand_id UUID REFERENCES profiles(id),
  influencer_id UUID REFERENCES profiles(id),
  amount INTEGER NOT NULL, -- in cents
  currency VARCHAR(3) DEFAULT 'USD',
  platform_fee_rate DECIMAL(5,2) DEFAULT 5.0, -- percentage
  platform_fee INTEGER NOT NULL, -- in cents
  brand_fee INTEGER DEFAULT 0, -- additional fee charged to brand
  influencer_payout INTEGER NOT NULL, -- final payout to influencer
  stripe_payment_intent_id VARCHAR(255),
  stripe_transfer_id VARCHAR(255),
  stripe_account_id VARCHAR(255), -- for Connect accounts
  transaction_type VARCHAR(50) DEFAULT 'campaign_payment',
  status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed, refunded
  processed_at TIMESTAMPTZ,
  payout_date TIMESTAMPTZ,
  refund_amount INTEGER DEFAULT 0,
  refund_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. AI Insights Table
CREATE TABLE IF NOT EXISTS ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_type VARCHAR(50) NOT NULL, -- influencer, brand, campaign, match
  subject_id UUID NOT NULL,
  insight_type VARCHAR(100) NOT NULL, -- fake_followers, sentiment, match_score, pricing, trend
  confidence_score DECIMAL(5,2), -- 0-100
  data JSONB DEFAULT '{}',
  explanation TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Platform Metrics Table (for trending/analytics)
CREATE TABLE IF NOT EXISTS platform_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date_recorded DATE NOT NULL,
  total_users INTEGER DEFAULT 0,
  total_influencers INTEGER DEFAULT 0,
  total_brands INTEGER DEFAULT 0,
  active_campaigns INTEGER DEFAULT 0,
  completed_campaigns INTEGER DEFAULT 0,
  total_transactions INTEGER DEFAULT 0,
  total_revenue INTEGER DEFAULT 0, -- platform fees collected
  avg_campaign_budget INTEGER DEFAULT 0,
  avg_influencer_rate INTEGER DEFAULT 0,
  top_niches JSONB DEFAULT '[]',
  top_locations JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(date_recorded)
);

-- 9. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type VARCHAR(100) NOT NULL, -- campaign_match, application_status, payment_received, etc.
  title VARCHAR(255) NOT NULL,
  message TEXT,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. User Preferences Table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  marketing_emails BOOLEAN DEFAULT false,
  match_notifications BOOLEAN DEFAULT true,
  payment_notifications BOOLEAN DEFAULT true,
  weekly_digest BOOLEAN DEFAULT true,
  preferred_currency VARCHAR(3) DEFAULT 'USD',
  timezone VARCHAR(50) DEFAULT 'UTC',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_social_connections_user_id ON social_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_social_connections_platform ON social_connections(platform);
CREATE INDEX IF NOT EXISTS idx_influencer_analytics_user_id ON influencer_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_brand_id ON campaigns(brand_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaign_applications_campaign_id ON campaign_applications(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_applications_influencer_id ON campaign_applications(influencer_id);
CREATE INDEX IF NOT EXISTS idx_campaign_applications_status ON campaign_applications(status);
CREATE INDEX IF NOT EXISTS idx_transactions_brand_id ON transactions(brand_id);
CREATE INDEX IF NOT EXISTS idx_transactions_influencer_id ON transactions(influencer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_ai_insights_subject ON ai_insights(subject_type, subject_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read);

-- Row Level Security (RLS) Policies
ALTER TABLE social_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE influencer_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (users can only access their own data)
CREATE POLICY "Users can view own social connections" ON social_connections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own social connections" ON social_connections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own social connections" ON social_connections FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own analytics" ON influencer_analytics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own analytics" ON influencer_analytics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own analytics" ON influencer_analytics FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own brand profile" ON brand_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own brand profile" ON brand_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own brand profile" ON brand_profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Brands can manage own campaigns" ON campaigns FOR ALL USING (auth.uid() = brand_id);
CREATE POLICY "All users can view active campaigns" ON campaigns FOR SELECT USING (status = 'active');

CREATE POLICY "Users can view applications for their campaigns" ON campaign_applications FOR SELECT USING (
  auth.uid() IN (
    SELECT brand_id FROM campaigns WHERE id = campaign_id
    UNION
    SELECT influencer_id
  )
);

CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own preferences" ON user_preferences FOR ALL USING (auth.uid() = user_id);

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_social_connections_updated_at BEFORE UPDATE ON social_connections FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_influencer_analytics_updated_at BEFORE UPDATE ON influencer_analytics FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_brand_profiles_updated_at BEFORE UPDATE ON brand_profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_campaign_applications_updated_at BEFORE UPDATE ON campaign_applications FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_ai_insights_updated_at BEFORE UPDATE ON ai_insights FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();