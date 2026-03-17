import PostsGridWithFilter from "../../../components/PostsGridWithFilter";
import { fetchAthleteData, toTopPosts } from "../../../lib/instagram";
import { getAthletes } from "../../../lib/athletes";

export default async function TopPostsPage({
  params,
}: {
  params: Promise<{ brand: string }>;
}) {
  const { brand: brandId } = await params;
  const athleteConfigs = await getAthletes(brandId);

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

      <PostsGridWithFilter posts={allPosts} types={types} />
    </div>
  );
}
