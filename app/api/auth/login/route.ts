import { NextRequest, NextResponse } from "next/server";
import { brands } from "../../../../brands.config.js";
import { createSessionToken } from "../../../../lib/auth";

export async function POST(req: NextRequest) {
  const { brand: brandId, password } = await req.json();

  const brand = (brands as Record<string, { password: string }>)[brandId];

  if (!brand || brand.password !== password) {
    return NextResponse.json({ error: "Invalid brand or password" }, { status: 401 });
  }

  const token = await createSessionToken(brandId);

  const res = NextResponse.json({ ok: true });
  res.cookies.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24 h
    path: "/",
  });

  return res;
}
