import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Trophy } from "lucide-react";
import { getAthletes } from "../../../../../lib/athletes";
import { fetchAthleteData, toAthleteStats } from "../../../../../lib/instagram";
import { supabaseAdmin } from "../../../../../lib/supabase";
import CommercialProfilePanel from "../../../../../components/CommercialProfilePanel";
import ExportProfileButton from "../../../../../components/ExportProfileButton";
import { fmt, fmtPct } from "../../../../../lib/utils";
import type { CommercialProfileResult } from "../../../../../lib/commercial-profile";

export default async function AthletProfilePage({
  params,
}: {
  params: Promise<{ brand: string; athleteId: string }>;
}) {
  const { brand: brandId, athleteId: igUserId } = await params;

  // Resolve athlete config
  const athletes = await getAthletes(brandId);
const cfg = athletes.find((a) => a.ig_user_id === igUserId);
  if (!cfg) notFound();

  // Fetch Instagram data
  const { profile, media } = await fetchAthleteData(cfg);
  const stats = toAthleteStats(cfg, profile, media);

  // Top 3 posts by engagement rate for PDF export
  const topPosts = [...media]
    .map((m) => ({
      rank: 0,
      likes: m.like_count,
      comments: m.comments_count,
      engRate: profile.followers_count > 0
        ? ((m.like_count + m.comments_count) / profile.followers_count) * 100
        : 0,
      type: m.media_type,
      date: m.timestamp?.slice(0, 10) ?? "",
    }))
    .sort((a, b) => b.engRate - a.engRate)
    .slice(0, 3)
    .map((p, i) => ({ ...p, rank: i + 1 }));

  const estimatedImpressions = media.reduce(
    (s, m) => s + (m.like_count + m.comments_count) * 8.5,
    0
  );

  const liveStats = {
    followers: profile.followers_count,
    avg_engagement_rate: stats.engagementRate,
    avg_likes: stats.avgLikes,
    posting_frequency_30d: stats.postsLast30,
  };

  // Try to load latest commercial profile from Supabase
  let initialProfile: CommercialProfileResult | null = null;
  try {
    const { data: athleteRow } = await supabaseAdmin
      .from("athletes")
      .select("id")
      .eq("ig_user_id", igUserId)
      .eq("brand_id", brandId)
      .maybeSingle();

    if (athleteRow) {
      const { data: row } = await supabaseAdmin
        .from("commercial_profiles")
        .select("*")
        .eq("athlete_id", athleteRow.id)
        .order("generated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (row) {
        initialProfile = {
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
      }
    }
  } catch {
    // Supabase unavailable — start with no profile
  }

  const initials = stats.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  return (
    <div>
      {/* Back link */}
      <div className="mb-6">
        <Link
          href={`/${brandId}/athletes`}
          className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition-colors"
        >
          <ArrowLeft size={14} strokeWidth={2} />
          Back to Athletes
        </Link>
      </div>

      {/* Athlete header */}
      <div
        className="bg-surface rounded-2xl p-6 mb-4 flex items-center gap-6"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)" }}
      >
        {/* Avatar */}
        <div className="w-16 h-16 rounded-2xl bg-ink/8 flex items-center justify-center flex-shrink-0 text-2xl font-display font-semibold text-ink">
          {initials}
        </div>

        {/* Identity */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <h1 className="text-2xl font-display font-semibold text-ink tracking-tight truncate">
                {stats.name}
              </h1>
              <p className="text-sm text-ink-muted mt-0.5">{stats.displayUsername}</p>
            </div>
            <ExportProfileButton
              athleteName={stats.name}
              handle={stats.displayUsername.replace("@", "")}
              followers={profile.followers_count}
              engagementRate={stats.engagementRate}
              estimatedImpressions={Math.round(estimatedImpressions)}
              topPosts={topPosts}
            />
          </div>
          <div className="flex items-center flex-wrap gap-3 mt-2.5">
            <span className="inline-flex items-center gap-1.5 text-xs text-ink-muted">
              <Trophy size={12} strokeWidth={2} />
              Padel
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-ink-muted">
              <MapPin size={12} strokeWidth={2} />
              {stats.flag} {stats.nationality}
            </span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-canvas border border-border text-ink-muted">
              Rank #{stats.ranking}
            </span>
          </div>
        </div>
      </div>

      {/* Snapshot strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
        {[
          { label: "Followers",      value: fmt(stats.followers) },
          { label: "Eng. Rate",      value: fmtPct(stats.engagementRate) },
          { label: "Avg. Likes",     value: fmt(stats.avgLikes) },
          { label: "Avg. Comments",  value: fmt(stats.avgComments) },
          { label: "Posts / 30 Days", value: String(stats.postsLast30) },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="bg-surface rounded-xl p-4"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
          >
            <p className="text-[10px] text-ink-muted uppercase tracking-[0.1em] mb-1.5">
              {label}
            </p>
            <p className="text-xl font-display font-semibold text-ink leading-none">
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Commercial profile panel (client — handles Generate Brief / Download PDF) */}
      <CommercialProfilePanel
        igUserId={igUserId}
        brandId={brandId}
        athleteName={stats.name}
        liveStats={liveStats}
        initialProfile={initialProfile}
      />
    </div>
  );
}
