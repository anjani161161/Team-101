import "../config/env.js";
import mongoose from "mongoose";
import { User, AuditEvent } from "../models/index.js";

const email = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase();
if (!email || !process.argv.includes("--confirm"))
  throw new Error("Set ADMIN_BOOTSTRAP_EMAIL to an existing account and pass --confirm.");
if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is required.");
await mongoose.connect(process.env.MONGODB_URI);
try {
  if (await User.exists({ role: "ADMIN", active: true }))
    throw new Error("An active administrator already exists; refusing bootstrap promotion.");
  const target = await User.findOne({ email, active: true });
  if (!target) throw new Error("No active account exists for ADMIN_BOOTSTRAP_EMAIL.");
  const previousRole = target.role;
  target.role = "ADMIN";
  target.tokenVersion = (target.tokenVersion || 0) + 1;
  await target.save();
  await AuditEvent.create({
    actorId: target._id,
    targetId: target._id,
    action: "admin.bootstrap",
    changes: { role: { from: previousRole, to: "ADMIN" } },
  });
  console.log(
    `Promoted ${target.email} to ADMIN. Existing account and related records were preserved.`
  );
} finally {
  await mongoose.disconnect();
}
