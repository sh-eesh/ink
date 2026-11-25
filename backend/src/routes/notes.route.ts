import { Router } from "express";
import type { SupabaseClient } from "@supabase/supabase-js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

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

export default router;
