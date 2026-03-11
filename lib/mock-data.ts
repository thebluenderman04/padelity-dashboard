// ─── Types ───────────────────────────────────────────────────────────────────

export interface AthleteStats {
  id: string;
  name: string;
  username: string;
  displayUsername: string;
  nationality: string;
  flag: string;
  ranking: number;
  followers: number;
  followersGrowth: number; // % vs prev month
  following: number;
  posts: number;
  postsLast30: number;
  engagementRate: number;
  engagementRatePrev: number;
  reach: number;
  reachPrev: number;
  impressions: number;
  avgLikes: number;
  avgComments: number;
}

export interface EngagementPoint {
  date: string;
  engagement: number;
  reach: number;
  impressions: number;
}

export interface ContentSlice {
  name: string;
  value: number;
  color: string;
}

export interface TopPost {
  id: string;
  athleteId: string;
  athleteName: string;
  type: "Reel" | "Photo" | "Carousel" | "Video";
  caption: string;
  gradient: [string, string];
  publishedAt: string;
  likes: number;
  comments: number;
  reach: number;
  impressions: number;
  engagementRate: number;
  /** Real Instagram image URL (available when token is live) */
  mediaUrl?: string;
  /** Video thumbnail URL */
  thumbnailUrl?: string;
  /** Link to the Instagram post */
  permalink?: string;
}

export interface AgeGroup {
  group: string;
  pct: number;
}

export interface GenderSlice {
  name: string;
  value: number;
  color: string;
}

export interface CountryRow {
  country: string;
  flag: string;
  pct: number;
}

// ─── Athletes ─────────────────────────────────────────────────────────────────

export const mockAthletes: AthleteStats[] = [
  {
    id: "juan-lebron",
    name: "Juan LeBron",
    username: "juanlebronn",
    displayUsername: "@juanlebronn",
    nationality: "Spain",
    flag: "🇪🇸",
    ranking: 1,
    followers: 245800,
    followersGrowth: 3.2,
    following: 892,
    posts: 412,
    postsLast30: 14,
    engagementRate: 4.8,
    engagementRatePrev: 4.5,
    reach: 89420,
    reachPrev: 82600,
    impressions: 145600,
    avgLikes: 9870,
    avgComments: 234,
  },
  {
    id: "alejandro-galan",
    name: "Alejandro Galán",
    username: "alejandrogalan10",
    displayUsername: "@alejandrogalan10",
    nationality: "Spain",
    flag: "🇪🇸",
    ranking: 2,
    followers: 198200,
    followersGrowth: 2.7,
    following: 641,
    posts: 387,
    postsLast30: 11,
    engagementRate: 5.2,
    engagementRatePrev: 4.9,
    reach: 72100,
    reachPrev: 67800,
    impressions: 118400,
    avgLikes: 8640,
    avgComments: 198,
  },
  {
    id: "arturo-coello",
    name: "Arturo Coello",
    username: "arturocm07",
    displayUsername: "@arturocm07",
    nationality: "Spain",
    flag: "🇪🇸",
    ranking: 3,
    followers: 156400,
    followersGrowth: 5.8,
    following: 724,
    posts: 298,
    postsLast30: 16,
    engagementRate: 6.1,
    engagementRatePrev: 5.6,
    reach: 68200,
    reachPrev: 61400,
    impressions: 102300,
    avgLikes: 7980,
    avgComments: 312,
  },
  {
    id: "agustin-tapia",
    name: "Agustín Tapia",
    username: "agustintapia",
    displayUsername: "@agustintapia",
    nationality: "Argentina",
    flag: "🇦🇷",
    ranking: 4,
    followers: 142600,
    followersGrowth: 4.1,
    following: 518,
    posts: 356,
    postsLast30: 12,
    engagementRate: 5.7,
    engagementRatePrev: 5.3,
    reach: 61400,
    reachPrev: 57200,
    impressions: 94200,
    avgLikes: 7140,
    avgComments: 176,
  },
  {
    id: "francisco-navarro",
    name: "Francisco Navarro",
    username: "frannavarro.padel",
    displayUsername: "@frannavarro.padel",
    nationality: "Spain",
    flag: "🇪🇸",
    ranking: 5,
    followers: 89300,
    followersGrowth: 1.9,
    following: 432,
    posts: 241,
    postsLast30: 9,
    engagementRate: 4.2,
    engagementRatePrev: 4.0,
    reach: 38600,
    reachPrev: 36200,
    impressions: 58900,
    avgLikes: 3240,
    avgComments: 87,
  },
  {
    id: "pablo-cardona",
    name: "Pablo Cardona",
    username: "pcardona_padel",
    displayUsername: "@pcardona_padel",
    nationality: "Spain",
    flag: "🇪🇸",
    ranking: 8,
    followers: 67100,
    followersGrowth: 1.2,
    following: 389,
    posts: 178,
    postsLast30: 7,
    engagementRate: 3.8,
    engagementRatePrev: 3.6,
    reach: 28900,
    reachPrev: 27100,
    impressions: 44200,
    avgLikes: 2240,
    avgComments: 58,
  },
];

