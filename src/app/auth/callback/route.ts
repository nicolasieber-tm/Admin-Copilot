import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// PKCE-Callback: E-Mail-Bestätigung, Magic Link und Passwort-Reset landen hier
// mit einem ?code=…, der gegen eine Session getauscht wird.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
