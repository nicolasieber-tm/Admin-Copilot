import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";

// Service-Role-Client – existiert ausschliesslich in Edge Functions
// (ARCHITECTURE.md §2). Die Umgebungsvariablen werden von Supabase injiziert.
export function createServiceClient(): SupabaseClient {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } }
  );
}
