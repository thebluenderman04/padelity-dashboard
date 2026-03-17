/**
 * Instagram data layer.
 *
 * Uses the Basic Display API (/me endpoint) with the athlete's token.
 * Falls back to mock data when token === "mock".
 *
 * Note: reach, impressions, and audience demographics require a
 * Business/Creator account with instagram_manage_insights scope.
 * Those sections keep mock data until a business token is supplied.
 */

import {
  mockAthletes,
  audienceAge,
  audienceGender,
  audienceCountries,
  type AthleteStats,
  type EngagementPoint,
  type ContentSlice,
  type TopPost,
} from "./mock-data";

// ─── Raw Instagram API types ──────────────────────────────────────────────────

export interface IGProfile {
  id: string;
  name: string;
  username: string;
  followers_count: number;
  media_count: number;
}

export interface IGMedia {
  id: string;
  caption?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  timestamp: string;
  like_count: number;
  comments_count: number;
  media_url?: string;
  thumbnail_url?: string;
  permalink?: string;
}

// ─── Athlete config shape (mirrors brands.config.js) ─────────────────────────

export interface AthleteConfig {
  id: string;
  name: string;
  instagram_handle: string;
  token: string;
  ig_user_id: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const IG_API = "https://graph.instagram.com/v19.0";

function isMock(token: string): boolean {
  return !token || token === "mock";
}

// ─── Core fetch functions ─────────────────────────────────────────────────────

async function fetchIGProfile(token: string): Promise<IGProfile> {
  const res = await fetch(
    `${IG_API}/me?fields=id,name,username,followers_count,media_count&access_token=${token}`,
    { cache: "no-store" }
  );
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Instagram profile error ${res.status}: ${body}`);
  }
  return res.json();
}

async function fetchIGMedia(token: string): Promise<IGMedia[]> {
  const fields =
    "id,caption,media_type,timestamp,like_count,comments_count,media_url,thumbnail_url,permalink";
  let url: string = `${IG_API}/me/media?fields=${fields}&limit=100&access_token=${token}`;
  let all: IGMedia[] = [];

  while (url && all.length < 300) {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Instagram media error ${res.status}: ${body}`);
    }
    const json = (await res.json()) as {
      data: IGMedia[];
      paging?: { next?: string };
    };
    all = [...all, ...json.data];
    url = json.paging?.next ?? "";
  }

  return all;
}

// ─── Transformers ─────────────────────────────────────────────────────────────

const MEDIA_TYPE_LABEL: Record<IGMedia["media_type"], TopPost["type"]> = {
  VIDEO: "Reel",
  IMAGE: "Photo",
  CAROUSEL_ALBUM: "Carousel",
};

const GRADIENTS: [string, string][] = [
  ["#0f0c29", "#302b63"],
  ["#1a1a2e", "#16213e"],
  ["#2c3e50", "#3498db"],
  ["#74ebd5", "#acb6e5"],
  ["#232526", "#414345"],
  ["#3a1c71", "#d76d77"],
  ["#11998e", "#38ef7d"],
  ["#4568dc", "#b06ab3"],
  ["#f7971e", "#ffd200"],
  ["#5614b0", "#dbd65c"],
  ["#1e3c72", "#2a5298"],
  ["#e96c2b", "#f9d423"],
];

export function toTopPosts(
  config: AthleteConfig,
  media: IGMedia[],
  followers: number
): TopPost[] {
  return [...media]
    .sort((a, b) => b.like_count + b.comments_count - (a.like_count + a.comments_count))
    .map((m, i) => ({
      id: m.id,
      athleteId: config.id,
      athleteName: config.name,
      type: MEDIA_TYPE_LABEL[m.media_type] ?? "Photo",
      caption: m.caption ?? "",
      gradient: GRADIENTS[i % GRADIENTS.length],
      publishedAt: new Date(m.timestamp).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      }),
      likes: m.like_count,
      comments: m.comments_count,
      reach: 0,
      impressions: 0,
      engagementRate: +((m.like_count + m.comments_count) / followers * 100).toFixed(2),
      mediaUrl: m.media_url,
      thumbnailUrl: m.thumbnail_url,
      permalink: m.permalink,
    }));
}

export function toEngagementSeries(
  media: IGMedia[],
  followers: number
): EngagementPoint[] {
  return [...media]
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .map((m) => ({
      date: new Date(m.timestamp).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      engagement: +((m.like_count + m.comments_count) / followers * 100).toFixed(2),
      // repurpose these fields to carry likes / comments for the tooltip
      reach: m.like_count,
      impressions: m.comments_count,
    }));
}

