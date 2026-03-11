import { brands } from "../../../brands.config.js";
import PostsGrid from "../../../components/PostsGrid";
import {
  fetchAthleteData,
  toTopPosts,
  type AthleteConfig,
} from "../../../lib/instagram";

export default async function TopPostsPage({
  params,
}: {
  params: Promise<{ brand: string }>;
}) {
  const { brand: brandId } = await params;
  const brandCfg = (brands as Record<string, { athletes: AthleteConfig[] }>)[brandId];
  const athleteConfigs: AthleteConfig[] = brandCfg?.athletes ?? [];

  // Fetch and transform posts for all athletes
  const allPosts = (
    await Promise.all(
      athleteConfigs.map(async (cfg) => {
        const { profile, media } = await fetchAthleteData(cfg);
        return toTopPosts(cfg, media, profile.followers_count);
      })
    )
  )
    .flat()
    .sort((a, b) => b.engagementRate - a.engagementRate);

  const types = ["All", ...Array.from(new Set(allPosts.map((p) => p.type)))];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-semibold text-ink tracking-tight">
          Top Posts
        </h1>
        <p className="text-ink-muted text-sm mt-1.5">
          Best performing content · sorted by engagement rate
        </p>
      </div>

      {/* Filter pills (labels only — sorting is live) */}
      <div className="flex flex-wrap gap-2 mb-6">
        {types.map((t) => (
          <span
            key={t}
            className={`text-xs px-3 py-1.5 rounded-full border select-none ${
              t === "All"
                ? "bg-ink text-white border-ink"
                : "bg-surface text-ink-muted border-border"
            }`}
          >
            {t}
          </span>
        ))}
      </div>

      <PostsGrid posts={allPosts} />

      <p className="text-center text-xs text-ink-subtle mt-8">
        Showing all {allPosts.length} posts · ranked by engagement rate
      </p>
    </div>
  );
}
