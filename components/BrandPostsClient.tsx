"use client";

import { useState, useRef, useCallback } from "react";
import type { IGMedia } from "../lib/instagram";
import { fmt } from "../lib/utils";
import { X, ExternalLink, Tag, Loader2 } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BrandTag {
  id: string;
  ig_post_id: string;
  brand_tag: string;
  deal_value?: number;
  ig_user_id?: string;
  brand_id?: string;
}

interface InsightData {
  impressions: number;
  reach: number;
  saved: number;
  profile_visits: number;
  follows: number;
  likes: number;
  comments: number;
  engagements: number;
  engagement_rate: number;
  isLive: boolean;
}

interface Props {
  posts: IGMedia[];
  existingTags: BrandTag[];
  brandId: string;
  igUserId: string;
  athleteHandle?: string;
}

// ─── Gradient fallback pool ───────────────────────────────────────────────────

const GRADIENTS = [
  ["#0f0c29", "#302b63"],
  ["#1a1a2e", "#16213e"],
  ["#2c3e50", "#3498db"],
  ["#3a1c71", "#d76d77"],
  ["#11998e", "#38ef7d"],
  ["#4568dc", "#b06ab3"],
  ["#f7971e", "#ffd200"],
  ["#1e3c72", "#2a5298"],
  ["#e96c2b", "#f9d423"],
  ["#5614b0", "#dbd65c"],
];

function gradientFor(idx: number): string {
  const [a, b] = GRADIENTS[idx % GRADIENTS.length];
  return `linear-gradient(135deg, ${a}, ${b})`;
}

function typeLabel(mediaType: string): string {
  if (mediaType === "VIDEO") return "Reel";
  if (mediaType === "CAROUSEL_ALBUM") return "Carousel";
  return "Photo";
}

