import KPICard from "../../../components/KPICard";
import EngagementChart from "../../../components/EngagementChart";
import ContentMixDonut from "../../../components/ContentMixDonut";
import { fetchAthleteData, toEngagementSeries, toContentMix } from "../../../lib/instagram";
import { getAthletes } from "../../../lib/athletes";

export default async function OverviewPage({
  params,
}: {
  params: Promise<{ brand: string }>;
}) {
  const { brand: brandId } = await params;
  const allAthletes = await getAthletes(brandId);

  // Fetch all athletes in parallel
  const allData = await Promise.all(
    allAthletes.map((cfg) => fetchAthleteData(cfg))
  );

  // ── Aggregated KPIs ──────────────────────────────────────────────────────
  const totalFollowers = allData.reduce(
    (s, d) => s + d.profile.followers_count,
    0
  );
  const totalPosts = allData.reduce((s, d) => s + d.profile.media_count, 0);

  // All media flattened, carrying each athlete's follower count for engagement
  const allMediaFlat = allData.flatMap(({ profile, media }) =>
    media.map((m) => ({ ...m, _followers: profile.followers_count }))
  );

  const avgEngRate =
    allMediaFlat.length > 0
      ? (allMediaFlat.reduce(
          (s, m) => s + (m.like_count + m.comments_count) / m._followers,
          0
        ) /
          allMediaFlat.length) *
        100
      : 0;

  const avgLikes =
    allMediaFlat.length > 0
      ? Math.round(
          allMediaFlat.reduce((s, m) => s + m.like_count, 0) /
            allMediaFlat.length
        )
      : 0;

  // Chart: primary athlete's engagement series; content mix from all athletes
  const primary = allData[0];
  const series = toEngagementSeries(
    primary.media,
    primary.profile.followers_count
  );
  const mix = toContentMix(allData.flatMap((d) => d.media));

  const isLive = allMediaFlat.length > 0;
  const athleteLabel =
    allAthletes.length === 1
      ? `${primary.profile.name} (@${primary.profile.username})`
      : `${allAthletes.length} athletes · combined`;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-semibold text-ink tracking-tight">
          Overview
        </h1>
        <p className="text-ink-muted text-sm mt-1.5">{athleteLabel} · all-time</p>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <KPICard label="Total Followers" value={totalFollowers} />
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
                ? `${primary.profile.name} · per post · (likes + comments) ÷ followers`
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
            <p className="text-xs text-ink-muted mt-0.5">By post type · all athletes</p>
          </div>
          <ContentMixDonut data={mix} />
        </div>
      </div>
    </div>
  );
}
