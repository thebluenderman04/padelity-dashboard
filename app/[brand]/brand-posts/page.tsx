import { getAthletes } from "../../../lib/athletes";
import { fetchAthleteData } from "../../../lib/instagram";
import { supabaseAdmin } from "../../../lib/supabase";
import BrandPostsClient from "../../../components/BrandPostsClient";

export default async function BrandPostsPage({
  params,
}: {
  params: Promise<{ brand: string }>;
}) {
  const { brand: brandId } = await params;

  const athletes = await getAthletes(brandId);
  const cfg = athletes[0];

  if (!cfg) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-display font-semibold text-ink">Brand Posts</h1>
          <p className="text-ink-muted text-sm mt-1">No athletes configured for this brand.</p>
        </div>
      </div>
    );
  }

  const { media } = await fetchAthleteData(cfg).catch(() => ({
    profile: { id: cfg.id, name: cfg.name, username: cfg.instagram_handle.replace("@", ""), followers_count: 0, media_count: 0 },
    media: [] as import("../../../lib/instagram").IGMedia[],
  }));

  let existingTags: Array<{ id: string; ig_post_id: string; brand_tag: string; deal_value?: number }> = [];
  try {
    const { data } = await supabaseAdmin
      .from("post_brand_tags")
      .select("*")
      .eq("brand_id", brandId)
      .eq("ig_user_id", cfg.ig_user_id);
    existingTags = data ?? [];
  } catch (err) {
    console.error("[brand-posts] Failed to fetch tags:", err);
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-semibold text-ink">Brand Posts</h1>
        <p className="text-ink-muted text-sm mt-1">
          {media.length} posts · tag and analyse by brand partner
        </p>
      </div>

      <BrandPostsClient
        posts={media}
        existingTags={existingTags}
        brandId={brandId}
        igUserId={cfg.ig_user_id}
        athleteHandle={cfg.instagram_handle}
      />
    </div>
  );
}
