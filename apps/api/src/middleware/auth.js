import jwt from "jsonwebtoken";
import { User } from "../models/index.js";
import { roleHasPermission } from "../security/roles.js";

export const COOKIE_NAME = "atmoswatch_session";

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: "strict",
    path: "/",
    maxAge: 1000 * 60 * 60 * 8,
  };
}

export async function requireAuth(req, res, next) {
  let claims;
  try {
    const token = req.cookies?.[COOKIE_NAME];
    if (!token)
      return res
        .status(401)
        .json({ error: { code: "AUTH_REQUIRED", message: "Sign in to access this feature." } });
    claims = jwt.verify(token, process.env.SESSION_SECRET, {
      issuer: "atmoswatch-api",
      audience: "atmoswatch-web",
    });
  } catch {
    return res
      .status(401)
      .json({ error: { code: "SESSION_INVALID", message: "Please sign in again." } });
  }
  try {
    const user = await User.findById(claims.sub).select(
      "name email role institutionId educationLevel active tokenVersion"
    );
    if (!user || !user.active || (claims.ver ?? 0) !== user.tokenVersion)
      return res
        .status(401)
        .json({ error: { code: "SESSION_EXPIRED", message: "Please sign in again." } });
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

export function requireRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role))
      return res.status(403).json({
        error: {
          code: "FORBIDDEN",
          message: "Your account is not allowed to perform this action.",
        },
      });
    next();
  };
}

export function requirePermission(permission) {
  return (req, res, next) => {
    if (!roleHasPermission(req.user?.role, permission))
      return res.status(403).json({
        error: {
          code: "FORBIDDEN",
          message: "Your account is not allowed to perform this action.",
        },
      });
    next();
  };
}

export function requireInstitutionRole(req, res, next) {
  if (!req.user?.institutionId || !["ADMIN", "INSTRUCTOR"].includes(req.user.role)) {
    return res.status(403).json({
      error: {
        code: "INSTITUTION_ACCESS_REQUIRED",
        message: "An approved institution safety role is required.",
      },
    });
  }
  next();
}
