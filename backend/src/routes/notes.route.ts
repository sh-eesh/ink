import { Router } from "express";
import type { SupabaseClient } from "@supabase/supabase-js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

// Retrieve all notes belonging to the logged in user
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

// Create a new note
router.post("/", authenticate, async (req, res) => {
  const supabase = res.locals.supabase as SupabaseClient;
  const user = res.locals.user;

  // Get the title and content from the request body
  const { title, content } = req.body;

  // Make sure both fields contain strings
  if (typeof title !== "string" || typeof content !== "string") {
    res.status(400).json({
      error: "Title and content must be strings",
    });
    return;
  }

  const { data, error } = await supabase
    .from("notes")
    .insert({
      // Assign the note to the authenticated user
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

  // Return the newely created note
  res.status(201).json({
    note: data,
  });
});

export default router;
