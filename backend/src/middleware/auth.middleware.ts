import type { RequestHandler } from "express";
import { createUserSupabaseClient } from "../config/supabase.js";

// Check whether the request comes from a logged in user
export const authenticate: RequestHandler = async (req, res, next) => {
  const authorization = req.get("Authorization");

  // Require a Bearer token in the request header
  if (!authorization?.startsWith("Bearer ")) {
    res.status(401).json({
      error: "Autentication required",
    });
    return;
  }

  // Extract the access token from Authentication header
  const accessToken = authorization.slice(7).trim();

  if (!accessToken) {
    res.status(401).json({
      error: "Invalid access token",
    });

    return;
  }

  // Create supabase client and retrieve the authenticated user
  const supabase = createUserSupabaseClient(accessToken);

  const { data, error } = await supabase.auth.getUser(accessToken);

  if (error || !data.user) {
    res.status(401).json({
      error: "Invalid or expired access token",
    });
    return;
  }

  // Make the user and Supabase client available to route handlers
  res.locals.supabase = supabase;
  res.locals.user = data.user;

  // Continue to the requested route
  next();
};
