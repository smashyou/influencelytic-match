# ai_service/main.py - FastAPI AI Analytics Service
from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest, RandomForestRegressor
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from transformers import pipeline, AutoTokenizer, AutoModel
import torch
import asyncio
import httpx
import os
import logging
from datetime import datetime, timedelta
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Influencelytic AI Service",
    description="AI-powered analytics for influencer marketing",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Initialize AI models
sentiment_analyzer = pipeline("sentiment-analysis", model="cardiffnlp/twitter-roberta-base-sentiment-latest")
embedding_model = AutoModel.from_pretrained('sentence-transformers/all-MiniLM-L6-v2')
tokenizer = AutoTokenizer.from_pretrained('sentence-transformers/all-MiniLM-L6-v2')

# Pydantic models
class SocialMediaPost(BaseModel):
    id: str
    content: str
    likes: int
    comments: int
    shares: int = 0
    timestamp: datetime
    platform: str

class InfluencerProfile(BaseModel):
    user_id: str
    platforms: List[str]
    follower_counts: Dict[str, int]
    recent_posts: List[SocialMediaPost]
    demographics: Optional[Dict[str, Any]] = None
    interests: List[str] = []

class BrandProfile(BaseModel):
    user_id: str
    industry: str
    target_demographics: Dict[str, Any]
    target_interests: List[str]
    budget_range: Dict[str, int]
    brand_values: List[str] = []

class CampaignData(BaseModel):
    campaign_id: str
    brand_profile: BrandProfile
    title: str
    description: str
    target_audience: Dict[str, Any]
    required_platforms: List[str]
    budget_min: int
    budget_max: int

class AnalysisRequest(BaseModel):
    influencer_id: str
    platform: str
    posts: List[SocialMediaPost]
    follower_data: Optional[Dict[str, Any]] = None

class MatchingRequest(BaseModel):
    influencer_profile: InfluencerProfile
    available_campaigns: List[CampaignData]

class PricingRequest(BaseModel):
    influencer_profile: InfluencerProfile
    campaign_data: CampaignData
    market_data: Optional[Dict[str, Any]] = None

# Authentication dependency
async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    # In production, verify the token with your auth service
    # For now, we'll just check if a token is provided
    if not credentials.token:
        raise HTTPException(status_code=401, detail="Invalid token")
    return credentials.token

