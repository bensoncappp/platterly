import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { name } = await req.json();
  const supabase = await createClient();

  // Who is asking comes from the login cookies, never from the request body.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in first" }, { status: 401 });
  }

  if (!name || !name.trim()) {
    return NextResponse.json(
      { error: "Board name is required" },
      { status: 400 },
    );
  }

  const { data: board, error } = await supabase
    .from("boards")
    .insert({ user_id: user.id, name: name.trim() })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ board });
}