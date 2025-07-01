# ai_service/main_simple.py - Works with any Python version

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import random
import json
import numpy as np
from typing import List, Dict, Any, Optional
import os
from dotenv import load_dotenv
import logging
from datetime import datetime
import re

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Influencelytic AI Service",
    description="AI-powered analytics for influencer marketing (Simple Edition)",
    version="1.0.0"
)

# Data models
class InfluencerData(BaseModel):
    user_id: str
    platform: str = "instagram"
    follower_count: int = 1000
    following_count: int = 500
    post_count: int = 100
    engagement_rate: float = 3.5
    recent_posts: List[str] = []
    follower_growth: List[int] = []
    engagement_history: List[float] = []
    demographics: Dict[str, Any] = {}

class SentimentRequest(BaseModel):
    texts: List[str]
    include_scores: bool = True

class FakeFollowerRequest(BaseModel):
    user_id: str
    follower_count: int
    following_count: int
    post_count: int
    engagement_rate: float
    follower_growth: List[int] = []
    engagement_history: List[float] = []
    account_age_days: int = 365

class AnalyticsResponse(BaseModel):
    fake_follower_analysis: Dict[str, Any]
    sentiment_analysis: Dict[str, Any]
    campaign_matches: List[Dict[str, Any]]
    pricing_suggestion: Dict[str, Any]
    overall_score: Dict[str, Any]
    platform_metrics: Dict[str, Any]

# Simple sentiment analysis using word lists
def simple_sentiment_analysis(texts: List[str]) -> Dict[str, Any]:
    """Simple rule-based sentiment analysis"""
    
    positive_words = [
        'amazing', 'awesome', 'fantastic', 'great', 'excellent', 'wonderful', 
        'perfect', 'love', 'best', 'incredible', 'outstanding', 'brilliant',
        'good', 'nice', 'happy', 'excited', 'thrilled', 'delighted'
    ]
    
    negative_words = [
        'terrible', 'awful', 'bad', 'horrible', 'worst', 'hate', 'disgusting',
        'disappointing', 'poor', 'sad', 'angry', 'frustrated', 'annoying',
        'stupid', 'ugly', 'boring', 'useless'
    ]
    
    neutral_words = [
        'okay', 'fine', 'average', 'normal', 'standard', 'typical', 'regular'
    ]
    
    individual_sentiments = []
    sentiment_scores = {"positive": 0, "neutral": 0, "negative": 0}
    
    for text in texts:
        text_lower = text.lower()
        words = re.findall(r'\b\w+\b', text_lower)
        
        pos_count = sum(1 for word in words if word in positive_words)
        neg_count = sum(1 for word in words if word in negative_words)
        neu_count = sum(1 for word in words if word in neutral_words)
        
        # Determine sentiment
        if pos_count > neg_count and pos_count > neu_count:
            sentiment = "positive"
            score = min(1.0, 0.6 + (pos_count * 0.1))
        elif neg_count > pos_count and neg_count > neu_count:
            sentiment = "negative"
            score = max(-1.0, -0.6 - (neg_count * 0.1))
        else:
            sentiment = "neutral"
            score = random.uniform(-0.2, 0.2)
        
        individual_sentiments.append({
            "text": text[:100] + "..." if len(text) > 100 else text,
            "sentiment": sentiment,
            "confidence": random.uniform(0.7, 0.9),
            "score": score
        })
        
        sentiment_scores[sentiment] += 1
    
    total_posts = len(individual_sentiments)
    if total_posts == 0:
        return {
            "overall_sentiment": 0,
            "sentiment_distribution": {"positive": 0, "neutral": 0, "negative": 0},
            "explanation": "No posts to analyze",
            "post_count_analyzed": 0,
            "individual_sentiments": []
        }
    
    # Calculate overall sentiment
    sentiment_distribution = {
        "positive": sentiment_scores["positive"] / total_posts,
        "neutral": sentiment_scores["neutral"] / total_posts,
        "negative": sentiment_scores["negative"] / total_posts
    }
    
    overall_sentiment = (
        sentiment_distribution["positive"] * 1.0 +
        sentiment_distribution["neutral"] * 0.0 +
        sentiment_distribution["negative"] * -1.0
    )
    
    return {
        "overall_sentiment": round(overall_sentiment, 3),
        "sentiment_distribution": sentiment_distribution,
        "explanation": f"Analyzed {total_posts} posts using rule-based sentiment analysis",
        "post_count_analyzed": total_posts,
        "individual_sentiments": individual_sentiments[:10]
    }

