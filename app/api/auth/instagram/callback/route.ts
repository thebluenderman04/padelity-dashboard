import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const TOKENS_FILE = path.join(process.cwd(), "athlete-tokens.json");

interface AthleteToken {
  name: string;
  ig_user_id: string;
  username: string;
  token: string;
  token_type: "long_lived";
  connected_at: string;
}

interface TokensFile {
  athletes: AthleteToken[];
}

async function readTokensFile(): Promise<TokensFile> {
  try {
    const raw = await fs.readFile(TOKENS_FILE, "utf-8");
    return JSON.parse(raw) as TokensFile;
  } catch {
    return { athletes: [] };
  }
}

async function writeTokensFile(data: TokensFile) {
  await fs.writeFile(TOKENS_FILE, JSON.stringify(data, null, 2), "utf-8");
}

/**
 * GET /api/auth/instagram/callback?code=<code>&state=<athleteName>
 *
 * Instagram redirects here after the athlete authorises the app.
 * Steps:
 *   1. Exchange code for a short-lived token
 *   2. Exchange that for a long-lived token (60-day expiry)
 *   3. Fetch the athlete's ig_user_id + username from /me
 *   4. Upsert the record in athlete-tokens.json
 *   5. Redirect to /onboard?success=1
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const athleteName = searchParams.get("state") ?? "Unknown";
  const error = searchParams.get("error");
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!;

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
    : shortToken; // fall back to short-lived if exchange fails

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

  // ── Step 4: Upsert in athlete-tokens.json ─────────────────────────────────
  const data = await readTokensFile();

  const entry: AthleteToken = {
    name: athleteName || me.name || me.username,
    ig_user_id: me.id,
    username: me.username,
    token: longToken,
    token_type: "long_lived",
    connected_at: new Date().toISOString(),
  };

  // Replace existing entry for this ig_user_id, or append
  const idx = data.athletes.findIndex((a) => a.ig_user_id === me.id);
  if (idx >= 0) {
    data.athletes[idx] = entry;
  } else {
    data.athletes.push(entry);
  }

  await writeTokensFile(data);

  // ── Step 5: Redirect to success ───────────────────────────────────────────
  return NextResponse.redirect(
    `${baseUrl}/onboard?success=1&username=${encodeURIComponent(me.username)}`
  );
}
