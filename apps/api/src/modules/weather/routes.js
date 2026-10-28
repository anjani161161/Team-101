import { Router } from "express";
import { z } from "zod";
import { searchWeather } from "../../services/providers.js";

const router = Router();
router.get("/", async (req, res, next) => {
  try {
    const { location } = z.object({ location: z.string().trim().min(2).max(100) }).parse(req.query);
    res.set("Cache-Control", "public, max-age=60");
    res.json(await searchWeather(location));
  } catch (error) {
    next(error);
  }
});
export default router;
