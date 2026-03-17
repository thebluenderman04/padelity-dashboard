-- Run in Supabase SQL Editor (Dashboard → SQL Editor → New Query)

create table if not exists instagram_snapshots (
  id                    uuid primary key default gen_random_uuid(),
  athlete_id            uuid references athletes(id) on delete cascade,
  fetched_at            timestamptz default now(),
  followers             int4,
  avg_engagement_rate   numeric,
  avg_likes             numeric,
  avg_comments          numeric,
  avg_views             numeric,
  posting_frequency_30d numeric,
  top_posts_json        jsonb,
  audience_json         jsonb,
  content_tags_json     jsonb,
  raw_response_json     jsonb
);

create table if not exists commercial_profiles (
  id                   uuid primary key default gen_random_uuid(),
  athlete_id           uuid references athletes(id) on delete cascade,
  snapshot_id          uuid references instagram_snapshots(id),
  post_rate_low        numeric,
  post_rate_high       numeric,
  story_rate_low       numeric,
  story_rate_high      numeric,
  reel_rate_low        numeric,
  reel_rate_high       numeric,
  campaign_rate_low    numeric,
  campaign_rate_high   numeric,
  audience_value_score numeric,
  brand_fit_tags       jsonb,
  brand_safety_rating  text,
  brand_safety_flags   jsonb,
  rate_overrides_json  jsonb,  -- also stores score_breakdown
  currency             text default 'MYR',
  generated_at         timestamptz default now()
);

create table if not exists generated_pdfs (
  id                    uuid primary key default gen_random_uuid(),
  athlete_id            uuid references athletes(id) on delete cascade,
  commercial_profile_id uuid references commercial_profiles(id),
  file_url              text,
  brand_name_override   text,
  generated_at          timestamptz default now(),
  downloaded_at         timestamptz
);