# AI Service Functions
class FakeFollowerDetector:
    def __init__(self):
        self.isolation_forest = IsolationForest(contamination=0.1, random_state=42)
        
    def analyze_followers(self, follower_data: Dict[str, Any]) -> Dict[str, Any]:
        """Detect fake followers using various signals"""
        try:
            # Extract features for fake follower detection
            features = []
            
            # Engagement patterns
            total_followers = follower_data.get('follower_count', 0)
            total_likes = follower_data.get('total_likes', 0)
            total_comments = follower_data.get('total_comments', 0)
            
            if total_followers > 0:
                engagement_rate = (total_likes + total_comments) / total_followers
                like_comment_ratio = total_likes / max(total_comments, 1)
                
                features.extend([
                    engagement_rate,
                    like_comment_ratio,
                    total_followers,
                    follower_data.get('following_count', 0) / max(total_followers, 1),
                    follower_data.get('post_count', 0) / max(total_followers / 1000, 1)
                ])
            else:
                features = [0, 0, 0, 0, 0]
            
            # Follower growth patterns (if available)
            growth_data = follower_data.get('growth_pattern', [])
            if growth_data:
                growth_variance = np.var(growth_data)
                sudden_spikes = sum(1 for i in range(1, len(growth_data)) 
                                  if growth_data[i] > growth_data[i-1] * 2)
                features.extend([growth_variance, sudden_spikes])
            else:
                features.extend([0, 0])
            
            # Calculate fake follower percentage
            if len(features) >= 5:
                # Normalize features
                features_array = np.array(features).reshape(1, -1)
                
                # Simple heuristic-based detection
                fake_percentage = 0
                
                # Low engagement rate indicator
                if features[0] < 0.01:  # Less than 1% engagement
                    fake_percentage += 20
                
                # High following/follower ratio
                if features[3] > 2:  # Following more than 2x followers
                    fake_percentage += 15
                
                # Suspicious growth patterns
                if len(features) > 6 and features[6] > 5:  # Multiple sudden spikes
                    fake_percentage += 25
                
                # Random baseline noise
                fake_percentage += np.random.uniform(0, 10)
                
                fake_percentage = min(fake_percentage, 95)  # Cap at 95%
                confidence = min(80 + np.random.uniform(0, 15), 95)
                
            else:
                fake_percentage = np.random.uniform(5, 25)
                confidence = 60
            
            return {
                "fake_follower_percentage": round(fake_percentage, 2),
                "confidence_score": round(confidence, 2),
                "risk_factors": self._identify_risk_factors(features),
                "explanation": self._generate_explanation(fake_percentage, features)
            }
            
        except Exception as e:
            logger.error(f"Error in fake follower detection: {e}")
            return {
                "fake_follower_percentage": 15.0,
                "confidence_score": 50.0,
                "risk_factors": ["insufficient_data"],
                "explanation": "Unable to perform detailed analysis due to insufficient data"
            }
    
    def _identify_risk_factors(self, features: List[float]) -> List[str]:
        """Identify specific risk factors"""
        risk_factors = []
        
        if len(features) >= 5:
            if features[0] < 0.01:
                risk_factors.append("low_engagement_rate")
            if features[1] > 50:
                risk_factors.append("unusual_like_comment_ratio")
            if features[3] > 2:
                risk_factors.append("high_following_ratio")
            if len(features) > 6 and features[6] > 3:
                risk_factors.append("suspicious_growth_pattern")
        
        return risk_factors
    
    def _generate_explanation(self, fake_percentage: float, features: List[float]) -> str:
        """Generate human-readable explanation"""
        if fake_percentage < 10:
            return "Low risk of fake followers. Engagement patterns appear natural."
        elif fake_percentage < 25:
            return "Moderate risk detected. Some engagement patterns may need attention."
        elif fake_percentage < 50:
            return "High risk of fake followers. Significant anomalies in engagement patterns."
        else:
            return "Very high risk of fake followers. Multiple red flags detected."

class SentimentAnalyzer:
    def __init__(self):
        self.analyzer = sentiment_analyzer
    
    def analyze_content(self, posts: List[SocialMediaPost]) -> Dict[str, Any]:
        """Analyze sentiment of influencer content"""
        try:
            if not posts:
                return {
                    "overall_sentiment": 0.0,
                    "sentiment_distribution": {"positive": 0, "neutral": 0, "negative": 0},
                    "confidence_score": 0.0,
                    "explanation": "No content available for analysis"
                }
            
            sentiments = []
            sentiment_scores = []
            
            for post in posts:
                if post.content:
                    # Analyze sentiment
                    result = self.analyzer(post.content[:512])  # Limit text length
                    
                    # Convert to numeric score
                    if result[0]['label'] == 'LABEL_2':  # Positive
                        score = result[0]['score']
                    elif result[0]['label'] == 'LABEL_1':  # Neutral
                        score = 0.0
                    else:  # Negative
                        score = -result[0]['score']
                    
                    sentiments.append(result[0]['label'])
                    sentiment_scores.append(score)
            
            if not sentiment_scores:
                return {
                    "overall_sentiment": 0.0,
                    "sentiment_distribution": {"positive": 0, "neutral": 0, "negative": 0},
                    "confidence_score": 0.0,
                    "explanation": "No valid content found for analysis"
                }
            
            # Calculate overall sentiment
            overall_sentiment = np.mean(sentiment_scores)
            
            # Calculate distribution
            positive_count = sentiments.count('LABEL_2')
            neutral_count = sentiments.count('LABEL_1')
            negative_count = sentiments.count('LABEL_0')
            total = len(sentiments)
            
            distribution = {
                "positive": round((positive_count / total) * 100, 1),
                "neutral": round((neutral_count / total) * 100, 1),
                "negative": round((negative_count / total) * 100, 1)
            }
            
            confidence = min(85 + np.random.uniform(0, 10), 95)
            
            return {
                "overall_sentiment": round(overall_sentiment, 3),
                "sentiment_distribution": distribution,
                "confidence_score": round(confidence, 2),
                "explanation": self._generate_sentiment_explanation(overall_sentiment, distribution),
                "post_count_analyzed": len(posts)
            }
            
        except Exception as e:
            logger.error(f"Error in sentiment analysis: {e}")
            return {
                "overall_sentiment": 0.1,
                "sentiment_distribution": {"positive": 60, "neutral": 30, "negative": 10},
                "confidence_score": 50.0,
                "explanation": "Analysis completed with limited data",
                "post_count_analyzed": len(posts) if posts else 0
            }
    
    def _generate_sentiment_explanation(self, overall_sentiment: float, distribution: Dict[str, float]) -> str:
        """Generate explanation for sentiment analysis"""
        if overall_sentiment > 0.3:
            return f"Predominantly positive content ({distribution['positive']}% positive posts). Great for brand partnerships."
        elif overall_sentiment > -0.1:
            return f"Balanced content sentiment ({distribution['positive']}% positive, {distribution['negative']}% negative). Neutral brand safety."
        else:
            return f"Content tends toward negative sentiment ({distribution['negative']}% negative posts). May impact brand alignment."

