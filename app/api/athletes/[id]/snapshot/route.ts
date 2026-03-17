import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../../lib/supabase";
import { fetchAthleteData } from "../../../../../lib/instagram";
import { getAthletes } from "../../../../../lib/athletes";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: igUserId } = await params;

  let brand: string;
  try {
    ({ brand } = await req.json());
  } catch {
    return NextResponse.json({ error: "Missing body: { brand }" }, { status: 400 });
  }

  // Resolve athlete config from brand roster
  const athletes = await getAthletes(brand);
  const cfg = athletes.find((a) => a.ig_user_id === igUserId);
  if (!cfg) {
    return NextResponse.json({ error: "Athlete not found" }, { status: 404 });
  }

  // Fetch fresh Instagram data
  let profile, media;
  try {
    ({ profile, media } = await fetchAthleteData(cfg));
  } catch (err) {
    console.error("[snapshot] Instagram fetch failed:", err);
    return NextResponse.json({ error: "Instagram fetch failed" }, { status: 502 });
  }

  // Compute stats
  const followers = profile.followers_count;
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
  const recent = media.filter(
    (m) => new Date(m.timestamp).getTime() > thirtyDaysAgo
  );
  const postingFreq30d = recent.length;

  const avgEngagementRate =
    media.length > 0 && followers > 0
      ? (media.reduce((s, m) => s + m.like_count + m.comments_count, 0) /
          media.length /
          followers) *
        100
      : 0;

  const avgLikes =
    media.length > 0
      ? media.reduce((s, m) => s + m.like_count, 0) / media.length
      : 0;

  const avgComments =
    media.length > 0
      ? media.reduce((s, m) => s + m.comments_count, 0) / media.length
      : 0;

  const stats = {
    followers,
    avg_engagement_rate: +avgEngagementRate.toFixed(4),
    avg_likes: +avgLikes.toFixed(2),
    avg_comments: +avgComments.toFixed(2),
    avg_views: 0,
    posting_frequency_30d: postingFreq30d,
  };

  // Look up Supabase athlete UUID by ig_user_id
  const { data: athleteRow } = await supabaseAdmin
    .from("athletes")
    .select("id")
    .eq("ig_user_id", igUserId)
    .eq("brand_id", brand)
    .maybeSingle();

  // Save snapshot if athlete exists in DB
  let snapshotId: string | null = null;
  if (athleteRow) {
    const { data: snapshot, error } = await supabaseAdmin
      .from("instagram_snapshots")
      .insert({
        athlete_id: athleteRow.id,
        followers: stats.followers,
        avg_engagement_rate: stats.avg_engagement_rate,
        avg_likes: stats.avg_likes,
        avg_comments: stats.avg_comments,
        avg_views: stats.avg_views,
        posting_frequency_30d: stats.posting_frequency_30d,
      })
      .select("id")
      .single();

    if (error) {
      console.error("[snapshot] DB insert failed:", error);
    } else {
      snapshotId = snapshot.id;
    }
  }

  return NextResponse.json({ snapshotId, stats });
}
