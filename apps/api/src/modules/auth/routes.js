import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { createHash, randomBytes } from "node:crypto";
import { AuditEvent, User } from "../../models/index.js";
import { COOKIE_NAME, requireAuth, sessionCookieOptions } from "../../middleware/auth.js";

const router = Router();
router.use((_req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});
const credentials = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});
const registrationSchema = z
  .object({
    name: z.string().trim().min(2).max(80),
    email: z.email().max(254),
    password: z.string().min(12).max(128),
    educationLevel: z.enum(["primary", "secondary", "college", "adult"]).default("secondary"),
  })
  .strict();
const loginSchema = z.object({ email: z.email(), password: z.string().min(1).max(128) }).strict();

function issueSession(user, res) {
  const token = jwt.sign(
    { sub: user.id, ver: user.tokenVersion ?? 0 },
    process.env.SESSION_SECRET,
    {
      expiresIn: "8h",
      issuer: "atmoswatch-api",
      audience: "atmoswatch-web",
    }
  );
  res.cookie(COOKIE_NAME, token, sessionCookieOptions());
}

router.post("/register", credentials, async (req, res, next) => {
  try {
    const input = registrationSchema.parse(req.body);
    if (await User.exists({ email: input.email.toLowerCase() }))
      return res.status(409).json({
        error: { code: "EMAIL_IN_USE", message: "An account with this email already exists." },
      });
    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await User.create({
      name: input.name,
      email: input.email,
      passwordHash,
      educationLevel: input.educationLevel,
      role: "STUDENT",
    });
    issueSession(user, res);
    res.status(201).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        educationLevel: user.educationLevel,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post("/login", credentials, async (req, res, next) => {
  try {
    const input = loginSchema.parse(req.body);
    const user = await User.findOne({ email: input.email.toLowerCase() }).select(
      "+passwordHash name email role educationLevel institutionId active tokenVersion"
    );
    if (!user?.active || !(await bcrypt.compare(input.password, user.passwordHash)))
      return res.status(401).json({
        error: { code: "INVALID_CREDENTIALS", message: "Email or password is incorrect." },
      });
    issueSession(user, res);
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        educationLevel: user.educationLevel,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get("/me", requireAuth, (req, res) =>
  res.json({
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      educationLevel: req.user.educationLevel,
      institutionId: req.user.institutionId,
    },
  })
);

router.post("/activate", credentials, async (req, res, next) => {
  try {
    const input = z
      .object({ token: z.string().min(32).max(256), password: z.string().min(12).max(128) })
      .strict()
      .parse(req.body);
    const tokenHash = createHash("sha256").update(input.token).digest("hex");
    const user = await User.findOne({
      activationTokenHash: tokenHash,
      activationExpiresAt: { $gt: new Date() },
    }).select("+activationTokenHash +activationExpiresAt +passwordHash");
    if (!user)
      return res.status(400).json({
        error: {
          code: "ACTIVATION_INVALID",
          message: "This activation link is invalid or expired.",
        },
      });
    user.passwordHash = await bcrypt.hash(input.password, 12);
    user.active = true;
    user.activationTokenHash = undefined;
    user.activationExpiresAt = undefined;
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();
    await AuditEvent.create({
      actorId: user._id,
      targetId: user._id,
      action: "user.activated",
      changes: { active: { from: false, to: true } },
    });
    issueSession(user, res);
    res.set("Cache-Control", "no-store");
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        educationLevel: user.educationLevel,
      },
    });
  } catch (error) {
    next(error);
  }
});

export function createActivationToken() {
  const token = randomBytes(32).toString("base64url");
  return { token, tokenHash: createHash("sha256").update(token).digest("hex") };
}
router.post("/logout", async (req, res, next) => {
  const token = req.cookies?.[COOKIE_NAME];
  if (token) {
    try {
      const claims = jwt.verify(token, process.env.SESSION_SECRET, {
        issuer: "atmoswatch-api",
        audience: "atmoswatch-web",
      });
      await User.updateOne(
        { _id: claims.sub, tokenVersion: claims.ver ?? 0 },
        { $inc: { tokenVersion: 1 } }
      );
    } catch (error) {
      if (error.name !== "JsonWebTokenError" && error.name !== "TokenExpiredError")
        return next(error);
    }
  }
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: "strict",
    path: "/",
  });
  res.set("Cache-Control", "no-store");
  res.status(204).end();
});

export default router;
