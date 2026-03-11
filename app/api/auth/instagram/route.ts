import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/auth/instagram?athlete=<name>
 *
 * Redirects the athlete to Instagram OAuth. Pass ?athlete=<name> so the
 * callback knows which athlete just connected.
 *
 * Requires in .env:
 *   INSTAGRAM_APP_ID
 *   NEXT_PUBLIC_BASE_URL   (e.g. http://localhost:3000)
 */
export async function GET(req: NextRequest) {
  const appId = process.env.INSTAGRAM_APP_ID;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  if (!appId || !baseUrl) {
    return NextResponse.json(
      { error: "INSTAGRAM_APP_ID and NEXT_PUBLIC_BASE_URL must be set in .env" },
      { status: 500 }
    );
  }

  const athleteName = req.nextUrl.searchParams.get("athlete") ?? "";
  const redirectUri = `${baseUrl}/api/auth/instagram/callback`;

  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    // instagram_business_basic    → profile + media
    // instagram_business_manage_insights → reach, impressions, audience demographics
    scope: "instagram_business_basic,instagram_business_manage_insights",
    response_type: "code",
    state: athleteName, // passed back verbatim by Instagram
  });

  // Business API uses www.instagram.com (not api.instagram.com)
  return NextResponse.redirect(
    `https://www.instagram.com/oauth/authorize?${params}`
  );
}
