import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import healthRoutes from "./routes/health.route.js";
import notesRoutes from "./routes/notes.route.js";

// Load env variables from backend .env file
dotenv.config();

// Create express application
const app = express();

// Render gives PORT in prod
const PORT = process.env.PORT || 5000;

// Allow frontend to make request to the API
app.use(cors());

// Parse incoming JSON req so routes can access req.body
app.use(express.json());

// Mount each route under its own API path
app.use("/api/health", healthRoutes);
app.use("/api/notes", notesRoutes);

// Start listening for HTTP requests
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