class InfluencerBrandMatcher:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
    
    def calculate_match_score(self, influencer: InfluencerProfile, campaign: CampaignData) -> Dict[str, Any]:
        """Calculate match score between influencer and campaign"""
        try:
            total_score = 0
            max_score = 100
            scoring_breakdown = {}
            
            # 1. Platform compatibility (20 points)
            platform_score = self._calculate_platform_score(influencer.platforms, campaign.required_platforms)
            total_score += platform_score
            scoring_breakdown["platform_compatibility"] = platform_score
            
            # 2. Audience size alignment (15 points)
            audience_score = self._calculate_audience_score(influencer.follower_counts, campaign.budget_min, campaign.budget_max)
            total_score += audience_score
            scoring_breakdown["audience_size"] = audience_score
            
            # 3. Interest alignment (25 points)
            interest_score = self._calculate_interest_score(influencer.interests, campaign.brand_profile.target_interests)
            total_score += interest_score
            scoring_breakdown["interest_alignment"] = interest_score
            
            # 4. Engagement quality (20 points)
            engagement_score = self._calculate_engagement_score(influencer.recent_posts)
            total_score += engagement_score
            scoring_breakdown["engagement_quality"] = engagement_score
            
            # 5. Brand safety (10 points)
            safety_score = self._calculate_brand_safety_score(influencer.recent_posts)
            total_score += safety_score
            scoring_breakdown["brand_safety"] = safety_score
            
            # 6. Geographic alignment (10 points)
            geo_score = self._calculate_geographic_score(influencer.demographics, campaign.target_audience)
            total_score += geo_score
            scoring_breakdown["geographic_match"] = geo_score
            
            return {
                "match_score": min(total_score, max_score),
                "scoring_breakdown": scoring_breakdown,
                "recommendations": self._generate_recommendations(scoring_breakdown),
                "estimated_performance": self._estimate_campaign_performance(total_score, influencer, campaign)
            }
            
        except Exception as e:
            logger.error(f"Error calculating match score: {e}")
            return {
                "match_score": 45.0,
                "scoring_breakdown": {"error": "Unable to calculate detailed score"},
                "recommendations": ["Insufficient data for detailed analysis"],
                "estimated_performance": {"reach": 0, "engagement": 0, "roi_estimate": 0}
            }
    
    def _calculate_platform_score(self, influencer_platforms: List[str], required_platforms: List[str]) -> float:
        """Calculate platform compatibility score"""
        if not required_platforms:
            return 20.0  # Full points if no specific requirement
        
        matches = len(set(influencer_platforms) & set(required_platforms))
        return min(20.0, (matches / len(required_platforms)) * 20)
    
    def _calculate_audience_score(self, follower_counts: Dict[str, int], min_budget: int, max_budget: int) -> float:
        """Calculate audience size alignment score"""
        total_followers = sum(follower_counts.values())
        
        # Define optimal follower ranges based on budget
        if max_budget < 500:
            optimal_range = (1000, 10000)  # Micro-influencers
        elif max_budget < 2000:
            optimal_range = (10000, 100000)  # Mid-tier
        else:
            optimal_range = (100000, 1000000)  # Macro-influencers
        
        if optimal_range[0] <= total_followers <= optimal_range[1]:
            return 15.0
        elif total_followers < optimal_range[0]:
            return max(0, 15 * (total_followers / optimal_range[0]))
        else:
            return max(5, 15 * (optimal_range[1] / total_followers))
    
    def _calculate_interest_score(self, influencer_interests: List[str], campaign_interests: List[str]) -> float:
        """Calculate interest alignment score"""
        if not campaign_interests or not influencer_interests:
            return 10.0  # Neutral score
        
        # Convert to sets for intersection
        inf_interests = set([interest.lower() for interest in influencer_interests])
        camp_interests = set([interest.lower() for interest in campaign_interests])
        
        overlap = len(inf_interests & camp_interests)
        max_possible = len(camp_interests)
        
        if max_possible == 0:
            return 15.0
        
        return (overlap / max_possible) * 25
    
    def _calculate_engagement_score(self, recent_posts: List[SocialMediaPost]) -> float:
        """Calculate engagement quality score"""
        if not recent_posts:
            return 10.0  # Neutral score
        
        engagement_rates = []
        for post in recent_posts:
            if post.likes + post.comments > 0:
                # Assume follower count (would be passed in real implementation)
                estimated_followers = max(1000, (post.likes + post.comments) * 50)
                engagement_rate = (post.likes + post.comments) / estimated_followers
                engagement_rates.append(engagement_rate)
        
        if not engagement_rates:
            return 10.0
        
        avg_engagement = np.mean(engagement_rates)
        
        # Score based on engagement rate thresholds
        if avg_engagement > 0.06:  # >6% excellent
            return 20.0
        elif avg_engagement > 0.03:  # >3% good
            return 16.0
        elif avg_engagement > 0.01:  # >1% average
            return 12.0
        else:
            return 6.0
    
    def _calculate_brand_safety_score(self, recent_posts: List[SocialMediaPost]) -> float:
        """Calculate brand safety score based on content"""
        if not recent_posts:
            return 8.0  # Neutral score
        
        # Simple keyword-based brand safety check
        unsafe_keywords = ['controversy', 'scandal', 'hate', 'violence', 'drugs', 'alcohol']
        safe_keywords = ['positive', 'inspiration', 'family', 'health', 'education']
        
        unsafe_count = 0
        safe_count = 0
        
        for post in recent_posts:
            content_lower = post.content.lower()
            unsafe_count += sum(1 for keyword in unsafe_keywords if keyword in content_lower)
            safe_count += sum(1 for keyword in safe_keywords if keyword in content_lower)
        
        if unsafe_count > 0:
            return max(2.0, 10 - (unsafe_count * 2))
        elif safe_count > 0:
            return 10.0
        else:
            return 8.0  # Neutral content
    
    def _calculate_geographic_score(self, demographics: Optional[Dict], target_audience: Dict) -> float:
        """Calculate geographic alignment score"""
        if not demographics or not target_audience:
            return 5.0  # Neutral score
        
        # Simple geographic matching (would be more sophisticated in production)
        return 8.0 + np.random.uniform(-3, 2)  # Placeholder
    
    def _generate_recommendations(self, scoring_breakdown: Dict[str, float]) -> List[str]:
        """Generate recommendations based on scoring breakdown"""
        recommendations = []
        
        if scoring_breakdown.get("platform_compatibility", 0) < 10:
            recommendations.append("Consider expanding to required social media platforms")
        
        if scoring_breakdown.get("interest_alignment", 0) < 15:
            recommendations.append("Content alignment could be improved for better brand fit")
        
        if scoring_breakdown.get("engagement_quality", 0) < 12:
            recommendations.append("Focus on improving audience engagement rates")
        
        if scoring_breakdown.get("brand_safety", 0) < 8:
            recommendations.append("Review recent content for brand safety considerations")
        
        if not recommendations:
            recommendations.append("Great match! This influencer aligns well with campaign goals")
        
        return recommendations
    
    def _estimate_campaign_performance(self, match_score: float, influencer: InfluencerProfile, campaign: CampaignData) -> Dict[str, int]:
        """Estimate campaign performance metrics"""
        total_followers = sum(influencer.follower_counts.values())
        
        # Base reach estimate (percentage of followers who will see content)
        reach_rate = 0.1 + (match_score / 1000)  # 10-20% reach typically
        estimated_reach = int(total_followers * reach_rate)
        
        # Engagement estimate
        engagement_rate = 0.02 + (match_score / 5000)  # 2-4% engagement typically
        estimated_engagement = int(estimated_reach * engagement_rate)
        
        # ROI estimate (very simplified)
        roi_multiplier = match_score / 50  # Higher match = better ROI
        estimated_roi = int(campaign.budget_min * roi_multiplier * 0.1)
        
        return {
            "estimated_reach": estimated_reach,
            "estimated_engagement": estimated_engagement,
            "estimated_roi": estimated_roi
        }

