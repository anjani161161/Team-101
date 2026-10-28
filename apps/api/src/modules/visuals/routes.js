import { Router } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import { requireAuth, requireRoles } from "../../middleware/auth.js";
import { Institution } from "../../models/index.js";
import { VisualContent } from "../../models/visual-content.js";

const router = Router();
const categories = [
  "Earthquake",
  "Flood",
  "Cyclone and storms",
  "Wildfire",
  "Landslide",
  "Extreme heat",
  "Tsunami",
  "Chemical safety",
  "General preparedness",
];

function httpsUrl(value, optional = false) {
  if (optional && !value) return true;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

const createSchema = z
  .object({
    title: z.string().trim().min(3).max(120),
    description: z.string().trim().max(1800).default(""),
    category: z.enum(categories),
    mediaType: z.enum(["animation", "image", "video"]),
    mediaUrl: z.string().trim().url().refine((value) => httpsUrl(value), "Media URL must use HTTPS."),
    altText: z.string().trim().max(250).default(""),
    sourceName: z.string().trim().max(120).default("AtmosWatch"),
    sourceUrl: z
      .string()
      .trim()
      .max(2048)
      .default("")
      .refine((value) => httpsUrl(value, true), "Source URL must use HTTPS."),
    status: z.enum(["draft", "published"]).default("draft"),
    institutionId: z.string().trim().optional(),
  })
  .strict();

const updateSchema = createSchema
  .omit({ institutionId: true })
  .partial()
  .strict()
  .refine((value) => Object.keys(value).length > 0, "Provide at least one field to update.");

function visibleContentQuery(user) {
  if (user.role === "ADMIN") return {};
  if (user.role === "INSTRUCTOR") {
    const scopes = [{ institutionId: null, status: "published" }, { createdBy: user._id }];
    if (user.institutionId) scopes.push({ institutionId: user.institutionId });
    return { $or: scopes };
  }
  const scopes = [{ institutionId: null }];
  if (user.institutionId) scopes.push({ institutionId: user.institutionId });
  return { status: "published", $or: scopes };
}

function canManage(user, item) {
  if (user.role === "ADMIN") return true;
  return Boolean(
    user.role === "INSTRUCTOR" &&
      user.institutionId &&
      item.institutionId &&
      String(item.institutionId) === String(user.institutionId)
  );
}

function cleanItem(item) {
  const value = item.toObject ? item.toObject() : item;
  return {
    id: String(value._id),
    title: value.title,
    description: value.description,
    category: value.category,
    mediaType: value.mediaType,
    mediaUrl: value.mediaUrl,
    altText: value.altText,
    sourceName: value.sourceName,
    sourceUrl: value.sourceUrl,
    status: value.status,
    institutionId: value.institutionId ? String(value.institutionId) : null,
    createdBy: value.createdBy ? String(value.createdBy) : null,
    updatedAt: value.updatedAt,
    createdAt: value.createdAt,
    canEdit: false,
  };
}

router.use(requireAuth);

router.get("/", async (req, res, next) => {
  try {
    const items = await VisualContent.find(visibleContentQuery(req.user))
      .sort({ updatedAt: -1, createdAt: -1 })
      .limit(200)
      .lean();
    res.set("Cache-Control", "private, no-store");
    res.json({
      items: items.map((item) => ({
        ...cleanItem(item),
        canEdit: canManage(req.user, item),
      })),
    });
  } catch (error) {
    next(error);
  }
});

router.post("/", requireRoles("ADMIN", "INSTRUCTOR"), async (req, res, next) => {
  try {
    const input = createSchema.parse(req.body);
    let institutionId = null;

    if (req.user.role === "INSTRUCTOR") {
      if (!req.user.institutionId)
        return res.status(403).json({
          error: {
            code: "INSTITUTION_ASSIGNMENT_REQUIRED",
            message: "An administrator must assign your instructor account to an institution first.",
          },
        });
      institutionId = req.user.institutionId;
      if (input.institutionId && input.institutionId !== String(institutionId))
        return res.status(403).json({
          error: { code: "SCOPE_FORBIDDEN", message: "Instructors can publish only within their institution." },
        });
    } else if (input.institutionId) {
      if (!mongoose.isValidObjectId(input.institutionId) ||
          !(await Institution.exists({ _id: input.institutionId })))
        return res.status(400).json({
          error: { code: "INSTITUTION_NOT_FOUND", message: "Choose an existing institution or leave the field blank for platform-wide content." },
        });
      institutionId = input.institutionId;
    }

    const item = await VisualContent.create({
      title: input.title,
      description: input.description,
      category: input.category,
      mediaType: input.mediaType,
      mediaUrl: input.mediaUrl,
      altText: input.altText,
      sourceName: input.sourceName,
      sourceUrl: input.sourceUrl,
      status: input.status,
      institutionId,
      createdBy: req.user._id,
      updatedBy: req.user._id,
    });
    res.status(201).json({ item: { ...cleanItem(item), canEdit: true } });
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", requireRoles("ADMIN", "INSTRUCTOR"), async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(404).json({ error: { code: "VISUAL_NOT_FOUND", message: "Visual content was not found." } });
    const item = await VisualContent.findById(req.params.id);
    if (!item || !canManage(req.user, item))
      return res.status(404).json({ error: { code: "VISUAL_NOT_FOUND", message: "Visual content was not found in your authorized scope." } });

    const input = updateSchema.parse(req.body);
    Object.assign(item, input, { updatedBy: req.user._id });
    await item.save();
    res.json({ item: { ...cleanItem(item), canEdit: true } });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", requireRoles("ADMIN", "INSTRUCTOR"), async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(404).json({ error: { code: "VISUAL_NOT_FOUND", message: "Visual content was not found." } });
    const item = await VisualContent.findById(req.params.id);
    if (!item || !canManage(req.user, item))
      return res.status(404).json({ error: { code: "VISUAL_NOT_FOUND", message: "Visual content was not found in your authorized scope." } });
    await item.deleteOne();
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

export default router;