// ─── Overview KPIs ────────────────────────────────────────────────────────────

export const overviewKPIs = {
  totalFollowers: { value: 899400, prev: 871200, changePct: 3.2 },
  avgEngagementRate: { value: 4.97, prev: 4.65, changePp: 0.32 },
  totalReach: { value: 358620, prev: 332300, changePct: 7.9 },
  totalImpressions: { value: 563600, prev: 529400, changePct: 6.5 },
};

// ─── Engagement time-series (30 days ending Mar 9 2026) ──────────────────────

export const engagementSeries: EngagementPoint[] = [
  { date: "Feb 8",  engagement: 4.2, reach: 76400,  impressions: 122800 },
  { date: "Feb 9",  engagement: 4.5, reach: 81200,  impressions: 130600 },
  { date: "Feb 10", engagement: 4.8, reach: 79800,  impressions: 128400 },
  { date: "Feb 11", engagement: 4.3, reach: 74600,  impressions: 119800 },
  { date: "Feb 12", engagement: 5.1, reach: 92400,  impressions: 148600 },
  { date: "Feb 13", engagement: 5.4, reach: 98200,  impressions: 157800 },
  { date: "Feb 14", engagement: 4.9, reach: 88400,  impressions: 142200 },
  { date: "Feb 15", engagement: 4.7, reach: 84600,  impressions: 136100 },
  { date: "Feb 16", engagement: 4.4, reach: 79200,  impressions: 127400 },
  { date: "Feb 17", engagement: 4.8, reach: 86800,  impressions: 139600 },
  { date: "Feb 18", engagement: 5.2, reach: 94200,  impressions: 151400 },
  { date: "Feb 19", engagement: 5.6, reach: 101600, impressions: 163400 },
  { date: "Feb 20", engagement: 5.8, reach: 105800, impressions: 170200 },
  { date: "Feb 21", engagement: 5.3, reach: 96400,  impressions: 155000 },
  { date: "Feb 22", engagement: 4.9, reach: 88800,  impressions: 142800 },
  { date: "Feb 23", engagement: 4.6, reach: 83200,  impressions: 133800 },
  { date: "Feb 24", engagement: 4.8, reach: 87000,  impressions: 140000 },
  { date: "Feb 25", engagement: 5.0, reach: 90600,  impressions: 145800 },
  { date: "Feb 26", engagement: 5.3, reach: 96000,  impressions: 154400 },
  { date: "Feb 27", engagement: 5.7, reach: 103200, impressions: 166000 },
  { date: "Feb 28", engagement: 5.5, reach: 99800,  impressions: 160600 },
  { date: "Mar 1",  engagement: 5.1, reach: 92400,  impressions: 148600 },
  { date: "Mar 2",  engagement: 4.8, reach: 87000,  impressions: 140000 },
  { date: "Mar 3",  engagement: 4.5, reach: 81600,  impressions: 131200 },
  { date: "Mar 4",  engagement: 4.7, reach: 85200,  impressions: 137000 },
  { date: "Mar 5",  engagement: 5.0, reach: 90600,  impressions: 145800 },
  { date: "Mar 6",  engagement: 5.3, reach: 96200,  impressions: 154800 },
  { date: "Mar 7",  engagement: 5.6, reach: 101600, impressions: 163400 },
  { date: "Mar 8",  engagement: 5.4, reach: 97800,  impressions: 157400 },
  { date: "Mar 9",  engagement: 5.1, reach: 92400,  impressions: 148600 },
];

// ─── Content Mix ──────────────────────────────────────────────────────────────

export const contentMix: ContentSlice[] = [
  { name: "Reels",     value: 45, color: "#0a0a0a" },
  { name: "Photos",    value: 30, color: "#6b7280" },
  { name: "Carousels", value: 18, color: "#d1d5db" },
  { name: "Videos",    value:  7, color: "#f0ede6" },
];

// ─── Top Posts ────────────────────────────────────────────────────────────────

