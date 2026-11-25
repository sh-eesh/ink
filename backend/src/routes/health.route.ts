import { Router } from "express";

const router = Router();

router.get("/", (_req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Ink API is healthy",
  });
});

export default router;
