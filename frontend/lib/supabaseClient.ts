import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

// Used only for the Realtime channel subscription (sheet edit -> instant
// map update across every open tab/user). All actual reads/writes of
// property data go through the FastAPI backend in lib/api.ts, so RLS +
// the API stay the single source of truth.
export const supabase = url && anonKey ? createClient(url, anonKey) : null;
