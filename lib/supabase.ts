import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Prefer the service role key (bypasses RLS) — fall back to anon key
const activeKey = serviceKey && serviceKey.trim() ? serviceKey : supabaseAnonKey;

if (!serviceKey || !serviceKey.trim()) {
  console.warn(
    "[supabase] SUPABASE_SERVICE_ROLE_KEY is not set — falling back to anon key. " +
      "DB writes may fail if RLS is enabled. " +
      "Get it from: Supabase Dashboard → Settings → API → service_role"
  );
}

/**
 * Server-only Supabase admin client.
 * Uses the service role key to bypass RLS — NEVER import in client components.
 */
export const supabaseAdmin = createClient(supabaseUrl, activeKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
