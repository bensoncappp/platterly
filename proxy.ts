import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Runs before every page request (Next 16 calls this file "proxy"; older versions called it "middleware").
// Its only job: keep the login session fresh by refreshing its cookies when they're about to expire.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Don't put code between createServerClient and this line. It checks the session and refreshes it if needed.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  // Skip static files and the image route (it doesn't need a session).
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/plate-image|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};