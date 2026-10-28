import { Router } from "express";
import { z } from "zod";
import { getEarthquakes, getGdacsEvents, sourceCatalog } from "../../services/providers.js";

const router = Router();
router.get("/sources", (_req, res) =>
  res.json({
    items: sourceCatalog.map((item) => ({ ...item, lastCheckedAt: new Date().toISOString() })),
  })
);
router.get("/events", async (req, res, next) => {
  try {
    const query = z
      .object({
        source: z.enum(["usgs", "gdacs"]).default("gdacs"),
        type: z
          .enum(["earthquake", "cyclone", "flood", "volcano", "drought", "wildfire"])
          .optional(),
        alertLevel: z.enum(["green", "orange", "red"]).optional(),
        minMagnitude: z.coerce.number().min(-2).max(10).default(0),
        fromDate: z.iso.date().optional(),
        toDate: z.iso.date().optional(),
        limit: z.coerce.number().int().min(1).max(100).default(50),
      })
      .parse(req.query);
    if (query.fromDate && query.toDate && query.fromDate > query.toDate)
      return res.status(400).json({
        error: {
          code: "INVALID_DATE_RANGE",
          message: "Start date must be before or equal to end date.",
        },
      });
    if (
      query.fromDate &&
      query.toDate &&
      new Date(query.toDate) - new Date(query.fromDate) > 90 * 24 * 60 * 60 * 1000
    )
      return res.status(400).json({
        error: {
          code: "DATE_RANGE_TOO_LARGE",
          message: "Choose a date range of 90 days or less.",
        },
      });
    if (query.toDate && query.toDate > new Date().toISOString().slice(0, 10))
      return res
        .status(400)
        .json({ error: { code: "FUTURE_DATE", message: "End date cannot be in the future." } });
    const items =
      query.source === "usgs" ? await getEarthquakes(query) : await getGdacsEvents(query);
    res.set("Cache-Control", "public, max-age=60");
    res.json({
      items,
      source: query.source === "usgs" ? "USGS" : "GDACS",
      dataType: "observations-and-alerts",
      refreshedAt: new Date().toISOString(),
      count: items.length,
    });
  } catch (error) {
    next(error);
  }
});
export default router;
