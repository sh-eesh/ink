import { supabase } from "../lib/supabase";

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error("Missing VITE_API_URL environment variable");
}

// Send authenticated requests to the backend
export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  // Get the current user's access token
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    throw new Error("You must be logged in");
  }

  // Attach the token to the request headers
  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${session.access_token}`);

  // Set the content type when sending a request body
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  // Handle HTTP errors returned by the backend
  if (!response.ok) {
    throw new Error(data.error || "API request failed");
  }

  return data as T;
}
