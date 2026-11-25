import { supabase } from "../lib/supabase";

// Register a new user
export async function registerUser(email: string, password: string) {
  return await supabase.auth.signUp({
    email,
    password,
  });
}

// Log in an existing user
export async function loginUser(email: string, password: string) {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
}

// Log out the current user
export async function logoutUser() {
  return await supabase.auth.signOut();
}
