"""
AI Matching Engine for Influencelytic-Match
Handles intelligent matching between influencers and brands
"""

import numpy as np
from typing import List, Dict, Any, Tuple
from dataclasses import dataclass
from datetime import datetime
import json
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import StandardScaler
import pandas as pd


@dataclass
class InfluencerProfile:
    """Represents an influencer's profile for matching"""
    user_id: str
    platforms: List[str]
    follower_count: int
    engagement_rate: float
    niche_categories: List[str]
    audience_demographics: Dict[str, float]
    location: str
    content_quality_score: float
    fake_follower_percentage: float
    posting_frequency: int
    bio_text: str
    recent_content: List[str]


@dataclass
class CampaignRequirements:
    """Represents a brand's campaign requirements"""
    campaign_id: str
    brand_id: str
    required_platforms: List[str]
    min_followers: int
    max_followers: int
    min_engagement_rate: float
    max_fake_followers: float
    target_niches: List[str]
    target_demographics: Dict[str, float]
    target_locations: List[str]
    budget_range: Tuple[int, int]
    campaign_description: str
    content_guidelines: str


class AIMatchingEngine:
    """Main matching engine for influencer-brand connections"""
    
    def __init__(self):
        # Initialize the sentence transformer for text similarity
        self.text_model = SentenceTransformer('all-MiniLM-L6-v2')
        self.scaler = StandardScaler()
        
        # Weights for different matching factors
        self.weights = {
            'platform_match': 0.15,
            'audience_match': 0.20,
            'engagement_quality': 0.15,
            'niche_relevance': 0.25,
            'demographic_alignment': 0.15,
            'location_match': 0.10
        }
    
    def calculate_match_score(self, 
                             influencer: InfluencerProfile, 
                             campaign: CampaignRequirements) -> Dict[str, Any]:
        """
        Calculate comprehensive match score between influencer and campaign
        Returns score (0-100) and detailed breakdown
        """
        scores = {}
        
        # 1. Platform Match Score
        scores['platform_match'] = self._calculate_platform_match(
            influencer.platforms, campaign.required_platforms
        )
        
        # 2. Audience Size Match
        scores['audience_match'] = self._calculate_audience_match(
            influencer.follower_count, 
            campaign.min_followers, 
            campaign.max_followers
        )
        
        # 3. Engagement Quality Score
        scores['engagement_quality'] = self._calculate_engagement_quality(
            influencer.engagement_rate,
            campaign.min_engagement_rate,
            influencer.fake_follower_percentage,
            campaign.max_fake_followers
        )
        
        # 4. Niche Relevance Score
        scores['niche_relevance'] = self._calculate_niche_relevance(
            influencer.niche_categories,
            campaign.target_niches,
            influencer.bio_text,
            campaign.campaign_description
        )
        
        # 5. Demographic Alignment Score
        scores['demographic_alignment'] = self._calculate_demographic_alignment(
            influencer.audience_demographics,
            campaign.target_demographics
        )
        
        # 6. Location Match Score
        scores['location_match'] = self._calculate_location_match(
            influencer.location,
            campaign.target_locations
        )
        
        # Calculate weighted total score
        total_score = sum(
            scores[key] * self.weights[key] 
            for key in scores.keys()
        )
        
        # Generate explanation
        explanation = self._generate_match_explanation(scores, influencer, campaign)
        
        return {
            'total_score': round(total_score, 2),
            'score_breakdown': scores,
            'explanation': explanation,
            'recommendation': self._get_recommendation(total_score),
            'predicted_performance': self._predict_campaign_performance(
                influencer, campaign, total_score
            )
        }
    
    def _calculate_platform_match(self, 
                                 influencer_platforms: List[str], 
                                 required_platforms: List[str]) -> float:
        """Calculate how well influencer's platforms match requirements"""
        if not required_platforms:
            return 100.0
        
        matching_platforms = set(influencer_platforms) & set(required_platforms)
        coverage = len(matching_platforms) / len(required_platforms)
        
        return min(100, coverage * 100)
    
    def _calculate_audience_match(self, 
                                 follower_count: int, 
                                 min_followers: int, 
                                 max_followers: int) -> float:
        """Calculate audience size appropriateness"""
        if follower_count < min_followers:
            # Penalize for being under minimum
            ratio = follower_count / min_followers
            return max(0, ratio * 70)  # Max 70% if under minimum
        
        if max_followers and follower_count > max_followers:
            # Slight penalty for being over maximum
            ratio = max_followers / follower_count
            return max(60, ratio * 90)  # Min 60% if over maximum
        
        # Perfect match within range
        return 100.0
    
    def _calculate_engagement_quality(self,
                                     engagement_rate: float,
                                     min_engagement: float,
                                     fake_followers: float,
                                     max_fake: float) -> float:
        """Calculate engagement quality score"""
        score = 100.0
        
        # Engagement rate component
        if engagement_rate < min_engagement:
            score *= (engagement_rate / min_engagement)
        
        # Fake follower penalty
        if fake_followers > max_fake:
            penalty = ((fake_followers - max_fake) / max_fake) * 50
            score = max(0, score - penalty)
        
        return min(100, score)
    
    def _calculate_niche_relevance(self,
                                  influencer_niches: List[str],
                                  target_niches: List[str],
                                  influencer_bio: str,
                                  campaign_description: str) -> float:
        """Calculate niche and content relevance"""
        # Category match
        category_score = 0
        if target_niches and influencer_niches:
            matching_niches = set(influencer_niches) & set(target_niches)
            category_score = (len(matching_niches) / len(target_niches)) * 50
        
        # Text similarity between bio and campaign
        text_score = 0
        if influencer_bio and campaign_description:
            bio_embedding = self.text_model.encode([influencer_bio])
            campaign_embedding = self.text_model.encode([campaign_description])
            similarity = cosine_similarity(bio_embedding, campaign_embedding)[0][0]
            text_score = similarity * 50
        
        return min(100, category_score + text_score)
    
    def _calculate_demographic_alignment(self,
                                        influencer_demographics: Dict[str, float],
                                        target_demographics: Dict[str, float]) -> float:
        """Calculate demographic alignment score"""
        if not target_demographics:
            return 100.0
        
        total_difference = 0
        count = 0
        
        for key, target_value in target_demographics.items():
            if key in influencer_demographics:
                difference = abs(influencer_demographics[key] - target_value)
                total_difference += difference
                count += 1
        
        if count == 0:
            return 50.0  # No demographic data available
        
        avg_difference = total_difference / count
        score = max(0, 100 - (avg_difference * 2))  # 2% penalty per 1% difference
        
        return score
    
    def _calculate_location_match(self,
                                 influencer_location: str,
                                 target_locations: List[str]) -> float:
        """Calculate location match score"""
        if not target_locations:
            return 100.0
        
        if influencer_location in target_locations:
            return 100.0
        
        # Could add more sophisticated location matching (regions, countries, etc.)
        return 0.0
    
    def _generate_match_explanation(self,
                                   scores: Dict[str, float],
                                   influencer: InfluencerProfile,
                                   campaign: CampaignRequirements) -> str:
        """Generate human-readable explanation of the match"""
        explanations = []
        
        # Platform explanation
        if scores['platform_match'] == 100:
            explanations.append("✅ Perfect platform coverage")
        elif scores['platform_match'] > 50:
            explanations.append("⚠️ Partial platform coverage")
        else:
            explanations.append("❌ Limited platform presence")
        
        # Audience explanation
        if scores['audience_match'] == 100:
            explanations.append(f"✅ Ideal audience size ({influencer.follower_count:,} followers)")
        elif scores['audience_match'] > 70:
            explanations.append(f"✅ Good audience size match")
        else:
            explanations.append(f"⚠️ Audience size mismatch")
        
        # Engagement explanation
        if scores['engagement_quality'] > 80:
            explanations.append(f"✅ Excellent engagement ({influencer.engagement_rate:.1f}%)")
        elif scores['engagement_quality'] > 60:
            explanations.append(f"⚠️ Moderate engagement quality")
        else:
            explanations.append(f"❌ Low engagement or high fake followers")
        
        # Niche explanation
        if scores['niche_relevance'] > 80:
            explanations.append("✅ Highly relevant content niche")
        elif scores['niche_relevance'] > 50:
            explanations.append("⚠️ Somewhat relevant content")
        else:
            explanations.append("❌ Content niche mismatch")
        
        return " | ".join(explanations)
    
    def _get_recommendation(self, score: float) -> str:
        """Get recommendation based on match score"""
        if score >= 85:
            return "HIGHLY_RECOMMENDED"
        elif score >= 70:
            return "RECOMMENDED"
        elif score >= 50:
            return "POSSIBLE"
        else:
            return "NOT_RECOMMENDED"
    
    def _predict_campaign_performance(self,
                                     influencer: InfluencerProfile,
                                     campaign: CampaignRequirements,
                                     match_score: float) -> Dict[str, Any]:
        """Predict expected campaign performance"""
        # Simple prediction model (would be ML model in production)
        base_reach = influencer.follower_count
        
        # Adjust based on engagement and match score
        engagement_multiplier = influencer.engagement_rate / 100
        match_multiplier = match_score / 100
        
        predicted_reach = int(base_reach * 0.3)  # Assume 30% reach
        predicted_engagement = int(predicted_reach * engagement_multiplier * match_multiplier)
        predicted_conversions = int(predicted_engagement * 0.02)  # 2% conversion estimate
        
        return {
            'estimated_reach': predicted_reach,
            'estimated_engagements': predicted_engagement,
            'estimated_conversions': predicted_conversions,
            'confidence_level': min(95, match_score * 1.1)
        }
    
    def rank_influencers(self, 
                        influencers: List[InfluencerProfile],
                        campaign: CampaignRequirements,
                        top_n: int = 10) -> List[Dict[str, Any]]:
        """Rank multiple influencers for a campaign"""
        results = []
        
        for influencer in influencers:
            match_result = self.calculate_match_score(influencer, campaign)
            match_result['influencer_id'] = influencer.user_id
            results.append(match_result)
        
        # Sort by total score
        results.sort(key=lambda x: x['total_score'], reverse=True)
        
        return results[:top_n]
    
    def find_similar_influencers(self,
                                reference_influencer: InfluencerProfile,
                                all_influencers: List[InfluencerProfile],
                                top_n: int = 5) -> List[Tuple[str, float]]:
        """Find influencers similar to a reference influencer"""
        # Create feature vectors for all influencers
        features = []
        
        for inf in [reference_influencer] + all_influencers:
            feature_vector = [
                inf.follower_count,
                inf.engagement_rate,
                inf.fake_follower_percentage,
                inf.posting_frequency,
                inf.content_quality_score
            ]
            features.append(feature_vector)
        
        # Normalize features
        features_normalized = self.scaler.fit_transform(features)
        
        # Calculate similarities
        similarities = cosine_similarity([features_normalized[0]], features_normalized[1:])[0]
        
        # Get top similar influencers
        similar_indices = np.argsort(similarities)[::-1][:top_n]
        
        results = []
        for idx in similar_indices:
            results.append((
                all_influencers[idx].user_id,
                float(similarities[idx])
            ))
        
        return results


