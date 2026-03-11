import { brands } from "../../../brands.config.js";
import KPICard from "../../../components/KPICard";
import EngagementChart from "../../../components/EngagementChart";
import ContentMixDonut from "../../../components/ContentMixDonut";
import {
  fetchAthleteData,
  toEngagementSeries,
  toContentMix,
  type AthleteConfig,
} from "../../../lib/instagram";

export default async function OverviewPage({
  params,
}: {
  params: Promise<{ brand: string }>;
}) {
  const { brand: brandId } = await params;
  const brandCfg = (brands as Record<string, { athletes: AthleteConfig[] }>)[brandId];
  const athlete = brandCfg?.athletes[0];

  const { profile, media } = await fetchAthleteData(athlete);

  // Compute KPIs from real data
  const followers = profile.followers_count;
  const totalPosts = profile.media_count;

  const avgEngRate =
    media.length > 0
      ? media.reduce((s, m) => s + (m.like_count + m.comments_count), 0) /
        media.length /
        followers *
        100
      : 0;

  const avgLikes =
    media.length > 0
      ? Math.round(media.reduce((s, m) => s + m.like_count, 0) / media.length)
      : 0;

  const series = toEngagementSeries(media, followers);
  const mix = toContentMix(media);

  // Whether we're showing per-post data (real) vs daily aggregate (mock)
  const isLive = media.length > 0;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-semibold text-ink tracking-tight">
          Overview
        </h1>
        <p className="text-ink-muted text-sm mt-1.5">
          {profile.name} (@{profile.username}) · all-time
        </p>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <KPICard label="Followers" value={followers} />
        <KPICard
          label="Avg. Engagement Rate"
          value={+avgEngRate.toFixed(2)}
          isPercent
        />
        <KPICard label="Total Posts" value={totalPosts} />
        <KPICard label="Avg. Likes / Post" value={avgLikes} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div
          className="xl:col-span-2 bg-surface rounded-2xl p-6"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)" }}
        >
          <div className="mb-5">
            <h2 className="text-base font-semibold text-ink">
              {isLive ? "Post Engagement Rate" : "Engagement Rate"}
            </h2>
            <p className="text-xs text-ink-muted mt-0.5">
              {isLive
                ? "Per post · (likes + comments) ÷ followers"
                : "Combined portfolio · last 30 days"}
            </p>
          </div>
          <EngagementChart
            data={series}
            tooltipLabels={
              isLive
                ? { metric2: "Likes", metric3: "Comments" }
                : { metric2: "Reach", metric3: "Impressions" }
            }
          />
        </div>

        <div
          className="bg-surface rounded-2xl p-6"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)" }}
        >
          <div className="mb-5">
            <h2 className="text-base font-semibold text-ink">Content Mix</h2>
            <p className="text-xs text-ink-muted mt-0.5">By post type</p>
          </div>
          <ContentMixDonut data={mix} />
        </div>
      </div>
    </div>
  );
}
