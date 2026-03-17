import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../../lib/supabase";
import { getAthletes } from "../../../../../lib/athletes";

import type { CommercialProfileResult } from "../../../../../lib/commercial-profile";

function computeProfile(stats: {
  followers: number;
  avg_engagement_rate: number;
  avg_likes: number;
  posting_frequency_30d: number;
}): Omit<CommercialProfileResult, "id" | "generated_at"> {
  const { followers, avg_engagement_rate, avg_likes, posting_frequency_30d } = stats;

  // ── Rate card (MYR) ───────────────────────────────────────────────────────
  const baseRate = (followers / 10000) * 800;
  const cpeBoost = avg_likes * 0.015 * 4.5;
  const postRateMid = baseRate + cpeBoost;
  const postRateLow = postRateMid * 0.7;
  const postRateHigh = postRateMid * 1.4;

  const storyRateLow = postRateLow * 0.3;
  const storyRateHigh = postRateHigh * 0.3;
  const reelRateLow = postRateLow * 1.5;
  const reelRateHigh = postRateHigh * 1.5;

  // Campaign bundle: 4 posts + 8 stories + 2 reels over 4 weeks
  const campaignRateLow = postRateLow * 4 + storyRateLow * 8 + reelRateLow * 2;
  const campaignRateHigh = postRateHigh * 4 + storyRateHigh * 8 + reelRateHigh * 2;

  // ── Audience Value Score (0–100) ──────────────────────────────────────────
  const engagementScore =
    avg_engagement_rate > 3 ? 40 : avg_engagement_rate >= 1 ? 20 : 5;
  const followerScore = followers > 50000 ? 20 : followers >= 10000 ? 12 : 5;
  const postingScore =
    posting_frequency_30d > 3 ? 20 : posting_frequency_30d >= 1 ? 10 : 2;
  const authenticityScore = 15; // placeholder until bot-detection is available

  const audienceValueScore =
    engagementScore + followerScore + postingScore + authenticityScore;

  return {
    post_rate_low: Math.round(postRateLow),
    post_rate_high: Math.round(postRateHigh),
    story_rate_low: Math.round(storyRateLow),
    story_rate_high: Math.round(storyRateHigh),
    reel_rate_low: Math.round(reelRateLow),
    reel_rate_high: Math.round(reelRateHigh),
    campaign_rate_low: Math.round(campaignRateLow),
    campaign_rate_high: Math.round(campaignRateHigh),
    audience_value_score: audienceValueScore,
    brand_fit_tags: ["Padel", "Fitness", "Lifestyle", "Sport"],
    brand_safety_rating: "Green",
    score_breakdown: {
      engagement: engagementScore,
      followers: followerScore,
      posting: postingScore,
      authenticity: authenticityScore,
    },
    currency: "MYR",
  };
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: igUserId } = await params;

  let brand: string, snapshotId: string | null, stats: Record<string, number>;
  try {
    ({ brand, snapshotId = null, stats } = await req.json());
  } catch {
    return NextResponse.json(
      { error: "Missing body: { brand, snapshotId?, stats }" },
      { status: 400 }
    );
  }

  // Resolve stats: from DB snapshot if available, otherwise from passed stats
  let resolvedStats = {
    followers: stats?.followers ?? 0,
    avg_engagement_rate: stats?.avg_engagement_rate ?? 0,
    avg_likes: stats?.avg_likes ?? 0,
    posting_frequency_30d: stats?.posting_frequency_30d ?? 0,
  };

  if (snapshotId) {
    const { data: snapshot } = await supabaseAdmin
      .from("instagram_snapshots")
      .select("followers, avg_engagement_rate, avg_likes, posting_frequency_30d")
      .eq("id", snapshotId)
      .maybeSingle();

    if (snapshot) resolvedStats = snapshot as typeof resolvedStats;
  }

  const computed = computeProfile(resolvedStats);
  const generatedAt = new Date().toISOString();

  // Persist to DB if athlete exists in Supabase
  let profileId: string | null = null;

  const athletes = await getAthletes(brand);
  const cfg = athletes.find((a) => a.ig_user_id === igUserId);

  if (cfg) {
    const { data: athleteRow } = await supabaseAdmin
      .from("athletes")
      .select("id")
      .eq("ig_user_id", igUserId)
      .eq("brand_id", brand)
      .maybeSingle();

    if (athleteRow) {
      const { data: profile, error } = await supabaseAdmin
        .from("commercial_profiles")
        .insert({
          athlete_id: athleteRow.id,
          snapshot_id: snapshotId,
          post_rate_low: computed.post_rate_low,
          post_rate_high: computed.post_rate_high,
          story_rate_low: computed.story_rate_low,
          story_rate_high: computed.story_rate_high,
          reel_rate_low: computed.reel_rate_low,
          reel_rate_high: computed.reel_rate_high,
          campaign_rate_low: computed.campaign_rate_low,
          campaign_rate_high: computed.campaign_rate_high,
          audience_value_score: computed.audience_value_score,
          brand_fit_tags: computed.brand_fit_tags,
          brand_safety_rating: computed.brand_safety_rating,
          rate_overrides_json: { score_breakdown: computed.score_breakdown },
          currency: "MYR",
          generated_at: generatedAt,
        })
        .select("id")
        .single();

      if (error) {
        console.error("[commercial-profile] DB insert failed:", error);
      } else {
        profileId = profile.id;
      }
    }
  }

  const result: CommercialProfileResult = {
    id: profileId,
    ...computed,
    generated_at: generatedAt,
  };

  return NextResponse.json(result);
}
