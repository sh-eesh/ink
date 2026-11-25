import { Router } from "express";
import type { SupabaseClient } from "@supabase/supabase-js";

import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

// GET /api/notes
// Retrieve all notes belonging to the logged-in user
router.get("/", authenticate, async (_req, res) => {
  const supabase = res.locals.supabase as SupabaseClient;

  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    res.status(500).json({
      error: "Failed to fetch notes",
    });
    return;
  }

  res.status(200).json({
    notes: data,
  });
});

// POST /api/notes
// Create a new note
router.post("/", authenticate, async (req, res) => {
  const supabase = res.locals.supabase as SupabaseClient;
  const user = res.locals.user;

  const { title, content } = req.body;

  if (typeof title !== "string" || typeof content !== "string") {
    res.status(400).json({
      error: "Title and content must be strings",
    });
    return;
  }

  if (title.trim().length > 200) {
    res.status(400).json({
      error: "Title cannot exceed 200 characters",
    });
    return;
  }

  const { data, error } = await supabase
    .from("notes")
    .insert({
      user_id: user.id,
      title: title.trim(),
      content,
    })
    .select()
    .single();

  if (error) {
    res.status(500).json({
      error: "Failed to create note",
    });
    return;
  }

  res.status(201).json({
    note: data,
  });
});

// PATCH /api/notes/:id
// Update an existing note belonging to the logged-in user
router.patch("/:id", authenticate, async (req, res) => {
  const supabase = res.locals.supabase as SupabaseClient;

  const { title, content } = req.body;

  if (title === undefined && content === undefined) {
    res.status(400).json({
      error: "No fields provided for update",
    });
    return;
  }

  if (title !== undefined && typeof title !== "string") {
    res.status(400).json({
      error: "Title must be a string",
    });
    return;
  }

  if (content !== undefined && typeof content !== "string") {
    res.status(400).json({
      error: "Content must be a string",
    });
    return;
  }

  if (typeof title === "string" && title.trim().length > 200) {
    res.status(400).json({
      error: "Title cannot exceed 200 characters",
    });
    return;
  }

  const updates: {
    title?: string;
    content?: string;
  } = {};

  if (title !== undefined) {
    updates.title = title.trim();
  }

  if (content !== undefined) {
    updates.content = content;
  }

  const { data, error } = await supabase
    .from("notes")
    .update(updates)
    .eq("id", req.params.id)
    .select()
    .maybeSingle();

  if (error) {
    res.status(500).json({
      error: "Failed to update note",
    });
    return;
  }

  if (!data) {
    res.status(404).json({
      error: "Note not found",
    });
    return;
  }

  res.status(200).json({
    note: data,
  });
});

// DELETE /api/notes/:id
// Delete a note belonging to the logged-in user
router.delete("/:id", authenticate, async (req, res) => {
  const supabase = res.locals.supabase as SupabaseClient;

  const { data, error } = await supabase
    .from("notes")
    .delete()
    .eq("id", req.params.id)
    .select("id")
    .maybeSingle();

  if (error) {
    res.status(500).json({
      error: "Failed to delete note",
    });
    return;
  }

  if (!data) {
    res.status(404).json({
      error: "Note not found",
    });
    return;
  }

  res.status(200).json({
    message: "Note deleted successfully",
  });
});

export default router;
