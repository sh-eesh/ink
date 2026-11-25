import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

// These values identify the Supabase project and its public client key
const supabaseUrl = process.env.SUPABASE_URL;
const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;

// Create a Supabase client for a specific authenticated user
export function createUserSupabaseClient(accessToken: string) {
  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error("Missing Supabase environment variables");
  }

  return createClient(supabaseUrl, supabasePublishableKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,

      // This client dosen't run in a browser
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        // Use the logged in user's token for database requests
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}
