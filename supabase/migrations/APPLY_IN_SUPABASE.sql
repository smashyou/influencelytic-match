-- Migration 001: Initial Schema for Influencelytic-Match
-- This migration creates the core tables needed for the platform

-- 1. Social Media Connections Table
CREATE TABLE IF NOT EXISTS social_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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
  sentiment_score DECIMAL(3,2) DEFAULT 0,
  niche_categories JSONB DEFAULT '[]',
  content_types JSONB DEFAULT '[]',
  posting_frequency_per_week INTEGER DEFAULT 0,
  best_posting_times JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, platform)
);

-- 3. Brand Profiles Extension
CREATE TABLE IF NOT EXISTS brand_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- 4. User Preferences Table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- 5. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_social_connections_user_id ON social_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_social_connections_platform ON social_connections(platform);
CREATE INDEX IF NOT EXISTS idx_influencer_analytics_user_id ON influencer_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_brand_profiles_user_id ON brand_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read);

-- Function for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_social_connections_updated_at 
  BEFORE UPDATE ON social_connections 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_influencer_analytics_updated_at 
  BEFORE UPDATE ON influencer_analytics 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_brand_profiles_updated_at 
  BEFORE UPDATE ON brand_profiles 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at 
  BEFORE UPDATE ON user_preferences 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();-- Migration 002: Campaigns and Applications Schema

-- 1. Campaigns Table
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  brief TEXT,
  campaign_type VARCHAR(100) DEFAULT 'sponsored_post',
  budget_min INTEGER DEFAULT 0,
  budget_max INTEGER DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'USD',
  target_age_min INTEGER DEFAULT 13,
  target_age_max INTEGER DEFAULT 65,
  target_gender VARCHAR(50),
  target_locations JSONB DEFAULT '[]',
  target_interests JSONB DEFAULT '[]',
  required_platforms JSONB DEFAULT '[]',
  min_followers INTEGER DEFAULT 1000,
  max_followers INTEGER,
  min_engagement_rate DECIMAL(5,2) DEFAULT 1.0,
  max_fake_followers DECIMAL(5,2) DEFAULT 20.0,
  deliverables JSONB DEFAULT '[]',
  hashtags JSONB DEFAULT '[]',
  content_guidelines TEXT,
  application_deadline TIMESTAMPTZ,
  campaign_start_date TIMESTAMPTZ,
  campaign_end_date TIMESTAMPTZ,
  status VARCHAR(50) DEFAULT 'draft',
  max_applications INTEGER,
  selected_influencers_count INTEGER DEFAULT 0,
  total_budget_allocated INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Campaign Applications Table
CREATE TABLE IF NOT EXISTS campaign_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  influencer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending',
  proposed_rate INTEGER,
  currency VARCHAR(3) DEFAULT 'USD',
  application_message TEXT,
  portfolio_links JSONB DEFAULT '[]',
  ai_match_score DECIMAL(5,2),
  brand_rating INTEGER CHECK (brand_rating >= 1 AND brand_rating <= 5),
  influencer_rating INTEGER CHECK (influencer_rating >= 1 AND influencer_rating <= 5),
  completion_proof JSONB DEFAULT '[]',
  brand_feedback TEXT,
  influencer_notes TEXT,
  applied_at TIMESTAMPTZ DEFAULT now(),
  responded_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(campaign_id, influencer_id)
);

