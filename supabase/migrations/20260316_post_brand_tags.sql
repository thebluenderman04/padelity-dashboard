create table if not exists post_brand_tags (
  id                uuid primary key default gen_random_uuid(),
  ig_post_id        text not null,
  ig_user_id        text not null,
  brand_id          text not null,
  brand_tag         text not null,
  deal_value        numeric,
  notes             text,
  tagged_at         timestamptz default now(),
  constraint post_brand_tags_unique unique(ig_post_id, brand_tag)
);
create index if not exists post_brand_tags_brand_idx on post_brand_tags(brand_id, ig_user_id);
