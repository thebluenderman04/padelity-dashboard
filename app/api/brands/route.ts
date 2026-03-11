import { brands } from "../../../brands.config.js";

export async function GET() {
  // Only return public info — never expose passwords or tokens
  const publicBrands = Object.entries(brands).map(
    ([id, b]: [string, { name: string; tagline?: string }]) => ({
      id,
      name: b.name,
      tagline: b.tagline ?? "",
    })
  );
  return Response.json(publicBrands);
}
