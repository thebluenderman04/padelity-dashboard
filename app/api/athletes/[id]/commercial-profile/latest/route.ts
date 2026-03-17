import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../../../lib/supabase";
import type { CommercialProfileResult } from "../../../../../../lib/commercial-profile";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: igUserId } = await params;
  const { searchParams } = new URL(req.url);
  const brand = searchParams.get("brand");

  if (!brand) {
    return NextResponse.json({ error: "Missing query param: brand" }, { status: 400 });
  }

  // Resolve Supabase athlete UUID
  const { data: athleteRow } = await supabaseAdmin
    .from("athletes")
    .select("id")
    .eq("ig_user_id", igUserId)
    .eq("brand_id", brand)
    .maybeSingle();

  if (!athleteRow) {
    return NextResponse.json({ profile: null });
  }

  const { data: row } = await supabaseAdmin
    .from("commercial_profiles")
    .select("*, snapshot:instagram_snapshots(followers, avg_engagement_rate, posting_frequency_30d)")
    .eq("athlete_id", athleteRow.id)
    .order("generated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!row) {
    return NextResponse.json({ profile: null });
  }

  const result: CommercialProfileResult = {
    id: row.id,
    post_rate_low: row.post_rate_low,
    post_rate_high: row.post_rate_high,
    story_rate_low: row.story_rate_low,
    story_rate_high: row.story_rate_high,
    reel_rate_low: row.reel_rate_low,
    reel_rate_high: row.reel_rate_high,
    campaign_rate_low: row.campaign_rate_low,
    campaign_rate_high: row.campaign_rate_high,
    audience_value_score: row.audience_value_score,
    brand_fit_tags: row.brand_fit_tags ?? [],
    brand_safety_rating: row.brand_safety_rating ?? "Green",
    score_breakdown: row.rate_overrides_json?.score_breakdown ?? {
      engagement: 0,
      followers: 0,
      posting: 0,
      authenticity: 0,
    },
    currency: row.currency ?? "MYR",
    generated_at: row.generated_at,
  };

  return NextResponse.json({ profile: result });
}
