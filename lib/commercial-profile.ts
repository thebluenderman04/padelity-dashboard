// Shared type used by API routes and client components

export interface CommercialProfileResult {
  id: string | null;
  post_rate_low: number;
  post_rate_high: number;
  story_rate_low: number;
  story_rate_high: number;
  reel_rate_low: number;
  reel_rate_high: number;
  campaign_rate_low: number;
  campaign_rate_high: number;
  audience_value_score: number;
  brand_fit_tags: string[];
  brand_safety_rating: string;
  score_breakdown: {
    engagement: number;
    followers: number;
    posting: number;
    authenticity: number;
  };
  currency: string;
  generated_at: string;
}
