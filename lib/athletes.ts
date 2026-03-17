import { brands } from "../brands.config.js";
import { supabaseAdmin } from "./supabase";
import type { AthleteConfig } from "./instagram";

type BrandWithAthletes = { athletes?: AthleteConfig[] };

/**
 * Returns all athletes for a brand, merging:
 *   1. Athletes stored in Supabase (connected via OAuth onboarding)
 *   2. Static athletes in brands.config.js (fallback / manually configured)
 *
 * Supabase athletes take precedence — if the same ig_user_id exists in both,
 * the Supabase entry wins (so tokens stay fresh after re-auth).
 */
export async function getAthletes(brandId: string): Promise<AthleteConfig[]> {
  // ── Static athletes from brands.config.js ─────────────────────────────────
  const brandCfg = (brands as Record<string, BrandWithAthletes>)[brandId];
  const staticAthletes: AthleteConfig[] = brandCfg?.athletes ?? [];

  // ── Dynamic athletes from Supabase ────────────────────────────────────────
  try {
    const { data, error } = await supabaseAdmin
      .from("athletes")
      .select("name, instagram_handle, ig_user_id, token")
      .eq("brand_id", brandId);

    if (error) throw error;

    const dbAthletes: AthleteConfig[] = (data ?? []).map((a) => ({
      id: a.ig_user_id, // stable, unique identifier
      name: a.name,
      instagram_handle: a.instagram_handle ?? "",
      token: a.token,
      ig_user_id: a.ig_user_id,
    }));

    // Static athletes whose ig_user_id doesn't exist in Supabase are kept
    const staticFiltered = staticAthletes.filter(
      (s) => !dbAthletes.some((d) => d.ig_user_id === s.ig_user_id)
    );

    return [...staticFiltered, ...dbAthletes];
  } catch (err) {
    // If Supabase is unreachable or key not set, gracefully fall back
    console.error("[athletes] Supabase fetch failed, using static config:", err);
    return staticAthletes;
  }
}