export const topPosts: TopPost[] = [
  {
    id: "p1",
    athleteId: "juan-lebron",
    athleteName: "Juan LeBron",
    type: "Reel",
    caption: "World number one feeling 🏆 #padel #WPT",
    gradient: ["#0f0c29", "#302b63"],
    publishedAt: "Feb 20",
    likes: 12400,
    comments: 289,
    reach: 95200,
    impressions: 152800,
    engagementRate: 5.8,
  },
  {
    id: "p2",
    athleteId: "arturo-coello",
    athleteName: "Arturo Coello",
    type: "Reel",
    caption: "Match point 🎾 Finals recap",
    gradient: ["#1a1a2e", "#16213e"],
    publishedAt: "Feb 19",
    likes: 10800,
    comments: 312,
    reach: 89400,
    impressions: 143600,
    engagementRate: 7.1,
  },
  {
    id: "p3",
    athleteId: "alejandro-galan",
    athleteName: "Alejandro Galán",
    type: "Photo",
    caption: "Training hard, winning harder 💪",
    gradient: ["#2c3e50", "#3498db"],
    publishedAt: "Feb 18",
    likes: 9600,
    comments: 178,
    reach: 78200,
    impressions: 125400,
    engagementRate: 5.3,
  },
  {
    id: "p4",
    athleteId: "agustin-tapia",
    athleteName: "Agustín Tapia",
    type: "Reel",
    caption: "Buenos Aires, te extraño 🇦🇷 #padel",
    gradient: ["#74ebd5", "#acb6e5"],
    publishedAt: "Feb 21",
    likes: 9200,
    comments: 204,
    reach: 74800,
    impressions: 120200,
    engagementRate: 6.6,
  },
  {
    id: "p5",
    athleteId: "juan-lebron",
    athleteName: "Juan LeBron",
    type: "Carousel",
    caption: "Behind the scenes at the tournament 📸",
    gradient: ["#232526", "#414345"],
    publishedAt: "Feb 13",
    likes: 8800,
    comments: 156,
    reach: 72400,
    impressions: 116600,
    engagementRate: 4.9,
  },
  {
    id: "p6",
    athleteId: "arturo-coello",
    athleteName: "Arturo Coello",
    type: "Photo",
    caption: "Campeonísimo 🏆 #WPT #padel",
    gradient: ["#3a1c71", "#d76d77"],
    publishedAt: "Feb 27",
    likes: 8400,
    comments: 267,
    reach: 69800,
    impressions: 112200,
    engagementRate: 6.2,
  },
  {
    id: "p7",
    athleteId: "alejandro-galan",
    athleteName: "Alejandro Galán",
    type: "Reel",
    caption: "That smash tho 🔥 top 5 shots of the week",
    gradient: ["#11998e", "#38ef7d"],
    publishedAt: "Feb 26",
    likes: 8100,
    comments: 143,
    reach: 66200,
    impressions: 106400,
    engagementRate: 5.1,
  },
  {
    id: "p8",
    athleteId: "francisco-navarro",
    athleteName: "Francisco Navarro",
    type: "Photo",
    caption: "Game face 😤 #padel #dedication",
    gradient: ["#4568dc", "#b06ab3"],
    publishedAt: "Feb 22",
    likes: 4200,
    comments: 98,
    reach: 34600,
    impressions: 55800,
    engagementRate: 4.7,
  },
  {
    id: "p9",
    athleteId: "agustin-tapia",
    athleteName: "Agustín Tapia",
    type: "Carousel",
    caption: "Road to the top 🛣️ week in pictures",
    gradient: ["#f7971e", "#ffd200"],
    publishedAt: "Feb 17",
    likes: 7800,
    comments: 189,
    reach: 63400,
    impressions: 101800,
    engagementRate: 5.9,
  },
  {
    id: "p10",
    athleteId: "pablo-cardona",
    athleteName: "Pablo Cardona",
    type: "Reel",
    caption: "No days off 💯 #grind #padel",
    gradient: ["#5614b0", "#dbd65c"],
    publishedAt: "Mar 6",
    likes: 3200,
    comments: 64,
    reach: 26800,
    impressions: 43200,
    engagementRate: 4.1,
  },
  {
    id: "p11",
    athleteId: "juan-lebron",
    athleteName: "Juan LeBron",
    type: "Reel",
    caption: "Practice session highlights ⚡",
    gradient: ["#1e3c72", "#2a5298"],
    publishedAt: "Mar 4",
    likes: 9400,
    comments: 211,
    reach: 77600,
    impressions: 124800,
    engagementRate: 4.6,
  },
  {
    id: "p12",
    athleteId: "alejandro-galan",
    athleteName: "Alejandro Galán",
    type: "Photo",
    caption: "Family first 🤍 #grateful",
    gradient: ["#e96c2b", "#f9d423"],
    publishedAt: "Mar 2",
    likes: 7600,
    comments: 134,
    reach: 61800,
    impressions: 99200,
    engagementRate: 4.8,
  },
];

// ─── Audience ─────────────────────────────────────────────────────────────────

export const audienceAge: AgeGroup[] = [
  { group: "13–17", pct: 5 },
  { group: "18–24", pct: 28 },
  { group: "25–34", pct: 35 },
  { group: "35–44", pct: 22 },
  { group: "45–54", pct: 8 },
  { group: "55+",   pct: 2 },
];

export const audienceGender: GenderSlice[] = [
  { name: "Male",   value: 73, color: "#0a0a0a" },
  { name: "Female", value: 26, color: "#9ca3af" },
  { name: "Other",  value:  1, color: "#e5e7eb" },
];

export const audienceCountries: CountryRow[] = [
  { country: "Spain",     flag: "🇪🇸", pct: 42 },
  { country: "Argentina", flag: "🇦🇷", pct: 18 },
  { country: "Italy",     flag: "🇮🇹", pct: 10 },
  { country: "Portugal",  flag: "🇵🇹", pct:  9 },
  { country: "France",    flag: "🇫🇷", pct:  7 },
  { country: "Mexico",    flag: "🇲🇽", pct:  5 },
  { country: "Brazil",    flag: "🇧🇷", pct:  4 },
  { country: "Other",     flag: "🌍", pct:  5 },
];
