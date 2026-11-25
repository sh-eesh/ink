import { createClient } from "@supabase/supabase-js";

// Read the Supabase settings from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error("Missing Supabase environment variables");
}

// Create the client used for authentication 
export const supabase = createClient(supabaseUrl, supabasePublishableKey);
