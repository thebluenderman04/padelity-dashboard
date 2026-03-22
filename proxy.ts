import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import type { NextRequest } from "next/server";

const getSecret = () =>
  new TextEncoder().encode(
    process.env.JWT_SECRET || "padelity-dev-secret-change-in-production"
  );

// Top-level segments that are NOT brand routes
const PUBLIC_SEGMENTS = new Set(["_next", "api", "favicon.ico", "onboard", ""]);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const firstSegment = pathname.split("/")[1] ?? "";

  // Skip public routes
  if (PUBLIC_SEGMENTS.has(firstSegment)) return NextResponse.next();

  // ── Athlete self-serve portal (/me/*) ──────────────────────────────────────
  if (firstSegment === "me") {
    const athleteToken = request.cookies.get("athlete_session")?.value;
    if (!athleteToken) {
      return NextResponse.redirect(new URL("/onboard", request.url));
    }
    try {
      await jwtVerify(athleteToken, getSecret());
      return NextResponse.next();
    } catch {
      const res = NextResponse.redirect(new URL("/onboard", request.url));
      res.cookies.delete("athlete_session");
      return res;
    }
  }

  // ── Brand dashboard (/[brand]/*) ───────────────────────────────────────────
  const token = request.cookies.get("session")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  try {
    const { payload } = await jwtVerify(token, getSecret());
    if ((payload as { brand?: string }).brand !== firstSegment) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  } catch {
    const res = NextResponse.redirect(new URL("/", request.url));
    res.cookies.delete("session");
    return res;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