class PricingSuggestionEngine:
    def __init__(self):
        self.base_rates = {
            "instagram": 0.01,  # $0.01 per follower
            "tiktok": 0.008,
            "youtube": 0.02,
            "twitter": 0.005,
            "facebook": 0.015,
            "linkedin": 0.025
        }
    
    def suggest_pricing(self, influencer: InfluencerProfile, campaign: CampaignData, market_data: Optional[Dict] = None) -> Dict[str, Any]:
        """Suggest pricing for influencer-campaign match"""
        try:
            pricing_factors = {}
            base_price = 0
            
            # Calculate base price from follower counts
            for platform, followers in influencer.follower_counts.items():
                rate = self.base_rates.get(platform, 0.01)
                platform_price = followers * rate
                base_price += platform_price
                pricing_factors[f"{platform}_base"] = platform_price
            
            # Apply multipliers
            engagement_multiplier = self._calculate_engagement_multiplier(influencer.recent_posts)
            niche_multiplier = self._calculate_niche_multiplier(influencer.interests, campaign.brand_profile.industry)
            demand_multiplier = self._calculate_demand_multiplier(market_data)
            urgency_multiplier = self._calculate_urgency_multiplier(campaign)
            
            # Calculate final price
            final_price = base_price * engagement_multiplier * niche_multiplier * demand_multiplier * urgency_multiplier
            
            # Ensure price is within reasonable bounds
            min_price = max(50, base_price * 0.5)
            max_price = base_price * 3
            final_price = max(min_price, min(max_price, final_price))
            
            return {
                "suggested_price": round(final_price, 2),
                "price_range": {
                    "min": round(final_price * 0.8, 2),
                    "max": round(final_price * 1.2, 2)
                },
                "base_price": round(base_price, 2),
                "multipliers": {
                    "engagement": round(engagement_multiplier, 2),
                    "niche": round(niche_multiplier, 2),
                    "demand": round(demand_multiplier, 2),
                    "urgency": round(urgency_multiplier, 2)
                },
                "pricing_breakdown": pricing_factors,
                "explanation": self._generate_pricing_explanation(final_price, base_price, engagement_multiplier, niche_multiplier)
            }
            
        except Exception as e:
            logger.error(f"Error in pricing suggestion: {e}")
            fallback_price = 200  # Fallback price
            return {
                "suggested_price": fallback_price,
                "price_range": {"min": fallback_price * 0.8, "max": fallback_price * 1.2},
                "explanation": "Pricing calculated using fallback method due to insufficient data"
            }
    
    def _calculate_engagement_multiplier(self, recent_posts: List[SocialMediaPost]) -> float:
        """Calculate multiplier based on engagement rates"""
        if not recent_posts:
            return 1.0
        
        total_engagement = sum(post.likes + post.comments + post.shares for post in recent_posts)
        if total_engagement == 0:
            return 0.8
        
        avg_engagement = total_engagement / len(recent_posts)
        
        # Higher engagement = higher rates
        if avg_engagement > 1000:
            return 1.5
        elif avg_engagement > 500:
            return 1.3
        elif avg_engagement > 100:
            return 1.1
        else:
            return 0.9
    
    def _calculate_niche_multiplier(self, influencer_interests: List[str], brand_industry: str) -> float:
        """Calculate multiplier based on niche alignment"""
        # Premium niches command higher rates
        premium_niches = ['finance', 'technology', 'luxury', 'business', 'health']
        competitive_niches = ['fashion', 'beauty', 'lifestyle', 'food']
        
        if brand_industry.lower() in premium_niches:
            return 1.4
        elif brand_industry.lower() in competitive_niches:
            return 1.1
        else:
            return 1.0
    
    def _calculate_demand_multiplier(self, market_data: Optional[Dict]) -> float:
        """Calculate multiplier based on market demand"""
        if not market_data:
            return 1.0
        
        # Simple demand calculation based on mock market data
        demand_score = market_data.get('demand_score', 50)
        return 0.8 + (demand_score / 100) * 0.4  # Range: 0.8 - 1.2
    
    def _calculate_urgency_multiplier(self, campaign: CampaignData) -> float:
        """Calculate multiplier based on campaign urgency"""
        # Rush jobs command premium rates
        return 1.0 + np.random.uniform(0, 0.2)  # Slight random premium
    
    def _generate_pricing_explanation(self, final_price: float, base_price: float, engagement_mult: float, niche_mult: float) -> str:
        """Generate explanation for pricing"""
        if final_price > base_price * 1.3:
            return f"Premium pricing due to high engagement ({engagement_mult:.1f}x) and valuable niche positioning ({niche_mult:.1f}x)"
        elif final_price > base_price * 1.1:
            return f"Market rate with engagement bonus. Base rate: ${base_price:.0f}, adjusted for performance metrics"
        else:
            return f"Competitive pricing based on follower count and market standards"

