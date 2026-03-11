import { fmt, fmtPct } from "../lib/utils";
import type { TopPost } from "../lib/mock-data";
import { Heart, MessageCircle, TrendingUp, ExternalLink } from "lucide-react";

const TYPE_BADGE: Record<TopPost["type"], string> = {
  Reel:     "bg-violet-100 text-violet-700",
  Photo:    "bg-sky-100 text-sky-700",
  Carousel: "bg-amber-100 text-amber-700",
  Video:    "bg-emerald-100 text-emerald-700",
};

function PostCard({ post }: { post: TopPost }) {
  const imgSrc = post.thumbnailUrl ?? post.mediaUrl;
  const [from, to] = post.gradient;

  return (
    <div
      className="bg-surface rounded-2xl overflow-hidden"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.06)" }}
    >
      {/* Thumbnail — real image or gradient fallback */}
      <div className="aspect-square relative overflow-hidden">
        {imgSrc ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={imgSrc}
            alt={post.caption.slice(0, 60)}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div
            className="w-full h-full"
            style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
          />
        )}

        {/* Type badge — always shown */}
        <span
          className={`absolute bottom-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full ${TYPE_BADGE[post.type]}`}
        >
          {post.type}
        </span>

        {/* External link icon when permalink is available */}
        {post.permalink && (
          <a
            href={post.permalink}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-2 right-2 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full p-1 transition-colors"
            title="View on Instagram"
          >
            <ExternalLink size={11} className="text-white" />
          </a>
        )}
      </div>

      {/* Meta */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium text-ink truncate">{post.athleteName}</p>
          <p className="text-xs text-ink-subtle flex-shrink-0 ml-2">{post.publishedAt}</p>
        </div>

        {post.caption && (
          <p className="text-xs text-ink-muted line-clamp-2 mb-3 leading-relaxed">
            {post.caption}
          </p>
        )}

        {/* Stats row */}
        <div className="flex items-center gap-3 text-xs text-ink-muted">
          <span className="flex items-center gap-1">
            <Heart size={11} strokeWidth={2} />
            {fmt(post.likes)}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle size={11} strokeWidth={2} />
            {fmt(post.comments)}
          </span>
          <span className="ml-auto flex items-center gap-1 font-medium text-ink">
            <TrendingUp size={11} strokeWidth={2} />
            {fmtPct(post.engagementRate)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function PostsGrid({ posts }: { posts: TopPost[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {posts.map((p) => (
        <PostCard key={p.id} post={p} />
      ))}
    </div>
  );
}