-- 3. Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id),
  application_id UUID REFERENCES campaign_applications(id),
  brand_id UUID REFERENCES auth.users(id),
  influencer_id UUID REFERENCES auth.users(id),
  amount INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  platform_fee_rate DECIMAL(5,2) DEFAULT 5.0,
  platform_fee INTEGER NOT NULL,
  brand_fee INTEGER DEFAULT 0,
  influencer_payout INTEGER NOT NULL,
  stripe_payment_intent_id VARCHAR(255),
  stripe_transfer_id VARCHAR(255),
  stripe_account_id VARCHAR(255),
  transaction_type VARCHAR(50) DEFAULT 'campaign_payment',
  status VARCHAR(50) DEFAULT 'pending',
  processed_at TIMESTAMPTZ,
  payout_date TIMESTAMPTZ,
  refund_amount INTEGER DEFAULT 0,
  refund_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_campaigns_brand_id ON campaigns(brand_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_deadline ON campaigns(application_deadline);
CREATE INDEX IF NOT EXISTS idx_campaign_applications_campaign_id ON campaign_applications(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_applications_influencer_id ON campaign_applications(influencer_id);
CREATE INDEX IF NOT EXISTS idx_campaign_applications_status ON campaign_applications(status);
CREATE INDEX IF NOT EXISTS idx_transactions_brand_id ON transactions(brand_id);
CREATE INDEX IF NOT EXISTS idx_transactions_influencer_id ON transactions(influencer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_campaign_id ON transactions(campaign_id);

-- Triggers for updated_at
CREATE TRIGGER update_campaigns_updated_at 
  BEFORE UPDATE ON campaigns 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_campaign_applications_updated_at 
  BEFORE UPDATE ON campaign_applications 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at 
  BEFORE UPDATE ON transactions 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();-- Migration 003: Analytics and AI Insights Schema

-- 1. AI Insights Table
CREATE TABLE IF NOT EXISTS ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_type VARCHAR(50) NOT NULL,
  subject_id UUID NOT NULL,
  insight_type VARCHAR(100) NOT NULL,
  confidence_score DECIMAL(5,2) CHECK (confidence_score >= 0 AND confidence_score <= 100),
  data JSONB DEFAULT '{}',
  explanation TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Platform Metrics Table
CREATE TABLE IF NOT EXISTS platform_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date_recorded DATE NOT NULL,
  total_users INTEGER DEFAULT 0,
  total_influencers INTEGER DEFAULT 0,
  total_brands INTEGER DEFAULT 0,
  active_campaigns INTEGER DEFAULT 0,
  completed_campaigns INTEGER DEFAULT 0,
  total_transactions INTEGER DEFAULT 0,
  total_revenue INTEGER DEFAULT 0,
  avg_campaign_budget INTEGER DEFAULT 0,
  avg_influencer_rate INTEGER DEFAULT 0,
  top_niches JSONB DEFAULT '[]',
  top_locations JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(date_recorded)
);

-- 3. Content Performance Table
CREATE TABLE IF NOT EXISTS content_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL,
  content_id VARCHAR(255) NOT NULL,
  content_type VARCHAR(50),
  posted_at TIMESTAMPTZ,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2) DEFAULT 0,
  hashtags JSONB DEFAULT '[]',
  mentions JSONB DEFAULT '[]',
  is_sponsored BOOLEAN DEFAULT false,
  campaign_id UUID REFERENCES campaigns(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, platform, content_id)
);

-- 4. Audience Demographics History
CREATE TABLE IF NOT EXISTS audience_demographics_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL,
  recorded_date DATE NOT NULL,
  follower_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2) DEFAULT 0,
  demographics_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, platform, recorded_date)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_ai_insights_subject ON ai_insights(subject_type, subject_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_type ON ai_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_platform_metrics_date ON platform_metrics(date_recorded);
CREATE INDEX IF NOT EXISTS idx_content_performance_user ON content_performance(user_id, platform);
CREATE INDEX IF NOT EXISTS idx_content_performance_campaign ON content_performance(campaign_id);
CREATE INDEX IF NOT EXISTS idx_audience_history_user ON audience_demographics_history(user_id, platform);
CREATE INDEX IF NOT EXISTS idx_audience_history_date ON audience_demographics_history(recorded_date);

-- Triggers for updated_at
CREATE TRIGGER update_ai_insights_updated_at 
  BEFORE UPDATE ON ai_insights 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_content_performance_updated_at 
  BEFORE UPDATE ON content_performance 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();-- Migration 004: Row Level Security Policies

-- Enable RLS on all tables
ALTER TABLE social_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE influencer_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE audience_demographics_history ENABLE ROW LEVEL SECURITY;

-- Social Connections Policies
CREATE POLICY "Users can view own social connections" 
  ON social_connections FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own social connections" 
  ON social_connections FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own social connections" 
  ON social_connections FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own social connections" 
  ON social_connections FOR DELETE 
  USING (auth.uid() = user_id);

-- Influencer Analytics Policies
CREATE POLICY "Users can view own analytics" 
  ON influencer_analytics FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Brands can view influencer analytics for discovery" 
  ON influencer_analytics FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM brand_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert analytics" 
  ON influencer_analytics FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update analytics" 
  ON influencer_analytics FOR UPDATE 
  USING (auth.uid() = user_id);

-- Brand Profiles Policies
CREATE POLICY "Anyone can view brand profiles" 
  ON brand_profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can manage own brand profile" 
  ON brand_profiles FOR ALL 
  USING (auth.uid() = user_id);

-- Campaigns Policies
CREATE POLICY "Anyone can view active campaigns" 
  ON campaigns FOR SELECT 
  USING (status IN ('active', 'completed'));

CREATE POLICY "Brands can view own campaigns" 
  ON campaigns FOR SELECT 
  USING (auth.uid() = brand_id);

CREATE POLICY "Brands can create campaigns" 
  ON campaigns FOR INSERT 
  WITH CHECK (auth.uid() = brand_id);

CREATE POLICY "Brands can update own campaigns" 
  ON campaigns FOR UPDATE 
  USING (auth.uid() = brand_id);

CREATE POLICY "Brands can delete own draft campaigns" 
  ON campaigns FOR DELETE 
  USING (auth.uid() = brand_id AND status = 'draft');

-- Campaign Applications Policies
CREATE POLICY "Influencers can view own applications" 
  ON campaign_applications FOR SELECT 
  USING (auth.uid() = influencer_id);

CREATE POLICY "Brands can view applications for their campaigns" 
  ON campaign_applications FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE campaigns.id = campaign_applications.campaign_id 
      AND campaigns.brand_id = auth.uid()
    )
  );