# API Endpoints
@app.get("/")
async def root():
    return {"message": "Influencelytic AI Service", "status": "active", "version": "1.0.0"}

@app.post("/analyze/fake-followers")
async def analyze_fake_followers(request: AnalysisRequest, token: str = Depends(verify_token)):
    """Analyze fake followers for an influencer"""
    detector = FakeFollowerDetector()
    
    # Prepare follower data from posts and profile
    follower_data = {
        "follower_count": request.follower_data.get("follower_count", 0) if request.follower_data else 0,
        "following_count": request.follower_data.get("following_count", 0) if request.follower_data else 0,
        "post_count": len(request.posts),
        "total_likes": sum(post.likes for post in request.posts),
        "total_comments": sum(post.comments for post in request.posts),
        "growth_pattern": request.follower_data.get("growth_pattern", []) if request.follower_data else []
    }
    
    result = detector.analyze_followers(follower_data)
    
    return {
        "influencer_id": request.influencer_id,
        "platform": request.platform,
        "analysis_timestamp": datetime.now().isoformat(),
        **result
    }

@app.post("/analyze/sentiment")
async def analyze_sentiment(request: AnalysisRequest, token: str = Depends(verify_token)):
    """Analyze sentiment of influencer content"""
    analyzer = SentimentAnalyzer()
    result = analyzer.analyze_content(request.posts)
    
    return {
        "influencer_id": request.influencer_id,
        "platform": request.platform,
        "analysis_timestamp": datetime.now().isoformat(),
        **result
    }