export function toContentMix(media: IGMedia[]): ContentSlice[] {
  const counts: Record<string, number> = {};
  for (const m of media) {
    const label =
      m.media_type === "VIDEO"
        ? "Reels"
        : m.media_type === "IMAGE"
        ? "Photos"
        : "Carousels";
    counts[label] = (counts[label] ?? 0) + 1;
  }
  const total = media.length;
  const COLORS: Record<string, string> = {
    Reels: "#0a0a0a",
    Photos: "#6b7280",
    Carousels: "#d1d5db",
  };
  return Object.entries(counts)
    .map(([name, n]) => ({
      name,
      value: Math.round((n / total) * 100),
      color: COLORS[name] ?? "#e5e7eb",
    }))
    .sort((a, b) => b.value - a.value);
}

export function toAthleteStats(
  config: AthleteConfig,
  profile: IGProfile,
  media: IGMedia[]
): AthleteStats {
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
  const recent = media.filter(
    (m) => new Date(m.timestamp).getTime() > thirtyDaysAgo
  );

  const avgEngRate =
    media.length > 0
      ? media.reduce((s, m) => s + (m.like_count + m.comments_count), 0) /
        media.length /
        profile.followers_count *
        100
      : 0;

  return {
    id: config.id,
    name: config.name,
    username: profile.username,
    displayUsername: config.instagram_handle,
    nationality: "United Kingdom",
    flag: "🇬🇧",
    ranking: 1,
    followers: profile.followers_count,
    followersGrowth: 0,
    following: 0,
    posts: profile.media_count,
    postsLast30: recent.length,
    engagementRate: +avgEngRate.toFixed(2),
    engagementRatePrev: +avgEngRate.toFixed(2),
    reach: 0,
    reachPrev: 0,
    impressions: 0,
    avgLikes:
      media.length > 0
        ? Math.round(media.reduce((s, m) => s + m.like_count, 0) / media.length)
        : 0,
    avgComments:
      media.length > 0
        ? Math.round(
            media.reduce((s, m) => s + m.comments_count, 0) / media.length
          )
        : 0,
  };
}

// ─── Main entry point ─────────────────────────────────────────────────────────

export interface AthleteData {
  profile: IGProfile;
  media: IGMedia[];
}

export async function fetchAthleteData(
  config: AthleteConfig
): Promise<AthleteData> {
  if (isMock(config.token)) {
    const mock = mockAthletes.find((a) => a.id === config.id) ?? mockAthletes[0];
    return {
      profile: {
        id: config.id,
        name: mock.name,
        username: mock.username,
        followers_count: mock.followers,
        media_count: mock.posts,
      },
      media: [],
    };
  }

  const [profile, media] = await Promise.all([
    fetchIGProfile(config.token),
    fetchIGMedia(config.token),
  ]);

  return { profile, media };
}

// ─── Audience (fetched from Business API, falls back to mock) ─────────────────

/** Convert ISO-3166-1 alpha-2 code → flag emoji */
function codeToFlag(code: string): string {
  return code
    .toUpperCase()
    .split("")
    .map((c) => String.fromCodePoint(c.charCodeAt(0) + 127397))
    .join("");
}

const COUNTRY_NAMES: Record<string, string> = {
  US: "United States", GB: "United Kingdom", ES: "Spain", AR: "Argentina",
  IT: "Italy", PT: "Portugal", FR: "France", MX: "Mexico", BR: "Brazil",
  DE: "Germany", AU: "Australia", NL: "Netherlands", CA: "Canada",
  CO: "Colombia", CL: "Chile", PE: "Peru", PL: "Poland", BE: "Belgium",
  SE: "Sweden", CH: "Switzerland", AT: "Austria", NO: "Norway", DK: "Denmark",
  FI: "Finland", AE: "UAE", SA: "Saudi Arabia", JP: "Japan", KR: "South Korea",
  IN: "India", ZA: "South Africa", NZ: "New Zealand", SG: "Singapore",
  EG: "Egypt", MA: "Morocco", RU: "Russia", TR: "Turkey", PK: "Pakistan",
  NG: "Nigeria", TH: "Thailand", ID: "Indonesia", MY: "Malaysia",
};

