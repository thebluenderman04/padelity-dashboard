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

  // Extract the first path segment  (e.g. "padelity" from "/padelity/overview")
  const firstSegment = pathname.split("/")[1] ?? "";

  // Skip non-brand routes
  if (PUBLIC_SEGMENTS.has(firstSegment)) return NextResponse.next();

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
