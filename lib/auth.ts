import type { SupabaseClient } from "@supabase/supabase-js";
 
// Sends the user to Google to sign in, then back to the exact page they were on
// (including a search like /?q=chicken), via /auth/callback.
export async function signInWithGoogle(supabase: SupabaseClient) {
  const next = window.location.pathname + window.location.search;
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });
}
 