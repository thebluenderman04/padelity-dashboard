import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "../../../lib/supabase";
import { fetchAthleteData, toEngagementSeries, toContentMix } from "../../../lib/instagram";
import KPICard from "../../../components/KPICard";
import EngagementChart from "../../../components/EngagementChart";
import ContentMixDonut from "../../../components/ContentMixDonut";
import SponsorshipValuationCard from "../../../components/SponsorshipValuationCard";
import EMVCard from "../../../components/EMVCard";
import BenchmarkCard from "../../../components/BenchmarkCard";
import ExportProfileButton from "../../../components/ExportProfileButton";
import type { IGMedia } from "../../../lib/instagram";

const getSecret = () =>
  new TextEncoder().encode(
    process.env.JWT_SECRET || "padelity-dev-secret-change-in-production"
  );

export default async function MeOverviewPage() {
  // Read athlete identity from session cookie
  const cookieStore = await cookies();
  const token = cookieStore.get("athlete_session")?.value;
  if (!token) redirect("/onboard");

  let igUserId = "";
  try {
    const { payload } = await jwtVerify(token, getSecret());
    igUserId = (payload as { igUserId?: string }).igUserId ?? "";
  } catch {
    redirect("/onboard");
  }

  // Load athlete from Supabase
  const { data: athleteRow } = await supabaseAdmin
    .from("athletes")
    .select("name, instagram_handle, ig_user_id, token, brand_id")
    .eq("ig_user_id", igUserId)
    .maybeSingle();

  if (!athleteRow) redirect("/onboard");

  const cfg = {
    id: athleteRow.ig_user_id,
    name: athleteRow.name,
    instagram_handle: athleteRow.instagram_handle ?? "",
    token: athleteRow.token,
    ig_user_id: athleteRow.ig_user_id,
  };

  // Fetch Instagram data
  const { profile, media } = await fetchAthleteData(cfg).catch(() => ({
    profile: {
      id: cfg.id,
      name: cfg.name,
      username: cfg.instagram_handle.replace("@", ""),
      followers_count: 0,
      media_count: 0,
    },
    media: [] as IGMedia[],
  }));

  // KPI calculations
  const avgEngRate =
    media.length > 0 && profile.followers_count > 0
      ? (media.reduce(
          (s, m) => s + (m.like_count + m.comments_count) / profile.followers_count,
          0
        ) /
          media.length) *
        100
      : 0;

  const avgLikes =
    media.length > 0
      ? Math.round(media.reduce((s, m) => s + m.like_count, 0) / media.length)
      : 0;

  const estimatedImpressions = media.reduce(
    (s, m) => s + (m.like_count + m.comments_count) * 8.5,
    0
  );

  const series = toEngagementSeries(media, profile.followers_count);
  const mix = toContentMix(media);
  const isLive = media.length > 0;

  // Top 3 posts for PDF
  const topPosts = [...media]
    .map((m) => ({
      rank: 0,
      likes: m.like_count,
      comments: m.comments_count,
      engRate:
        profile.followers_count > 0
          ? ((m.like_count + m.comments_count) / profile.followers_count) * 100
          : 0,
      type: m.media_type,
      date: m.timestamp?.slice(0, 10) ?? "",
    }))
    .sort((a, b) => b.engRate - a.engRate)
    .slice(0, 3)
    .map((p, i) => ({ ...p, rank: i + 1 }));

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-semibold text-ink tracking-tight">
            My Dashboard
          </h1>
          <p className="text-ink-muted text-sm mt-1.5">
            {profile.name} (@{profile.username}) · all-time
          </p>
        </div>
        <ExportProfileButton
          athleteName={profile.name}
          handle={profile.username}
          followers={profile.followers_count}
          engagementRate={+avgEngRate.toFixed(2)}
          estimatedImpressions={Math.round(estimatedImpressions)}
          topPosts={topPosts}
        />
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <KPICard label="Followers" value={profile.followers_count} />
        <KPICard label="Engagement Rate" value={+avgEngRate.toFixed(2)} isPercent />
        <KPICard label="Total Posts" value={profile.media_count} />
        <KPICard label="Avg. Likes / Post" value={avgLikes} />
      </div>

      {/* Commercial cards */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
        <SponsorshipValuationCard
          followers={profile.followers_count}
          engagementRate={+avgEngRate.toFixed(2)}
        />
        <EMVCard estimatedImpressions={Math.round(estimatedImpressions)} />
        <BenchmarkCard engagementRate={+avgEngRate.toFixed(2)} />
      </div>

      {/* Charts */}
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
                ? `${profile.name} · per post · (likes + comments) ÷ followers`
                : "Connect your Instagram to see live data"}
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
