import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

// Google sends the user back here (via Supabase) with a one-time `code`.
// We swap it for a real session (stored in cookies), then send the user back where they were.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  // Only allow redirects inside our own site ("/saved-meals", not "https://evil.com" or "//evil.com").
  const nextParam = searchParams.get("next") ?? "/";
  const next =
    nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
    console.error("Sign-in failed:", error.message);
  }

  return NextResponse.redirect(`${origin}/?auth_error=1`);
}