CREATE POLICY "Influencers can create applications" 
  ON campaign_applications FOR INSERT 
  WITH CHECK (auth.uid() = influencer_id);

CREATE POLICY "Influencers can update own applications" 
  ON campaign_applications FOR UPDATE 
  USING (auth.uid() = influencer_id AND status = 'pending');

CREATE POLICY "Brands can update application status" 
  ON campaign_applications FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE campaigns.id = campaign_applications.campaign_id 
      AND campaigns.brand_id = auth.uid()
    )
  );

-- Transactions Policies
CREATE POLICY "Users can view own transactions" 
  ON transactions FOR SELECT 
  USING (auth.uid() IN (brand_id, influencer_id));

CREATE POLICY "System can create transactions" 
  ON transactions FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaign_applications 
      WHERE campaign_applications.id = application_id 
      AND (campaign_applications.influencer_id = auth.uid() 
        OR EXISTS (
          SELECT 1 FROM campaigns 
          WHERE campaigns.id = campaign_applications.campaign_id 
          AND campaigns.brand_id = auth.uid()
        )
      )
    )
  );

-- Notifications Policies
CREATE POLICY "Users can view own notifications" 
  ON notifications FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" 
  ON notifications FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" 
  ON notifications FOR INSERT 
  WITH CHECK (true);

-- User Preferences Policies
CREATE POLICY "Users can manage own preferences" 
  ON user_preferences FOR ALL 
  USING (auth.uid() = user_id);

-- AI Insights Policies
CREATE POLICY "Users can view relevant insights" 
  ON ai_insights FOR SELECT 
  USING (
    subject_id = auth.uid() 
    OR subject_type = 'platform'
    OR EXISTS (
      SELECT 1 FROM campaigns 
      WHERE campaigns.id = subject_id 
      AND (campaigns.brand_id = auth.uid() OR status = 'active')
    )
  );

