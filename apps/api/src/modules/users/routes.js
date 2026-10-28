import { Router } from "express";
import bcrypt from "bcryptjs";
import { rateLimit, ipKeyGenerator } from "express-rate-limit";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import {
  AuditEvent,
  Checklist,
  Drill,
  Institution,
  LessonProgress,
  SimulationAttempt,
  User,
} from "../../models/index.js";
import { requireAuth, requirePermission } from "../../middleware/auth.js";
import { createActivationToken } from "../auth/routes.js";

const router = Router();
const accountCreationLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 30,
  keyGenerator: (req) => ipKeyGenerator(req.ip),
  standardHeaders: "draft-8",
  legacyHeaders: false,
});
const userRoles = ["ADMIN", "INSTRUCTOR", "STUDENT"];
const scopedUsers = (actor) =>
  actor.role === "ADMIN" ? {} : { role: "STUDENT", institutionId: actor.institutionId };

async function audit(req, action, targetId, changes = {}, reason) {
  await AuditEvent.create({
    actorId: req.user.id,
    targetId,
    action,
    changes,
    reason,
    correlationId: req.get("x-request-id")?.slice(0, 100),
  });
}

function safeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    institutionId: user.institutionId,
    educationLevel: user.educationLevel,
    active: user.active,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

router.use(requireAuth);

