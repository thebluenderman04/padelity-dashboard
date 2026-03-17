"use client";

import { useState } from "react";
import PostsGrid from "./PostsGrid";
import type { TopPost } from "../lib/mock-data";

interface Props {
  posts: TopPost[];
  types: string[];
}

export default function PostsGridWithFilter({ posts, types }: Props) {
  const [active, setActive] = useState("All");

  const filtered =
    active === "All" ? posts : posts.filter((p) => p.type === active);

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-6">
        {types.map((t) => (
          <button
            key={t}
            onClick={() => setActive(t)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors cursor-pointer select-none ${
              t === active
                ? "bg-ink text-white border-ink"
                : "bg-surface text-ink-muted border-border hover:border-ink-muted hover:text-ink"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <PostsGrid posts={filtered} />

      <p className="text-center text-xs text-ink-subtle mt-8">
        Showing {filtered.length} post{filtered.length !== 1 ? "s" : ""}
        {active !== "All" ? ` · ${active}s` : " · all types"} · ranked by
        engagement rate
      </p>
    </>
  );
}