-- Content Performance Policies
CREATE POLICY "Users can view own content performance" 
  ON content_performance FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Brands can view campaign content performance" 
  ON content_performance FOR SELECT 
  USING (
    campaign_id IS NOT NULL 
    AND EXISTS (
      SELECT 1 FROM campaigns 
      WHERE campaigns.id = content_performance.campaign_id 
      AND campaigns.brand_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own content performance" 
  ON content_performance FOR ALL 
  USING (auth.uid() = user_id);

-- Audience Demographics History Policies
CREATE POLICY "Users can view own audience history" 
  ON audience_demographics_history FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own audience history" 
  ON audience_demographics_history FOR ALL 
  USING (auth.uid() = user_id);-- Add missing columns to existing tables
-- Run this after creating the base tables

-- Add budget column to campaigns table if it doesn't exist
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS budget DECIMAL(10, 2);

-- Add is_mock column to social_connections table if it doesn't exist
ALTER TABLE social_connections 
ADD COLUMN IF NOT EXISTS is_mock BOOLEAN DEFAULT false;

-- Add is_mock column to influencer_analytics table if it doesn't exist
ALTER TABLE influencer_analytics 
ADD COLUMN IF NOT EXISTS is_mock BOOLEAN DEFAULT false;

-- Update existing rows to have default values
UPDATE campaigns SET budget = 5000 WHERE budget IS NULL;
UPDATE social_connections SET is_mock = false WHERE is_mock IS NULL;
UPDATE influencer_analytics SET is_mock = false WHERE is_mock IS NULL;

-- Verify columns were added
SELECT 
  'budget column added to campaigns' AS status 
WHERE EXISTS (
  SELECT FROM information_schema.columns 
  WHERE table_schema = 'public' 
  AND table_name = 'campaigns' 
  AND column_name = 'budget'
)
UNION ALL
SELECT 
  'is_mock column added to social_connections' AS status 
WHERE EXISTS (
  SELECT FROM information_schema.columns 
  WHERE table_schema = 'public' 
  AND table_name = 'social_connections' 
  AND column_name = 'is_mock'
)
UNION ALL
SELECT 
  'is_mock column added to influencer_analytics' AS status 
WHERE EXISTS (
  SELECT FROM information_schema.columns 
  WHERE table_schema = 'public' 
  AND table_name = 'influencer_analytics' 
  AND column_name = 'is_mock'
);-- Add all missing columns to existing tables
-- Run this to fix schema issues

-- Add missing columns to campaigns table
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Add missing columns to social_connections table
ALTER TABLE social_connections 
ADD COLUMN IF NOT EXISTS profile_data JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS username TEXT;

-- Add missing columns to influencer_analytics table if needed
ALTER TABLE influencer_analytics 
ADD COLUMN IF NOT EXISTS follower_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS post_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS engagement_rate DECIMAL(5, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS avg_likes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS avg_comments INTEGER DEFAULT 0;

-- Add missing columns to campaign_applications table if needed
ALTER TABLE campaign_applications 
ADD COLUMN IF NOT EXISTS proposed_rate DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS message TEXT,
ADD COLUMN IF NOT EXISTS portfolio_links TEXT[];

-- Update existing campaigns with default values
UPDATE campaigns 
SET 
  category = 'general',
  start_date = NOW(),
  end_date = NOW() + INTERVAL '30 days',
  status = 'active'
WHERE category IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_campaigns_category ON campaigns(category);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_dates ON campaigns(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_social_connections_username ON social_connections(username);

-- Verify all columns exist
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name IN ('campaigns', 'social_connections', 'influencer_analytics', 'campaign_applications')
ORDER BY table_name, ordinal_position;-- Add requirements column to campaigns table
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS requirements JSONB DEFAULT '{}';

-- Also add any other missing columns that might be needed
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES profiles(id);

-- Verify the column was added
SELECT 
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'campaigns'
ORDER BY ordinal_position;-- Fix Missing Tables: profiles and transactions
-- Run this in Supabase SQL Editor if these tables are missing

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  first_name TEXT,
  last_name TEXT,
  role TEXT CHECK (role IN ('influencer', 'brand', 'admin')),
  bio TEXT,
  avatar_url TEXT,
  company_name TEXT,
  website TEXT,
  location TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  influencer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  brand_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  payment_method TEXT,
  stripe_payment_intent_id TEXT,
  stripe_charge_id TEXT,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_transactions_campaign_id ON transactions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_transactions_influencer_id ON transactions(influencer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_brand_id ON transactions(brand_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for transactions
CREATE POLICY "Users can view their own transactions" ON transactions
  FOR SELECT USING (
    auth.uid() = influencer_id OR 
    auth.uid() = brand_id
  );

CREATE POLICY "Brands can create transactions" ON transactions
  FOR INSERT WITH CHECK (
    auth.uid() = brand_id
  );

CREATE POLICY "Users can update their own transactions" ON transactions
  FOR UPDATE USING (
    auth.uid() = brand_id OR 
    auth.uid() = influencer_id
  );

-- Create function to handle profile updates
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Grant permissions
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON transactions TO authenticated;
GRANT ALL ON profiles TO service_role;
GRANT ALL ON transactions TO service_role;

-- Create a function to automatically create a profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, created_at, updated_at)
  VALUES (new.id, new.email, now(), now());
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add sample comment to verify tables
COMMENT ON TABLE profiles IS 'User profiles for influencers and brands';
COMMENT ON TABLE transactions IS 'Payment transactions between brands and influencers';

-- Verify tables were created
SELECT 'profiles table created' AS status WHERE EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_name = 'profiles'
)
UNION ALL
SELECT 'transactions table created' AS status WHERE EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_name = 'transactions'
);-- Influencelytic-Match Extended Database Schema
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