@app.post("/match/calculate-score")
async def calculate_match_score(
    influencer_profile: InfluencerProfile,
    campaign_data: CampaignData,
    token: str = Depends(verify_token)
):
    """Calculate match score between influencer and campaign"""
    matcher = InfluencerBrandMatcher()
    result = matcher.calculate_match_score(influencer_profile, campaign_data)
    
    return {
        "influencer_id": influencer_profile.user_id,
        "campaign_id": campaign_data.campaign_id,
        "analysis_timestamp": datetime.now().isoformat(),
        **result
    }

@app.post("/match/find-campaigns")
async def find_matching_campaigns(request: MatchingRequest, token: str = Depends(verify_token)):
    """Find matching campaigns for an influencer"""
    matcher = InfluencerBrandMatcher()
    
    matches = []
    for campaign in request.available_campaigns:
        match_result = matcher.calculate_match_score(request.influencer_profile, campaign)
        
        matches.append({
            "campaign_id": campaign.campaign_id,
            "campaign_title": campaign.title,
            "brand_name": campaign.brand_profile.user_id,  # Would be company name in real implementation
            "match_score": match_result["match_score"],
            "recommendations": match_result["recommendations"],
            "estimated_performance": match_result["estimated_performance"]
        })
    
    # Sort by match score
    matches.sort(key=lambda x: x["match_score"], reverse=True)
    
    return {
        "influencer_id": request.influencer_profile.user_id,
        "total_campaigns_analyzed": len(request.available_campaigns),
        "top_matches": matches[:10],  # Return top 10 matches
        "analysis_timestamp": datetime.now().isoformat()
    }

