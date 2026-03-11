import { NextRequest, NextResponse } from "next/server";
import { brands } from "../../../../brands.config.js";
import { fetchAthleteData, toTopPosts, type AthleteConfig } from "../../../../lib/instagram";

type BrandConfig = {
  athletes: AthleteConfig[];
};

/**
 * GET /api/instagram/[athleteId]?brand=padelity&type=profile|media|all
 *
 * Server-side proxy — the token never reaches the browser.
 * Falls back to mock data when token === "mock".
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ athleteId: string }> }
) {
  const { athleteId } = await params;
  const { searchParams } = req.nextUrl;
  const brandId = searchParams.get("brand") ?? "";
  const type = searchParams.get("type") ?? "all";

  const brand = (brands as Record<string, BrandConfig>)[brandId];
  if (!brand) {
    return NextResponse.json({ error: "Brand not found" }, { status: 404 });
  }

  const athlete = brand.athletes.find((a: AthleteConfig) => a.id === athleteId);
  if (!athlete) {
    return NextResponse.json({ error: "Athlete not found" }, { status: 404 });
  }

  try {
    const { profile, media } = await fetchAthleteData(athlete);

    if (type === "profile") return NextResponse.json(profile);
    if (type === "media") return NextResponse.json(media);

    // Default: return everything the dashboard needs
    return NextResponse.json({
      profile,
      media,
      topPosts: toTopPosts(athlete, media, profile.followers_count),
    });
  } catch (err) {
    console.error("[instagram proxy]", err);
    return NextResponse.json({ error: "Upstream error" }, { status: 502 });
  }
}