router.get("/", requirePermission("users:manage"), async (req, res, next) => {
  try {
    const querySchema = z.object({
      q: z.string().trim().max(100).optional(),
      role: z.enum(userRoles).optional(),
      active: z.enum(["true", "false"]).optional(),
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(100).default(25),
    });
    const input = querySchema.parse(req.query);
    if (req.user.role === "INSTRUCTOR" && input.role && input.role !== "STUDENT")
      return res.status(403).json({
        error: {
          code: "SCOPE_FORBIDDEN",
          message: "Instructors may view student accounts only.",
        },
      });
    const filter = { ...scopedUsers(req.user) };
    if (req.user.role !== "ADMIN" && !req.user.institutionId)
      return res.json({ items: [], page: input.page, pages: 0, total: 0 });
    if (input.role) filter.role = input.role;
    if (input.active) filter.active = input.active === "true";
    if (input.q)
      filter.$or = [
        { name: { $regex: input.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } },
        { email: { $regex: input.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } },
      ];
    const [rows, total] = await Promise.all([
      User.find(filter)
        .select("name email role institutionId educationLevel active createdAt updatedAt")
        .sort({ createdAt: -1 })
        .skip((input.page - 1) * input.limit)
        .limit(input.limit)
        .lean(),
      User.countDocuments(filter),
    ]);
    res.json({
      items: rows.map(safeUser),
      page: input.page,
      pages: Math.ceil(total / input.limit),
      total,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/analytics", requirePermission("analytics:read"), async (_req, res, next) => {
  try {
    const [userCounts, institutions, lessonCompletions, assessments, drills, checklists] =
      await Promise.all([
        User.aggregate([
          { $group: { _id: { role: "$role", active: "$active" }, count: { $sum: 1 } } },
        ]),
        Institution.countDocuments(),
        LessonProgress.aggregate([{ $unwind: "$completedLessons" }, { $count: "total" }]).then(
          (rows) => rows[0]?.total || 0
        ),
        SimulationAttempt.countDocuments(),
        Drill.countDocuments(),
        Checklist.countDocuments(),
      ]);
    res.json({ userCounts, institutions, lessonCompletions, assessments, drills, checklists });
  } catch (error) {
    next(error);
  }
});

router.get("/progress-summary", requirePermission("users:manage"), async (req, res, next) => {
  try {
    const scope = req.user.role === "ADMIN" ? { role: "STUDENT" } : scopedUsers(req.user);
    const studentIds = await User.distinct("_id", scope);
    if (!studentIds.length)
      return res.json({
        studentCount: 0,
        lessonCompletions: 0,
        averageQuizScore: null,
        modules: [],
      });
    const [progress, lessonCompletions] = await Promise.all([
      LessonProgress.aggregate([
        { $match: { userId: { $in: studentIds } } },
        {
          $group: {
            _id: "$moduleId",
            students: { $addToSet: "$userId" },
            averageQuizScore: { $avg: "$quizScore" },
            completions: { $sum: { $size: "$completedLessons" } },
          },
        },
        {
          $project: {
            moduleId: "$_id",
            _id: 0,
            students: { $size: "$students" },
            averageQuizScore: 1,
            completions: 1,
          },
        },
        { $sort: { moduleId: 1 } },
      ]),
      LessonProgress.aggregate([
        { $match: { userId: { $in: studentIds } } },
        { $unwind: "$completedLessons" },
        { $count: "total" },
      ]).then((rows) => rows[0]?.total || 0),
    ]);
    const scores = progress.filter((item) => item.averageQuizScore !== null);
    res.json({
      studentCount: studentIds.length,
      lessonCompletions,
      averageQuizScore: scores.length
        ? Math.round(scores.reduce((sum, item) => sum + item.averageQuizScore, 0) / scores.length)
        : null,
      modules: progress,
    });
  } catch (error) {
    next(error);
  }
});

router.post(
  "/",
  accountCreationLimit,
  requirePermission("users:create-student"),
  async (req, res, next) => {
    try {
      const input = z
        .object({
          name: z.string().trim().min(2).max(80),
          email: z.email().max(254),
          role: z.enum(userRoles),
          institutionId: z.string().optional(),
          educationLevel: z.enum(["primary", "secondary", "college", "adult"]).default("secondary"),
        })
        .strict()
        .parse(req.body);
      if (req.user.role === "INSTRUCTOR") {
        if (input.role !== "STUDENT" || !req.user.institutionId)
          return res.status(403).json({
            error: {
              code: "SCOPE_FORBIDDEN",
              message:
                "Instructors can create student accounts only within their assigned institution.",
            },
          });
        if (input.institutionId && input.institutionId !== String(req.user.institutionId))
          return res.status(403).json({
            error: {
              code: "SCOPE_FORBIDDEN",
              message: "Students cannot be assigned outside your institution.",
            },
          });
      } else if (req.user.role !== "ADMIN") {
        return res.status(403).json({
          error: { code: "FORBIDDEN", message: "Administrator or instructor access is required." },
        });
      }
      const email = input.email.trim().toLowerCase();
      if (await User.exists({ email }))
        return res.status(409).json({
          error: { code: "EMAIL_IN_USE", message: "An account with this email already exists." },
        });
      const institutionId =
        req.user.role === "INSTRUCTOR" ? req.user.institutionId : input.institutionId || null;
      if (institutionId && !(await Institution.exists({ _id: institutionId })))
        return res.status(400).json({
          error: { code: "INSTITUTION_NOT_FOUND", message: "Choose an existing institution." },
        });
      const { token, tokenHash } = createActivationToken();
      const activationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const user = await User.create({
        name: input.name,
        email,
        role: input.role,
        institutionId,
        educationLevel: input.educationLevel,
        active: false,
        passwordHash: await bcrypt.hash(cryptoRandomPassword(), 12),
        activationTokenHash: tokenHash,
        activationExpiresAt,
      });
      await audit(req, "user.created", user._id, {
        role: user.role,
        institutionId: user.institutionId,
        active: false,
      });
      res.set("Cache-Control", "no-store");
      res.status(201).json({ item: safeUser(user), activationToken: token, activationExpiresAt });
    } catch (error) {
      next(error);
    }
  }
);

router.patch("/:id", requirePermission("users:manage"), async (req, res, next) => {
  try {
    if (!["ADMIN", "INSTRUCTOR"].includes(req.user.role))
      return res.status(403).json({
        error: { code: "FORBIDDEN", message: "Student accounts cannot manage user profiles." },
      });
    const input = z
      .object({
        name: z.string().trim().min(2).max(80).optional(),
        role: z.enum(userRoles).optional(),
        active: z.boolean().optional(),
        institutionId: z.string().nullable().optional(),
        educationLevel: z.enum(["primary", "secondary", "college", "adult"]).optional(),
        reason: z.string().trim().max(500).optional(),
      })
      .strict()
      .refine((value) => Object.keys(value).some((key) => key !== "reason"), "Provide an update")
      .parse(req.body);
    const target = await User.findOne({ _id: req.params.id, ...scopedUsers(req.user) });
    if (!target)
      return res.status(404).json({
        error: {
          code: "USER_NOT_FOUND",
          message: "User was not found in your authorized scope.",
        },
      });
    if (
      req.user.role === "INSTRUCTOR" &&
      (input.role || input.institutionId !== undefined || input.active !== undefined)
    )
      return res.status(403).json({
        error: {
          code: "SCOPE_FORBIDDEN",
          message: "Instructors may update student profile and learning-level fields only.",
        },
      });
    if (input.role && req.user.role !== "ADMIN")
      return res
        .status(403)
        .json({ error: { code: "FORBIDDEN", message: "Only administrators may change roles." } });
    if (input.institutionId && !(await Institution.exists({ _id: input.institutionId })))
      return res.status(400).json({
        error: { code: "INSTITUTION_NOT_FOUND", message: "Choose an existing institution." },
      });
    const nextRole = input.role ?? target.role;
    const nextActive = input.active ?? target.active;
    if (target.role === "ADMIN" && (nextRole !== "ADMIN" || !nextActive)) {
      const otherAdmins = await User.countDocuments({
        role: "ADMIN",
        active: true,
        _id: { $ne: target._id },
      });
      if (otherAdmins === 0)
        return res.status(409).json({
          error: {
            code: "FINAL_ADMIN_REQUIRED",
            message: "The final active administrator cannot be demoted or deactivated.",
          },
        });
    }
    const changes = {};
    for (const field of ["name", "role", "active", "institutionId", "educationLevel"])
      if (
        input[field] !== undefined &&
        String(input[field] ?? "") !== String(target[field] ?? "")
      ) {
        changes[field] = { from: target[field] ?? null, to: input[field] };
        target[field] = input[field];
      }
    if (Object.keys(changes).some((key) => ["role", "active", "institutionId"].includes(key)))
      target.tokenVersion = (target.tokenVersion || 0) + 1;
    await target.save();
    if (Object.keys(changes).length)
      await audit(req, "user.updated", target._id, changes, input.reason);
    res.json({ item: safeUser(target) });
  } catch (error) {
    next(error);
  }
});

router.get("/audit", requirePermission("audit:read"), async (req, res, next) => {
  try {
    const page = z.coerce
      .number()
      .int()
      .min(1)
      .default(1)
      .parse(req.query.page ?? 1);
    const [items, total] = await Promise.all([
      AuditEvent.find()
        .populate("actorId", "name email role")
        .sort({ createdAt: -1 })
        .skip((page - 1) * 50)
        .limit(50)
        .lean(),
      AuditEvent.countDocuments(),
    ]);
    res.json({ items, page, pages: Math.ceil(total / 50), total });
  } catch (error) {
    next(error);
  }
});

function cryptoRandomPassword() {
  return randomBytes(48).toString("base64url");
}

export default router;
