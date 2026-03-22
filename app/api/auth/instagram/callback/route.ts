import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import { supabaseAdmin } from "../../../../../lib/supabase";

const getSecret = () =>
  new TextEncoder().encode(
    process.env.JWT_SECRET || "padelity-dev-secret-change-in-production"
  );

/**
 * GET /api/auth/instagram/callback?code=<code>&state=<name||brandId>
 *
 * Instagram redirects here after the athlete authorises the app.
 * Steps:
 *   1. Exchange code for a short-lived token
 *   2. Exchange that for a long-lived token (60-day expiry)
 *   3. Fetch the athlete's ig_user_id + username from /me
 *   4. Upsert into Supabase `athletes` table
 *   5. Redirect to /onboard?success=1
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const rawState = searchParams.get("state") ?? "";
  const error = searchParams.get("error");
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!;

  // Parse state: "athleteName||brandId"
  const [athleteName, brandId] = rawState.includes("||")
    ? rawState.split("||")
    : [rawState, "padelity"];

  if (error) {
    const desc = searchParams.get("error_description") ?? error;
    return NextResponse.redirect(
      `${baseUrl}/onboard?error=${encodeURIComponent(desc)}`
    );
  }

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/onboard?error=no_code`);
  }

  const appId = process.env.INSTAGRAM_APP_ID!;
  const appSecret = process.env.INSTAGRAM_APP_SECRET!;
  const redirectUri = `${baseUrl}/api/auth/instagram/callback`;

  // ── Step 1: Short-lived token ──────────────────────────────────────────────
  const tokenRes = await fetch("https://api.instagram.com/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: appId,
      client_secret: appSecret,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
      code,
    }),
  });

  if (!tokenRes.ok) {
    const msg = await tokenRes.text();
    return NextResponse.redirect(
      `${baseUrl}/onboard?error=${encodeURIComponent("Token exchange failed: " + msg)}`
    );
  }

  const { access_token: shortToken } = (await tokenRes.json()) as {
    access_token: string;
    user_id: string;
  };

  // ── Step 2: Long-lived token (60-day) ─────────────────────────────────────
  const longTokenParams = new URLSearchParams({
    grant_type: "ig_exchange_token",
    client_id: appId,
    client_secret: appSecret,
    access_token: shortToken,
  });

  const longTokenRes = await fetch(
    `https://graph.instagram.com/access_token?${longTokenParams}`
  );

  const longToken: string = longTokenRes.ok
    ? ((await longTokenRes.json()) as { access_token: string }).access_token
    : shortToken;

  // ── Step 3: Fetch profile ──────────────────────────────────────────────────
  const meRes = await fetch(
    `https://graph.instagram.com/me?fields=id,username,name&access_token=${longToken}`
  );

  if (!meRes.ok) {
    return NextResponse.redirect(
      `${baseUrl}/onboard?error=${encodeURIComponent("Failed to fetch Instagram profile")}`
    );
  }

  const me = (await meRes.json()) as {
    id: string;
    username: string;
    name?: string;
  };

  const resolvedName = athleteName || me.name || me.username;

  // ── Step 4: Upsert into Supabase ───────────────────────────────────────────
  const { error: dbError } = await supabaseAdmin
    .from("athletes")
    .upsert(
      {
        brand_id: brandId,
        name: resolvedName,
        instagram_handle: `@${me.username}`,
        ig_user_id: me.id,
        token: longToken,
        token_type: "long_lived",
        connected_at: new Date().toISOString(),
      },
      { onConflict: "ig_user_id" }
    );

  if (dbError) {
    console.error("[padelity-onboard] Supabase upsert failed:", dbError);
    // Don't block the success redirect — token was obtained, just log it
    console.log(
      `[padelity-onboard] Token for ${resolvedName} (${me.username}): ${longToken}`
    );
  } else {
    console.log(
      `[padelity-onboard] ✓ ${resolvedName} (@${me.username}) saved to Supabase (brand: ${brandId})`
    );
  }

  // ── Step 5: Issue athlete session cookie + redirect to personal dashboard ──
  const athleteJwt = await new SignJWT({
    igUserId: me.id,
    name: resolvedName,
    username: me.username,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("60d")
    .sign(getSecret());

  const res = NextResponse.redirect(`${baseUrl}/me/overview`);
  res.cookies.set("athlete_session", athleteJwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 60, // 60 days
    path: "/",
  });
  return res;
}
