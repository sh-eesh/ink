import type { RequestHandler } from "express";
import { createUserSupabaseClient } from "../config/supabase.js";

export const authenticate: RequestHandler = async (req, res, next) => {
  const authorization = req.get("Authorization");

  if (!authorization?.startsWith("Bearer ")) {
    res.status(401).json({
      error: "Autentication required",
    });
    return;
  }

  const accessToken = authorization.slice(7).trim();

  if (!accessToken) {
    res.status(401).json({
      error: "Invalid access token",
    });

    return;
  }

  const supabase = createUserSupabaseClient(accessToken);

  const { data, error } = await supabase.auth.getUser(accessToken);

  if (error || !data.user) {
    res.status(401).json({
      error: "Invalid or expired access token",
    });
    return;
  }

  res.locals.supabase = supabase;
  res.locals.user = data.user;

  next();
};