function shortDate(ts: string): string {
  return new Date(ts).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function BrandPostsClient({
  posts,
  existingTags,
  brandId,
  igUserId,
  athleteHandle = "",
}: Props) {
  const [tags, setTags] = useState<BrandTag[]>(existingTags);
  const [activeBrandFilter, setActiveBrandFilter] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<IGMedia | null>(null);
  const [pitchMode, setPitchMode] = useState(false);
  const [dealValue, setDealValue] = useState("");
  const [insights, setInsights] = useState<Record<string, InsightData>>({});
  const [insightsLoading, setInsightsLoading] = useState<string | null>(null);

  // Modal tag input state
  const [tagInput, setTagInput] = useState("");
  const [tagSaving, setTagSaving] = useState(false);
  const [captionExpanded, setCaptionExpanded] = useState(false);

  // ─── Derived ────────────────────────────────────────────────────────────────

  const uniqueBrands = Array.from(
    new Set(tags.map((t) => t.brand_tag.trim()).filter(Boolean))
  ).sort();

  const filteredPosts =
    activeBrandFilter === null
      ? posts
      : posts.filter((p) =>
          tags.some((t) => t.ig_post_id === p.id && t.brand_tag === activeBrandFilter)
        );

  const tagsForPost = useCallback(
    (postId: string) => tags.filter((t) => t.ig_post_id === postId),
    [tags]
  );

  // ─── Insights fetch ──────────────────────────────────────────────────────────

  const fetchInsights = useCallback(
    async (post: IGMedia) => {
      if (insights[post.id] || insightsLoading === post.id) return;
      setInsightsLoading(post.id);
      try {
        const url =
          `/api/instagram/${igUserId}/post-insights/${post.id}` +
          `?brand=${brandId}&media_type=${post.media_type}` +
          `&likes=${post.like_count}&comments=${post.comments_count}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch insights");
        const data: InsightData = await res.json();
        setInsights((prev) => ({ ...prev, [post.id]: data }));
      } catch (err) {
        console.error("[insights]", err);
      } finally {
        setInsightsLoading(null);
      }
    },
    [insights, insightsLoading, igUserId, brandId]
  );

  // ─── Tag management ──────────────────────────────────────────────────────────

  async function addTag(post: IGMedia, brandTagValue: string) {
    const trimmed = brandTagValue.trim();
    if (!trimmed) return;

    // Prevent duplicate
    const alreadyExists = tags.some(
      (t) => t.ig_post_id === post.id && t.brand_tag === trimmed
    );
    if (alreadyExists) return;

    setTagSaving(true);
    try {
      const res = await fetch("/api/brand-tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ig_post_id: post.id,
          ig_user_id: igUserId,
          brand_id: brandId,
          brand_tag: trimmed,
        }),
      });

      if (!res.ok) throw new Error("Save failed");
      const { tag } = await res.json();
      setTags((prev) => [...prev, tag]);
      setTagInput("");
    } catch (err) {
      console.error("[addTag]", err);
    } finally {
      setTagSaving(false);
    }
  }

  async function removeTag(tagId: string) {
    // Optimistic
    setTags((prev) => prev.filter((t) => t.id !== tagId));
    try {
      await fetch(`/api/brand-tags?id=${tagId}`, { method: "DELETE" });
    } catch (err) {
      console.error("[removeTag]", err);
    }
  }

  // ─── Select post ────────────────────────────────────────────────────────────

  function openPost(post: IGMedia) {
    setSelectedPost(post);
    setCaptionExpanded(false);
    setTagInput("");
    fetchInsights(post);
  }

  function closeModal() {
    setSelectedPost(null);
    setPitchMode(false);
    setCaptionExpanded(false);
    setTagInput("");
  }

  // ─── ROI panel data ─────────────────────────────────────────────────────────

  const roiPosts = activeBrandFilter
    ? posts.filter((p) =>
        tags.some((t) => t.ig_post_id === p.id && t.brand_tag === activeBrandFilter)
      )
    : [];

  const roiInsightsList = roiPosts.map((p) => insights[p.id]).filter(Boolean) as InsightData[];

  const totalReach = roiInsightsList.reduce((s, d) => s + d.reach, 0);
  const totalImpressions = roiInsightsList.reduce((s, d) => s + d.impressions, 0);
  const totalEngagements = roiInsightsList.reduce((s, d) => s + d.engagements, 0);
  const avgEngRate =
    roiInsightsList.length > 0
      ? roiInsightsList.reduce((s, d) => s + d.engagement_rate, 0) / roiInsightsList.length
      : 0;

  const dealNum = parseFloat(dealValue) || 0;
  const costPerEngagement =
    dealNum > 0 && totalEngagements > 0 ? dealNum / totalEngagements : null;
  const cpm =
    dealNum > 0 && totalImpressions > 0 ? (dealNum / totalImpressions) * 1000 : null;

  // ─── Pitch view ─────────────────────────────────────────────────────────────

  if (pitchMode && selectedPost) {
    const pd = insights[selectedPost.id];
    const postTags = tagsForPost(selectedPost.id);
    const thumbSrc =
      selectedPost.thumbnail_url ?? selectedPost.media_url ?? null;

    return (
      <div className="fixed inset-0 z-[60] bg-white flex flex-col items-center justify-center p-6">
        {/* Exit */}
        <button
          onClick={() => setPitchMode(false)}
          className="absolute top-4 right-4 text-xs text-ink-muted hover:text-ink px-3 py-1.5 rounded-lg border border-border bg-white transition-colors"
        >
          ✕ Exit Pitch View
        </button>

        {/* Note */}
        <p className="text-xs text-ink-subtle mb-6 font-body">
          Screenshot ready — press ⌘+Shift+4
        </p>

        {/* Card */}
        <div
          className="w-full max-w-sm bg-white rounded-2xl overflow-hidden"
          style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.10)" }}
        >
          {/* Thumbnail */}
          <div className="relative aspect-square">
            {thumbSrc ? (
              <img
                src={thumbSrc}
                alt="Post"
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full"
                style={{ background: gradientFor(posts.indexOf(selectedPost)) }}
              />
            )}
            {/* Brand tag + Padelity in top-right */}
            <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
              {postTags.slice(0, 1).map((t) => (
                <span
                  key={t.id}
                  className="text-xs font-medium px-2 py-0.5 rounded-full bg-black/70 text-white backdrop-blur-sm"
                >
                  {t.brand_tag}
                </span>
              ))}
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/80 text-ink backdrop-blur-sm">
                Padelity
              </span>
            </div>
          </div>

          {/* Metrics */}
          <div className="p-5">
            {/* Row 1 */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="text-center">
                <p className="text-xl font-semibold text-ink">
                  {pd ? fmt(pd.reach) : "—"}
                </p>
                <p className="text-[10px] uppercase tracking-widest text-ink-subtle mt-0.5">
                  Reach
                </p>
              </div>
              <div className="text-center">
                <p className="text-xl font-semibold text-ink">
                  {pd ? fmt(pd.impressions) : "—"}
                </p>
                <p className="text-[10px] uppercase tracking-widest text-ink-subtle mt-0.5">
                  Impr.
                </p>
              </div>
              <div className="text-center">
                <p className="text-xl font-semibold text-ink">
                  {pd ? `${pd.engagement_rate.toFixed(1)}%` : "—"}
                </p>
                <p className="text-[10px] uppercase tracking-widest text-ink-subtle mt-0.5">
                  Eng. Rate
                </p>
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-3 gap-2 pb-4 mb-4 border-b border-border">
              <div className="text-center">
                <p className="text-xl font-semibold text-ink">
                  {pd ? fmt(pd.saved) : "—"}
                </p>
                <p className="text-[10px] uppercase tracking-widest text-ink-subtle mt-0.5">
                  Saves
                </p>
              </div>
              <div className="text-center">
                <p className="text-xl font-semibold text-ink">
                  {pd ? fmt(pd.profile_visits) : "—"}
                </p>
                <p className="text-[10px] uppercase tracking-widest text-ink-subtle mt-0.5">
                  Profile Visits
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-ink">
                  {shortDate(selectedPost.timestamp)}
                </p>
                <p className="text-[10px] uppercase tracking-widest text-ink-subtle mt-0.5">
                  Date
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between text-xs text-ink-subtle">
              <span>@{athleteHandle || igUserId}</span>
              <span>Generated by Padelity Analytics</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap mb-6">
        <button
          onClick={() => setActiveBrandFilter(null)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
            activeBrandFilter === null
              ? "bg-ink text-white border-ink"
              : "bg-white text-ink-muted border-border hover:border-ink-muted"
          }`}
        >
          All Posts
        </button>
        {uniqueBrands.map((brand) => (
          <button
            key={brand}
            onClick={() => setActiveBrandFilter(brand)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
              activeBrandFilter === brand
                ? "bg-ink text-white border-ink"
                : "bg-white text-ink-muted border-border hover:border-ink-muted"
            }`}
          >
            {brand}
          </button>
        ))}
      </div>

      {/* ROI Panel */}
      {activeBrandFilter && (
        <div
          className="rounded-2xl border border-border bg-white p-5 mb-6"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-ink">{activeBrandFilter}</h2>
              <p className="text-xs text-ink-muted mt-0.5">
                {roiPosts.length} tagged post{roiPosts.length !== 1 ? "s" : ""}
                {roiInsightsList.length < roiPosts.length && roiPosts.length > 0
                  ? ` · open posts to load insights`
                  : ""}
              </p>
            </div>
            <Tag size={16} className="text-ink-subtle" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-ink-subtle mb-1">
                Total Reach
              </p>
              <p className="text-xl font-semibold text-ink">
                {roiInsightsList.length > 0 ? fmt(totalReach) : "—"}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-ink-subtle mb-1">
                Avg Eng Rate
              </p>
              <p className="text-xl font-semibold text-ink">
                {roiInsightsList.length > 0 ? `${avgEngRate.toFixed(1)}%` : "—"}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-ink-subtle mb-1">
                Total Engagements
              </p>
              <p className="text-xl font-semibold text-ink">
                {roiInsightsList.length > 0 ? fmt(totalEngagements) : "—"}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-ink-subtle mb-1">
                Posts
              </p>
              <p className="text-xl font-semibold text-ink">{roiPosts.length}</p>
            </div>
          </div>

          {/* Deal value input */}
          <div className="border-t border-border pt-4">
            <p className="text-xs font-medium text-ink-muted mb-2">Deal Value (ROI Calculator)</p>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-0 border border-border rounded-lg overflow-hidden">
                <span className="px-3 py-2 text-sm text-ink-muted bg-canvas border-r border-border">
                  RM
                </span>
                <input
                  type="number"
                  value={dealValue}
                  onChange={(e) => setDealValue(e.target.value)}
                  placeholder="0"
                  className="w-32 px-3 py-2 text-sm text-ink bg-white outline-none placeholder:text-ink-subtle"
                />
              </div>
              {costPerEngagement !== null && (
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-ink-subtle">
                      Cost / Engagement
                    </p>
                    <p className="text-sm font-semibold text-ink">
                      RM {costPerEngagement.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-ink-subtle">
                      CPM
                    </p>
                    <p className="text-sm font-semibold text-ink">
                      RM {cpm!.toFixed(2)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Post grid */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-16 text-ink-muted text-sm">
          {activeBrandFilter
            ? `No posts tagged with "${activeBrandFilter}" yet.`
            : "No posts available."}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredPosts.map((post, idx) => {
            const postTags = tagsForPost(post.id);
            const thumbSrc = post.thumbnail_url ?? post.media_url ?? null;

            return (
              <button
                key={post.id}
                onClick={() => openPost(post)}
                className="group text-left rounded-2xl overflow-hidden border border-border bg-white transition-all hover:-translate-y-0.5"
                style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
              >
                {/* Thumbnail */}
                <div className="relative aspect-square overflow-hidden">
                  {thumbSrc ? (
                    <img
                      src={thumbSrc}
                      alt={post.caption?.slice(0, 60) ?? "Post"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div
                      className="w-full h-full"
                      style={{ background: gradientFor(idx) }}
                    />
                  )}
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  {/* Type badge */}
                  <span className="absolute top-2 left-2 text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-black/60 text-white backdrop-blur-sm">
                    {typeLabel(post.media_type)}
                  </span>
                  {/* Date */}
                  <span className="absolute bottom-2 right-2 text-[10px] text-white/80 bg-black/40 px-1.5 py-0.5 rounded-md backdrop-blur-sm">
                    {shortDate(post.timestamp)}
                  </span>
                </div>

                {/* Bottom section */}
                <div className="p-2.5">
                  {/* Brand tags */}
                  {postTags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-1.5">
                      {postTags.slice(0, 3).map((t) => (
                        <span
                          key={t.id}
                          className="text-[10px] px-1.5 py-0.5 rounded-full bg-canvas text-ink-muted border border-border"
                        >
                          {t.brand_tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {/* Caption */}
                  {post.caption ? (
                    <p className="text-xs text-ink-muted leading-relaxed line-clamp-2">
                      {post.caption}
                    </p>
                  ) : (
                    <p className="text-xs text-ink-subtle italic">No caption</p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {selectedPost && (
        <PostModal
          post={selectedPost}
          postTags={tagsForPost(selectedPost.id)}
          insight={insights[selectedPost.id] ?? null}
          insightLoading={insightsLoading === selectedPost.id}
          tagInput={tagInput}
          setTagInput={setTagInput}
          tagSaving={tagSaving}
          captionExpanded={captionExpanded}
          setCaptionExpanded={setCaptionExpanded}
          postIndex={posts.indexOf(selectedPost)}
          onClose={closeModal}
          onAddTag={(val) => addTag(selectedPost, val)}
          onRemoveTag={removeTag}
          onPitchView={() => setPitchMode(true)}
        />
      )}
    </>
  );
}

// ─── Post Modal ───────────────────────────────────────────────────────────────

interface ModalProps {
  post: IGMedia;
  postTags: BrandTag[];
  insight: InsightData | null;
  insightLoading: boolean;
  tagInput: string;
  setTagInput: (v: string) => void;
  tagSaving: boolean;
  captionExpanded: boolean;
  setCaptionExpanded: (v: boolean) => void;
  postIndex: number;
  onClose: () => void;
  onAddTag: (val: string) => void;
  onRemoveTag: (id: string) => void;
  onPitchView: () => void;
}

function PostModal({
  post,
  postTags,
  insight,
  insightLoading,
  tagInput,
  setTagInput,
  tagSaving,
  captionExpanded,
  setCaptionExpanded,
  postIndex,
  onClose,
  onAddTag,
  onRemoveTag,
  onPitchView,
}: ModalProps) {
  const tagInputRef = useRef<HTMLInputElement>(null);
  const thumbSrc = post.thumbnail_url ?? post.media_url ?? null;
  const isVideo = post.media_type === "VIDEO";

  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      onAddTag(tagInput);
    }
  }

  const MetricCell = ({
    label,
    value,
  }: {
    label: string;
    value: string | null;
  }) => (
    <div className="bg-canvas rounded-xl p-3 text-center">
      <p className="text-[10px] uppercase tracking-widest text-ink-subtle mb-1">{label}</p>
      {insightLoading ? (
        <Loader2 size={16} className="mx-auto text-ink-subtle animate-spin" />
      ) : (
        <p className="text-lg font-semibold text-ink">{value ?? "—"}</p>
      )}
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl"
        style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.15)" }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-border flex items-center justify-between px-5 py-4 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-canvas text-ink-muted border border-border">
              {typeLabel(post.media_type)}
            </span>
            <span className="text-xs text-ink-subtle">{shortDate(post.timestamp)}</span>
          </div>
          <div className="flex items-center gap-2">
            {post.permalink && (
              <a
                href={post.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-canvas transition-colors"
                title="Open on Instagram"
              >
                <ExternalLink size={15} />
              </a>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-canvas transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Thumbnail */}
          <div
            className={`w-full overflow-hidden rounded-xl ${isVideo ? "aspect-square" : "aspect-video"}`}
          >
            {thumbSrc ? (
              <img
                src={thumbSrc}
                alt={post.caption?.slice(0, 60) ?? "Post"}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full"
                style={{ background: gradientFor(postIndex) }}
              />
            )}
          </div>

          {/* Caption */}
          {post.caption && (
            <div>
              <p
                className={`text-sm text-ink-muted leading-relaxed ${captionExpanded ? "" : "line-clamp-3"}`}
              >
                {post.caption}
              </p>
              {post.caption.length > 200 && (
                <button
                  onClick={() => setCaptionExpanded(!captionExpanded)}
                  className="text-xs text-ink-subtle hover:text-ink mt-1 transition-colors"
                >
                  {captionExpanded ? "Show less" : "Show more"}
                </button>
              )}
            </div>
          )}

          {/* Metrics grid */}
          <div>
            <p className="text-xs font-medium text-ink-muted uppercase tracking-wider mb-3">
              Post Insights
              {insight && !insight.isLive && (
                <span className="ml-2 text-ink-subtle normal-case font-normal tracking-normal">
                  · estimated
                </span>
              )}
            </p>
            <div className="grid grid-cols-3 gap-2">
              <MetricCell
                label="Impressions"
                value={insight ? fmt(insight.impressions) : null}
              />
              <MetricCell
                label="Reach"
                value={insight ? fmt(insight.reach) : null}
              />
              <MetricCell
                label="Eng. Rate"
                value={insight ? `${insight.engagement_rate.toFixed(1)}%` : null}
              />
              <MetricCell
                label="Saves"
                value={insight ? fmt(insight.saved) : null}
              />
              <MetricCell
                label="Profile Visits"
                value={insight ? fmt(insight.profile_visits) : null}
              />
              <MetricCell
                label="Follows"
                value={insight ? fmt(insight.follows) : null}
              />
            </div>
          </div>

          {/* Engagement detail */}
          {insight && (
            <div className="rounded-xl border border-border p-4">
              <p className="text-xs font-medium text-ink-muted uppercase tracking-wider mb-3">
                Engagement
              </p>
              <div className="grid grid-cols-4 gap-3 text-center">
                {[
                  { label: "Likes", val: fmt(insight.likes) },
                  { label: "Comments", val: fmt(insight.comments) },
                  { label: "Saves", val: fmt(insight.saved) },
                  { label: "Total", val: fmt(insight.engagements) },
                ].map((m) => (
                  <div key={m.label}>
                    <p className="text-base font-semibold text-ink">{m.val}</p>
                    <p className="text-[10px] text-ink-subtle mt-0.5">{m.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Brand tags */}
          <div>
            <p className="text-xs font-medium text-ink-muted uppercase tracking-wider mb-3">
              Brand Tags
            </p>

            {/* Existing tags */}
            {postTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {postTags.map((t) => (
                  <span
                    key={t.id}
                    className="inline-flex items-center gap-1 text-sm px-3 py-1 rounded-full bg-ink text-white"
                  >
                    {t.brand_tag}
                    <button
                      onClick={() => onRemoveTag(t.id)}
                      className="ml-0.5 opacity-60 hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Add tag input */}
            <div className="flex gap-2">
              <input
                ref={tagInputRef}
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="e.g. Nike, Dunlop…"
                className="flex-1 px-3 py-2 text-sm border border-border rounded-lg bg-canvas text-ink placeholder:text-ink-subtle outline-none focus:border-ink-muted transition-colors"
              />
              <button
                onClick={() => onAddTag(tagInput)}
                disabled={tagSaving || !tagInput.trim()}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-ink text-white hover:bg-ink/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
              >
                {tagSaving ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Tag size={14} />
                )}
                Add Tag
              </button>
            </div>
          </div>
        </div>

        {/* Pitch view button */}
        <div className="sticky bottom-0 bg-white border-t border-border px-5 py-4 rounded-b-2xl">
          <button
            onClick={onPitchView}
            className="w-full py-2.5 rounded-xl bg-ink text-white text-sm font-medium hover:bg-ink/90 transition-colors"
          >
            Pitch View
          </button>
        </div>
      </div>
    </div>
  );
}
