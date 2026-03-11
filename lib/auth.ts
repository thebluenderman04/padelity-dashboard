import { SignJWT, jwtVerify } from "jose";

const getSecret = () =>
  new TextEncoder().encode(
    process.env.JWT_SECRET || "padelity-dev-secret-change-in-production"
  );

export async function createSessionToken(brand: string): Promise<string> {
  return new SignJWT({ brand })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(getSecret());
}

export async function verifySessionToken(
  token: string
): Promise<{ brand: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as { brand: string };
  } catch {
    return null;
  }
}
