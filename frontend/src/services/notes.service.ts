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

// Create a new note
export async function createNote(title: string, content: string) {
  return await apiRequest<{ note: Note }>("/api/notes", {
    method: "POST",
    body: JSON.stringify({ title, content }),
  });
}

// Update an existing note
export async function updateNote(id: string, title: string, content: string) {
  return await apiRequest<{ note: Note }>(`/api/notes/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ title, content }),
  });
}

// Delete an existing note
export async function deleteNote(id: string) {
  return await apiRequest<{ message: string }>(`/api/notes/${id}`, {
    method: "DELETE",
  });
}
