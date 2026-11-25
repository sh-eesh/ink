import { apiRequest } from "../api/client";

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

export async function getNotes() {
  return await apiRequest<{ notes: Note[] }>("/api/notes");
}