export interface AudienceInsights {
  age: import("./mock-data").AgeGroup[];
  gender: import("./mock-data").GenderSlice[];
  countries: import("./mock-data").CountryRow[];
  isLive: boolean;
}

export async function fetchAudienceInsights(
  config: AthleteConfig
): Promise<AudienceInsights> {
  const fallback: AudienceInsights = {
    age: audienceAge,
    gender: audienceGender,
    countries: audienceCountries,
    isLive: false,
  };

  if (isMock(config.token)) return fallback;

  try {
    const [countryRes, genderAgeRes] = await Promise.allSettled([
      fetch(
        `${IG_API}/me/insights?metric=audience_country&period=lifetime&access_token=${config.token}`,
        { cache: "no-store" }
      ),
      fetch(
        `${IG_API}/me/insights?metric=audience_gender_age&period=lifetime&access_token=${config.token}`,
        { cache: "no-store" }
      ),
    ]);

    let countries = audienceCountries;
    let age = audienceAge;
    let gender = audienceGender;
    let gotAnyRealData = false;

    // ── Countries ────────────────────────────────────────────────────────────
    if (countryRes.status === "fulfilled" && countryRes.value.ok) {
      const json = await countryRes.value.json();
      const rawCounts: Record<string, number> =
        json?.data?.[0]?.values?.[0]?.value ?? {};
      const total = Object.values(rawCounts).reduce((s, v) => s + v, 0);

      if (total > 0) {
        gotAnyRealData = true;
        const sorted = Object.entries(rawCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 7);

        countries = sorted.map(([code, count]) => ({
          country: COUNTRY_NAMES[code] ?? code,
          flag: codeToFlag(code),
          pct: Math.round((count / total) * 100),
        }));

        const otherPct = 100 - countries.reduce((s, c) => s + c.pct, 0);
        if (otherPct > 0) {
          countries.push({ country: "Other", flag: "🌍", pct: otherPct });
        }
      }
    }

    // ── Gender + Age ──────────────────────────────────────────────────────────
    if (genderAgeRes.status === "fulfilled" && genderAgeRes.value.ok) {
      const json = await genderAgeRes.value.json();
      const rawCounts: Record<string, number> =
        json?.data?.[0]?.values?.[0]?.value ?? {};

      if (Object.keys(rawCounts).length > 0) {
        gotAnyRealData = true;

        // Aggregate gender (keys like "M.25-34", "F.18-24", "U.35-44")
        const genderTotals: Record<string, number> = { M: 0, F: 0, U: 0 };
        const ageTotals: Record<string, number> = {};

        for (const [key, count] of Object.entries(rawCounts)) {
          const dotIdx = key.indexOf(".");
          const gCode = dotIdx >= 0 ? key.slice(0, dotIdx) : "U";
          const ageRange = dotIdx >= 0 ? key.slice(dotIdx + 1) : key;
          genderTotals[gCode] = (genderTotals[gCode] ?? 0) + count;
          ageTotals[ageRange] = (ageTotals[ageRange] ?? 0) + count;
        }

        const gTotal = Object.values(genderTotals).reduce((s, v) => s + v, 0);
        if (gTotal > 0) {
          gender = [
            {
              name: "Male",
              value: Math.round((genderTotals.M / gTotal) * 100),
              color: "#0a0a0a",
            },
            {
              name: "Female",
              value: Math.round((genderTotals.F / gTotal) * 100),
              color: "#9ca3af",
            },
            {
              name: "Other",
              value: Math.round(((genderTotals.U ?? 0) / gTotal) * 100),
              color: "#e5e7eb",
            },
          ].filter((g) => g.value > 0);
        }

        const aTotal = Object.values(ageTotals).reduce((s, v) => s + v, 0);
        if (aTotal > 0) {
          age = Object.entries(ageTotals)
            .sort(([a], [b]) => {
              const numA = parseInt(a.replace("+", "").split("-")[0]);
              const numB = parseInt(b.replace("+", "").split("-")[0]);
              return numA - numB;
            })
            .map(([group, count]) => ({
              // Normalise "65+" → "65+" and "13-17" → "13–17" (en-dash)
              group: group.replace("-", "–"),
              pct: Math.round((count / aTotal) * 100),
            }));
        }
      }
    }

    return { age, gender, countries, isLive: gotAnyRealData };
  } catch (err) {
    console.error("[audience] Failed to fetch insights:", err);
    return fallback;
  }
}