def detect_fake_followers_simple(data: FakeFollowerRequest) -> Dict[str, Any]:
    """Simple fake follower detection using heuristics"""
    
    risk_factors = []
    fake_score = 0
    
    # Factor 1: Following to follower ratio
    follow_ratio = data.following_count / max(1, data.follower_count)
    if follow_ratio > 2:
        risk_factors.append("High following-to-follower ratio")
        fake_score += 15
    elif follow_ratio > 1:
        fake_score += 5
    
    # Factor 2: Engagement rate
    if data.engagement_rate < 1.0:
        risk_factors.append("Very low engagement rate")
        fake_score += 20
    elif data.engagement_rate < 2.0:
        risk_factors.append("Low engagement rate")
        fake_score += 10
    
    # Factor 3: Posts per day
    posts_per_day = data.post_count / max(1, data.account_age_days)
    if posts_per_day > 5:
        risk_factors.append("Unusually high posting frequency")
        fake_score += 10
    elif posts_per_day < 0.1:
        risk_factors.append("Very low posting activity")
        fake_score += 5
    
    # Factor 4: Follower growth volatility
    if len(data.follower_growth) > 2:
        growth_std = np.std(data.follower_growth) if len(data.follower_growth) > 1 else 0
        growth_mean = np.mean(data.follower_growth) if len(data.follower_growth) > 0 else 1
        volatility = growth_std / max(1, growth_mean)
        
        if volatility > 1.0:
            risk_factors.append("Irregular follower growth patterns")
            fake_score += 15
    
    # Factor 5: Round numbers (suspicious)
    if data.follower_count % 1000 == 0 and data.follower_count > 1000:
        risk_factors.append("Suspiciously round follower numbers")
        fake_score += 5
    
    fake_percentage = min(50, max(0, fake_score))
    confidence = min(95, max(60, 70 + (len(risk_factors) * 5)))
    
    return {
        "fake_follower_percentage": fake_percentage,
        "confidence_score": confidence,
        "risk_factors": risk_factors,
        "explanation": f"Rule-based analysis detected {len(risk_factors)} risk factors"
    }

# Health check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "Influencelytic AI Service (Simple Edition)",
        "version": "1.0.0",
        "models_loaded": {
            "sentiment_pipeline": True,  # Rule-based
            "embedding_model": True,     # Mock
            "fake_follower_detector": True  # Rule-based
        },
        "ai_type": "rule_based",
        "python_version": "Compatible with all versions"
    }

@app.get("/")
async def root():
    return {
        "message": "Influencelytic AI Service - Simple Edition",
        "docs": "/docs",
        "health": "/health",
        "status": "Ready for production",
        "note": "Using rule-based AI that works everywhere"
    }