# FastAPI endpoint wrapper
async def match_influencer_to_campaign(influencer_data: dict, campaign_data: dict) -> dict:
    """API endpoint for matching"""
    engine = AIMatchingEngine()
    
    # Parse influencer profile
    influencer = InfluencerProfile(
        user_id=influencer_data['user_id'],
        platforms=influencer_data.get('platforms', []),
        follower_count=influencer_data.get('follower_count', 0),
        engagement_rate=influencer_data.get('engagement_rate', 0),
        niche_categories=influencer_data.get('niche_categories', []),
        audience_demographics=influencer_data.get('audience_demographics', {}),
        location=influencer_data.get('location', ''),
        content_quality_score=influencer_data.get('content_quality_score', 50),
        fake_follower_percentage=influencer_data.get('fake_follower_percentage', 0),
        posting_frequency=influencer_data.get('posting_frequency', 0),
        bio_text=influencer_data.get('bio_text', ''),
        recent_content=influencer_data.get('recent_content', [])
    )
    
    # Parse campaign requirements
    campaign = CampaignRequirements(
        campaign_id=campaign_data['campaign_id'],
        brand_id=campaign_data['brand_id'],
        required_platforms=campaign_data.get('required_platforms', []),
        min_followers=campaign_data.get('min_followers', 0),
        max_followers=campaign_data.get('max_followers', None),
        min_engagement_rate=campaign_data.get('min_engagement_rate', 0),
        max_fake_followers=campaign_data.get('max_fake_followers', 100),
        target_niches=campaign_data.get('target_niches', []),
        target_demographics=campaign_data.get('target_demographics', {}),
        target_locations=campaign_data.get('target_locations', []),
        budget_range=(
            campaign_data.get('budget_min', 0),
            campaign_data.get('budget_max', 0)
        ),
        campaign_description=campaign_data.get('description', ''),
        content_guidelines=campaign_data.get('content_guidelines', '')
    )
    
    # Calculate match
    result = engine.calculate_match_score(influencer, campaign)
    
    return result