import { createBrowserClient } from "@supabase/ssr";

// Supabase client for CLIENT components. Unlike the plain client in lib/supabase.ts, it keeps the
// signed-in user's session in cookies, so the server can see who is logged in too.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}