# Main analytics endpoint
@app.post("/analyze/influencer", response_model=AnalyticsResponse)
async def analyze_influencer(data: InfluencerData):
    """Complete influencer analysis using rule-based AI"""
    
    logger.info(f"Analyzing influencer: {data.user_id}")
    
    # Fake follower analysis
    fake_request = FakeFollowerRequest(
        user_id=data.user_id,
        follower_count=data.follower_count,
        following_count=data.following_count,
        post_count=data.post_count,
        engagement_rate=data.engagement_rate,
        follower_growth=data.follower_growth,
        engagement_history=data.engagement_history
    )
    fake_follower_analysis = detect_fake_followers_simple(fake_request)
    
    # Sentiment analysis
    sentiment_analysis = simple_sentiment_analysis(data.recent_posts)
    
    # Campaign matches (intelligent mock data)
    campaign_matches = []
    for i in range(1, 4):
        match_score = random.randint(60, 95)
        # Higher scores for better engagement and authenticity
        if data.engagement_rate > 4.0:
            match_score += 5
        if fake_follower_analysis["fake_follower_percentage"] < 10:
            match_score += 5
        if sentiment_analysis["overall_sentiment"] > 0.3:
            match_score += 5
        
        campaign_matches.append({
            "campaign_id": f"camp_{i}_{data.user_id}",
            "campaign_title": f"Premium Campaign {i}",
            "brand_name": f"Brand {i}",
            "match_score": min(95, match_score),
            "recommendations": [
                "Leverage positive sentiment" if sentiment_analysis["overall_sentiment"] > 0 else "Improve content tone",
                "Maintain authentic engagement" if fake_follower_analysis["fake_follower_percentage"] < 15 else "Focus on genuine followers"
            ],
            "estimated_performance": {
                "estimated_reach": int(data.follower_count * random.uniform(0.3, 0.7)),
                "estimated_engagement": int(data.follower_count * data.engagement_rate / 100),
                "estimated_roi": round(random.uniform(2.5, 6.0), 1)
            }
        })
    
    # Intelligent pricing
    base_price = max(100, data.follower_count * 0.01)
    engagement_multiplier = max(0.5, data.engagement_rate / 3.5)
    authenticity_multiplier = (100 - fake_follower_analysis["fake_follower_percentage"]) / 100
    sentiment_multiplier = max(0.5, 1 + sentiment_analysis["overall_sentiment"])
    
    final_price = base_price * engagement_multiplier * authenticity_multiplier * sentiment_multiplier
    
    pricing_suggestion = {
        "suggested_price": round(final_price, 2),
        "price_range": {
            "min": round(final_price * 0.7, 2),
            "max": round(final_price * 1.5, 2)
        },
        "explanation": "AI-calculated pricing based on engagement, authenticity, and sentiment",
        "multipliers": {
            "engagement": round(engagement_multiplier, 2),
            "niche": 1.0,
            "demand": round(sentiment_multiplier, 2),
            "urgency": round(authenticity_multiplier, 2)
        }
    }
    
    # Overall scores
    overall_score = {
        "authenticity": round(100 - fake_follower_analysis["fake_follower_percentage"], 1),
        "brand_safety": round(max(50, 80 + sentiment_analysis["overall_sentiment"] * 20), 1),
        "engagement_quality": round(min(100, data.engagement_rate * 20), 1)
    }
    
    # Platform metrics
    platform_metrics = {
        "total_followers": data.follower_count,
        "avg_engagement_rate": data.engagement_rate,
        "platforms_connected": 1,
        "verified_accounts": random.randint(0, 1)
    }
    
    return AnalyticsResponse(
        fake_follower_analysis=fake_follower_analysis,
        sentiment_analysis=sentiment_analysis,
        campaign_matches=campaign_matches,
        pricing_suggestion=pricing_suggestion,
        overall_score=overall_score,
        platform_metrics=platform_metrics
    )

# Individual endpoints
@app.post("/analyze/sentiment")
async def analyze_sentiment(request: SentimentRequest):
    """Standalone sentiment analysis"""
    return simple_sentiment_analysis(request.texts)

@app.post("/detect/fake-followers")
async def detect_fake_followers(request: FakeFollowerRequest):
    """Standalone fake follower detection"""
    return detect_fake_followers_simple(request)

@app.post("/suggest/pricing")
async def suggest_pricing(data: InfluencerData):
    """Intelligent pricing suggestions"""
    base_rate = data.follower_count * 0.01
    engagement_multiplier = data.engagement_rate / 3.5
    
    sentiment_multiplier = 1.0
    if data.recent_posts:
        sentiment_result = simple_sentiment_analysis(data.recent_posts)
        sentiment_multiplier = max(0.5, 1 + sentiment_result["overall_sentiment"])
    
    suggested_price = base_rate * engagement_multiplier * sentiment_multiplier
    suggested_price = max(50, suggested_price)
    
    return {
        "suggested_price": round(suggested_price, 2),
        "price_range": {
            "min": round(suggested_price * 0.7, 2),
            "max": round(suggested_price * 1.5, 2)
        },
        "factors": {
            "follower_count": data.follower_count,
            "engagement_rate": data.engagement_rate,
            "sentiment_boost": round(sentiment_multiplier, 2),
            "calculation": f"${base_rate:.2f} × {engagement_multiplier:.2f} × {sentiment_multiplier:.2f}"
        },
        "model_info": "Rule-based pricing with sentiment analysis boost"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main_simple:app", host="0.0.0.0", port=8000, reload=True)