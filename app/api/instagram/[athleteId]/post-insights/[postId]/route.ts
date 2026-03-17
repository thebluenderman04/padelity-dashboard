import { NextRequest, NextResponse } from "next/server";
import { getAthletes } from "../../../../../../lib/athletes";

const IG_API = "https://graph.instagram.com";

function isMock(token: string): boolean {
  return !token || token === "mock";
}

interface InsightValue {
  value: number;
}

interface InsightItem {
  name: string;
  period: string;
  values: InsightValue[];
}

interface InsightResponse {
  data: InsightItem[];
  error?: { message: string };
}

function estimateMetrics(likes: number, comments: number) {
  const impressions = Math.round((likes + comments) * 8.5);
  const reach = Math.round(impressions * 0.72);
  const saved = Math.round(likes * 0.08);
  const profile_visits = Math.round(reach * 0.04);
  const follows = Math.round(profile_visits * 0.06);
  const engagements = likes + comments + saved;
  const engagement_rate = reach > 0 ? (engagements / reach) * 100 : 0;
  return { impressions, reach, saved, profile_visits, follows, engagements, engagement_rate };
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ athleteId: string; postId: string }> }
) {
  const { athleteId, postId } = await params;
  const { searchParams } = req.nextUrl;

  const brandId = searchParams.get("brand") ?? "";
  const likesParam = parseInt(searchParams.get("likes") ?? "0", 10) || 0;
  const commentsParam = parseInt(searchParams.get("comments") ?? "0", 10) || 0;
  const mediaType = searchParams.get("media_type") ?? "IMAGE";

  // Find the athlete config by ig_user_id
  const athletes = await getAthletes(brandId);
  const cfg = athletes.find((a) => a.ig_user_id === athleteId);

  if (!cfg) {
    return NextResponse.json({ error: "Athlete not found" }, { status: 404 });
  }

  const estimated = estimateMetrics(likesParam, commentsParam);

  if (isMock(cfg.token)) {
    return NextResponse.json({
      impressions: estimated.impressions,
      reach: estimated.reach,
      saved: estimated.saved,
      profile_visits: estimated.profile_visits,
      follows: estimated.follows,
      likes: likesParam,
      comments: commentsParam,
      engagements: estimated.engagements,
      engagement_rate: +estimated.engagement_rate.toFixed(2),
      isLive: false,
    });
  }

  // For VIDEO use "plays" instead of "impressions"
  const metricsParam =
    mediaType === "VIDEO"
      ? "plays,reach,saved,profile_visits,follows"
      : "impressions,reach,saved,profile_visits,follows";

  try {
    const res = await fetch(
      `${IG_API}/v19.0/${postId}/insights?metric=${metricsParam}&access_token=${cfg.token}`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      throw new Error(`IG insights error ${res.status}`);
    }

    const json: InsightResponse = await res.json();

    if (json.error || !json.data || json.data.length === 0) {
      throw new Error(json.error?.message ?? "Empty response");
    }

    const byName: Record<string, number> = {};
    for (const item of json.data) {
      byName[item.name] = item.values?.[0]?.value ?? 0;
    }

    const impressions = byName["impressions"] ?? byName["plays"] ?? estimated.impressions;
    const reach = byName["reach"] ?? estimated.reach;
    const saved = byName["saved"] ?? estimated.saved;
    const profile_visits = byName["profile_visits"] ?? estimated.profile_visits;
    const follows = byName["follows"] ?? estimated.follows;
    const engagements = likesParam + commentsParam + saved;
    const engagement_rate = reach > 0 ? (engagements / reach) * 100 : 0;

    return NextResponse.json({
      impressions,
      reach,
      saved,
      profile_visits,
      follows,
      likes: likesParam,
      comments: commentsParam,
      engagements,
      engagement_rate: +engagement_rate.toFixed(2),
      isLive: true,
    });
  } catch (err) {
    console.error("[post-insights] Falling back to estimates:", err);

    return NextResponse.json({
      impressions: estimated.impressions,
      reach: estimated.reach,
      saved: estimated.saved,
      profile_visits: estimated.profile_visits,
      follows: estimated.follows,
      likes: likesParam,
      comments: commentsParam,
      engagements: estimated.engagements,
      engagement_rate: +estimated.engagement_rate.toFixed(2),
      isLive: false,
    });
  }
}
