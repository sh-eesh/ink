import { apiRequest } from "../api/client";

// Define the structure of a note
export type Note = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  is_pinned: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
};

// Retrieve the logged-in user's notes
export async function getNotes() {
  return await apiRequest<{ notes: Note[] }>("/api/notes");
}
