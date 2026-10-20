import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Supabase client for SERVER code (server components, API routes). It reads the login cookies,
// so queries run as the signed-in user. A new one is created per request on purpose.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server components can't set cookies. That's fine: proxy.ts refreshes the session instead.
          }
        },
      },
    },
  );
}