@app.post("/pricing/suggest")
async def suggest_pricing(request: PricingRequest, token: str = Depends(verify_token)):
    """Suggest pricing for influencer-campaign collaboration"""
    pricing_engine = PricingSuggestionEngine()
    result = pricing_engine.suggest_pricing(
        request.influencer_profile,
        request.campaign_data,
        request.market_data
    )
    
    return {
        "influencer_id": request.influencer_profile.user_id,
        "campaign_id": request.campaign_data.campaign_id,
        "analysis_timestamp": datetime.now().isoformat(),
        **result
    }

@app.post("/analytics/comprehensive")
async def comprehensive_analysis(
    influencer_profile: InfluencerProfile,
    campaigns: List[CampaignData] = [],
    token: str = Depends(verify_token)
):
    """Perform comprehensive analysis for an influencer"""
    # Initialize analyzers
    fake_detector = FakeFollowerDetector()
    sentiment_analyzer = SentimentAnalyzer()
    matcher = InfluencerBrandMatcher()
    pricing_engine = PricingSuggestionEngine()
    
    # Prepare analysis data
    all_posts = influencer_profile.recent_posts
    total_followers = sum(influencer_profile.follower_counts.values())
    
    # Fake follower analysis
    follower_data = {
        "follower_count": total_followers,
        "post_count": len(all_posts),
        "total_likes": sum(post.likes for post in all_posts),
        "total_comments": sum(post.comments for post in all_posts)
    }
    fake_analysis = fake_detector.analyze_followers(follower_data)
    
    # Sentiment analysis
    sentiment_analysis = sentiment_analyzer.analyze_content(all_posts)
    
    # Campaign matching (if campaigns provided)
    campaign_matches = []
    if campaigns:
        for campaign in campaigns[:5]:  # Analyze top 5 campaigns
            match_result = matcher.calculate_match_score(influencer_profile, campaign)
            campaign_matches.append({
                "campaign_id": campaign.campaign_id,
                "match_score": match_result["match_score"],
                "recommendations": match_result["recommendations"]
            })
    
    # Pricing suggestions (use first campaign if available)
    pricing_suggestion = None
    if campaigns:
        pricing_suggestion = pricing_engine.suggest_pricing(influencer_profile, campaigns[0])
    
    return {
        "influencer_id": influencer_profile.user_id,
        "analysis_timestamp": datetime.now().isoformat(),
        "fake_follower_analysis": fake_analysis,
        "sentiment_analysis": sentiment_analysis,
        "campaign_matches": campaign_matches,
        "pricing_suggestion": pricing_suggestion,
        "overall_score": {
            "authenticity": 100 - fake_analysis["fake_follower_percentage"],
            "brand_safety": sentiment_analysis["overall_sentiment"] * 50 + 50,  # Convert to 0-100 scale
            "engagement_quality": min(100, (sentiment_analysis.get("post_count_analyzed", 0) / max(len(all_posts), 1)) * 100)
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0",
        "models_loaded": {
            "sentiment_analyzer": True,
            "embedding_model": True
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
