import { Router } from "express";
import { z } from "zod";
import {
  AuditEvent,
  Checklist,
  Drill,
  Institution,
  PersonalChecklist,
} from "../../models/index.js";
import { requireAuth, requirePermission, requireRoles } from "../../middleware/auth.js";

const router = Router();
const starterItems = [
  ["home-exits", "Identify two safe ways out of your home"],
  ["meeting-place", "Choose a family meeting place"],
  ["contacts", "Learn how to contact a trusted adult"],
  ["emergency-kit", "Know where essential supplies are kept"],
  ["local-guidance", "Review official guidance for hazards in your area"],
];
router.get("/personal-checklist", requireAuth, requireRoles("STUDENT"), async (req, res, next) => {
  try {
    let item = await PersonalChecklist.findOne({ userId: req.user.id });
    if (!item)
      item = await PersonalChecklist.create({
        userId: req.user.id,
        items: starterItems.map(([id, label]) => ({ id, label })),
      });
    res.json({ item });
  } catch (error) {
    next(error);
  }
});
router.patch(
  "/personal-checklist",
  requireAuth,
  requirePermission("personal-checklist:manage"),
  async (req, res, next) => {
    try {
      const input = z
        .object({
          items: z.array(z.object({ id: z.string(), done: z.boolean() }).strict()).max(20),
        })
        .strict()
        .parse(req.body);
      let item = await PersonalChecklist.findOne({ userId: req.user.id });
      if (!item)
        item = await PersonalChecklist.create({
          userId: req.user.id,
          items: starterItems.map(([id, label]) => ({ id, label })),
        });
      if (
        input.items.length !== item.items.length ||
        input.items.some(({ id }) => !item.items.some((entry) => entry.id === id))
      )
        return res.status(400).json({
          error: {
            code: "INVALID_CHECKLIST",
            message: "Checklist items do not match your personal checklist.",
          },
        });
      item.items = item.items.map((entry) => ({
        id: entry.id,
        label: entry.label,
        done: input.items.find((value) => value.id === entry.id).done,
      }));
      await item.save();
      res.json({ item });
    } catch (error) {
      next(error);
    }
  }
);
function institutionScope(req, requestedId) {
  return req.user.role === "ADMIN"
    ? requestedId || req.user.institutionId || null
    : req.user.institutionId;
}
router.get("/institutions", requireAuth, async (req, res, next) => {
  try {
    if (req.user.role === "ADMIN")
      return res.json({ items: await Institution.find().sort({ name: 1 }).lean() });
    if (!req.user.institutionId) return res.json({ items: [] });
    res.json({ items: await Institution.find({ _id: req.user.institutionId }).lean() });
  } catch (error) {
    next(error);
  }
});
router.post(
  "/institutions",
  requireAuth,
  requirePermission("institutions:administer"),
  async (req, res, next) => {
    try {
      const input = z
        .object({
          name: z.string().trim().min(2).max(140),
          type: z.enum(["school", "college", "other"]),
          state: z.string().trim().max(80).optional(),
          district: z.string().trim().max(80).optional(),
          city: z.string().trim().max(80).optional(),
        })
        .parse(req.body);
      const institution = await Institution.create({ ...input, createdBy: req.user.id });
      await AuditEvent.create({
        actorId: req.user.id,
        targetId: institution._id,
        action: "institution.created",
        changes: { name: institution.name, type: institution.type },
      });
      res.status(201).json({ item: institution });
    } catch (error) {
      next(error);
    }
  }
);
router.get("/checklists", requireAuth, async (req, res, next) => {
  try {
    if (!req.user.institutionId && req.user.role !== "ADMIN")
      return res.json({
        items: [],
        message: "Create or join an institution workspace to manage its preparedness records.",
      });
    const query =
      req.user.role === "ADMIN" && !req.query.institutionId
        ? {}
        : { institutionId: institutionScope(req, req.query.institutionId) };
    res.json({ items: await Checklist.find(query).lean() });
  } catch (error) {
    next(error);
  }
});
router.post(
  "/checklists",
  requireAuth,
  requirePermission("preparedness:write"),
  async (req, res, next) => {
    try {
      if (!req.user.institutionId && req.user.role !== "ADMIN")
        return res.status(403).json({
          error: {
            code: "INSTITUTION_ACCESS_REQUIRED",
            message: "An approved institution safety role is required.",
          },
        });
      const input = z
        .object({
          title: z.string().trim().min(2).max(120),
          category: z.string().trim().min(2).max(60),
          items: z
            .array(
              z.object({
                label: z.string().trim().min(2).max(200),
                done: z.boolean().default(false),
              })
            )
            .max(60),
          institutionId: z.string().optional(),
        })
        .parse(req.body);
      if (
        req.user.role === "INSTRUCTOR" &&
        input.institutionId &&
        input.institutionId !== String(req.user.institutionId)
      )
        return res.status(403).json({
          error: {
            code: "SCOPE_FORBIDDEN",
            message: "You cannot write records for another institution.",
          },
        });
      const institutionId = institutionScope(req, input.institutionId);
      if (!institutionId || !(await Institution.exists({ _id: institutionId })))
        return res.status(400).json({
          error: { code: "INSTITUTION_REQUIRED", message: "Choose an existing institution." },
        });
      const item = await Checklist.create({
        ...input,
        institutionId,
        updatedBy: req.user.id,
      });
      await AuditEvent.create({
        actorId: req.user.id,
        targetId: item._id,
        action: "preparedness.checklist.created",
        changes: { institutionId },
      });
      res.status(201).json({ item });
    } catch (error) {
      next(error);
    }
  }
);
router.patch(
  "/checklists/:id",
  requireAuth,
  requirePermission("preparedness:write"),
  async (req, res, next) => {
    try {
      if (!req.user.institutionId && req.user.role !== "ADMIN")
        return res.status(403).json({
          error: {
            code: "INSTITUTION_ACCESS_REQUIRED",
            message: "An approved institution safety role is required.",
          },
        });
      const { items } = z
        .object({
          items: z.array(z.object({ label: z.string().max(200), done: z.boolean() })).max(60),
        })
        .parse(req.body);
      const item = await Checklist.findOneAndUpdate(
        {
          _id: req.params.id,
          ...(req.user.role === "ADMIN" ? {} : { institutionId: req.user.institutionId }),
        },
        { items, updatedBy: req.user.id },
        { new: true, runValidators: true }
      );
      if (!item)
        return res.status(404).json({
          error: {
            code: "CHECKLIST_NOT_FOUND",
            message: "Checklist was not found in this institution.",
          },
        });
      await AuditEvent.create({
        actorId: req.user.id,
        targetId: item._id,
        action: "preparedness.checklist.updated",
      });
      res.json({ item });
    } catch (error) {
      next(error);
    }
  }
);
router.get("/drills", requireAuth, async (req, res, next) => {
  try {
    if (!req.user.institutionId && req.user.role !== "ADMIN")
      return res.json({
        items: [],
        message: "Create or join an institution workspace to schedule drills.",
      });
    res.json({
      items: await Drill.find(
        req.user.role === "ADMIN" ? {} : { institutionId: req.user.institutionId }
      )
        .sort({ scheduledAt: -1 })
        .limit(100)
        .lean(),
    });
  } catch (error) {
    next(error);
  }
});
router.post(
  "/drills",
  requireAuth,
  requirePermission("preparedness:write"),
  async (req, res, next) => {
    try {
      if (!req.user.institutionId && req.user.role !== "ADMIN")
        return res.status(403).json({
          error: {
            code: "INSTITUTION_ACCESS_REQUIRED",
            message: "An approved institution safety role is required.",
          },
        });
      const input = z
        .object({
          title: z.string().trim().min(3).max(160),
          type: z.enum(["evacuation", "earthquake", "fire", "weather", "other"]),
          scheduledAt: z.iso.datetime(),
          objectives: z.string().max(2000).optional(),
          institutionId: z.string().optional(),
        })
        .parse(req.body);
      if (
        req.user.role === "INSTRUCTOR" &&
        input.institutionId &&
        input.institutionId !== String(req.user.institutionId)
      )
        return res.status(403).json({
          error: {
            code: "SCOPE_FORBIDDEN",
            message: "You cannot write records for another institution.",
          },
        });
      const institutionId = institutionScope(req, input.institutionId);
      if (!institutionId || !(await Institution.exists({ _id: institutionId })))
        return res.status(400).json({
          error: { code: "INSTITUTION_REQUIRED", message: "Choose an existing institution." },
        });
      const item = await Drill.create({
        ...input,
        scheduledAt: new Date(input.scheduledAt),
        institutionId,
        createdBy: req.user.id,
      });
      await AuditEvent.create({
        actorId: req.user.id,
        targetId: item._id,
        action: "preparedness.drill.created",
        changes: { institutionId },
      });
      res.status(201).json({ item });
    } catch (error) {
      next(error);
    }
  }
);
router.patch(
  "/drills/:id",
  requireAuth,
  requirePermission("preparedness:write"),
  async (req, res, next) => {
    try {
      if (!req.user.institutionId && req.user.role !== "ADMIN")
        return res.status(403).json({
          error: {
            code: "INSTITUTION_ACCESS_REQUIRED",
            message: "An approved institution safety role is required.",
          },
        });
      const input = z
        .object({
          status: z.enum(["planned", "completed", "cancelled"]).optional(),
          debrief: z.string().max(4000).optional(),
          participantCount: z.number().int().min(0).optional(),
        })
        .parse(req.body);
      const item = await Drill.findOneAndUpdate(
        {
          _id: req.params.id,
          ...(req.user.role === "ADMIN" ? {} : { institutionId: req.user.institutionId }),
        },
        input,
        { new: true, runValidators: true }
      );
      if (!item)
        return res.status(404).json({
          error: { code: "DRILL_NOT_FOUND", message: "Drill was not found in this institution." },
        });
      await AuditEvent.create({
        actorId: req.user.id,
        targetId: item._id,
        action: "preparedness.drill.updated",
        changes: input,
      });
      res.json({ item });
    } catch (error) {
      next(error);
    }
  }
);
export default router;
