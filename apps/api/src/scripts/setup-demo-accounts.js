import "../config/env.js";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { connectDatabase } from "../config/db.js";
import { AuditEvent, Institution, User } from "../models/index.js";

const confirm = process.argv.includes("--confirm");
if (!confirm) {
  throw new Error("No changes made. Run this script with --confirm to create the six demo accounts.");
}

const accounts = [
  { key: "admin", name: "AtmosWatch Demo Admin", email: "demo.admin@atmoswatch.local", role: "ADMIN", educationLevel: "adult" },
  { key: "instructor1", name: "Demo Instructor One", email: "demo.instructor1@atmoswatch.local", role: "INSTRUCTOR", educationLevel: "college" },
  { key: "instructor2", name: "Demo Instructor Two", email: "demo.instructor2@atmoswatch.local", role: "INSTRUCTOR", educationLevel: "college" },
  { key: "student1", name: "Demo Student One", email: "demo.student1@atmoswatch.local", role: "STUDENT", educationLevel: "secondary" },
  { key: "student2", name: "Demo Student Two", email: "demo.student2@atmoswatch.local", role: "STUDENT", educationLevel: "secondary" },
  { key: "student3", name: "Demo Student Three", email: "demo.student3@atmoswatch.local", role: "STUDENT", educationLevel: "secondary" },
];

if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is required.");
await connectDatabase();

const session = await mongoose.startSession();
let credentials;
try {
  session.startTransaction();

  const activeAdmin = await User.findOne({ role: "ADMIN", active: true }).session(session).select("_id email");
  if (activeAdmin) {
    throw new Error("An active administrator already exists. No demo accounts were created; use that administrator to provision accounts.");
  }

  const emails = accounts.map((account) => account.email);
  const duplicates = await User.find({ email: { $in: emails } }).session(session).select("email").lean();
  if (duplicates.length) {
    throw new Error(`Demo account email(s) already exist: ${duplicates.map((item) => item.email).join(", ")}. No accounts were changed.`);
  }

  const passwords = Object.fromEntries(
    accounts.map((account) => [account.key, randomBytes(24).toString("base64url")])
  );
  const adminSpec = accounts[0];
  const admin = await User.create([{
    name: adminSpec.name,
    email: adminSpec.email,
    passwordHash: await bcrypt.hash(passwords.admin, 12),
    role: "ADMIN",
    active: true,
    educationLevel: adminSpec.educationLevel,
    institutionId: null,
    tokenVersion: 0,
  }], { session }).then((rows) => rows[0]);

  let institution = await Institution.findOne({ name: "AtmosWatch Demo School" }).session(session);
  if (!institution) {
    institution = await Institution.create([{
      name: "AtmosWatch Demo School",
      type: "school",
      country: "India",
      state: "Uttar Pradesh",
      district: "Gautam Buddha Nagar",
      city: "Greater Noida",
      createdBy: admin._id,
    }], { session }).then((rows) => rows[0]);
  }

  admin.institutionId = institution._id;
  await admin.save({ session });

  const remaining = accounts.slice(1);
  const documents = await Promise.all(remaining.map(async (account) => ({
    name: account.name,
    email: account.email,
    passwordHash: await bcrypt.hash(passwords[account.key], 12),
    role: account.role,
    active: true,
    educationLevel: account.educationLevel,
    institutionId: institution._id,
    tokenVersion: 0,
  })));
  await User.create(documents, { session });

  await AuditEvent.create([{
    actorId: admin._id,
    targetId: admin._id,
    action: "demo.setup.accounts",
    changes: {
      created: { admin: 1, instructor: 2, student: 3 },
      institution: { name: institution.name, id: String(institution._id) },
    },
    reason: "One-time demo workspace setup",
  }], { session });

  await session.commitTransaction();
  credentials = {
    note: "One-time generated credentials. Save them securely; passwords are stored only as bcrypt hashes and cannot be recovered later.",
    institution: institution.name,
    accounts: accounts.map((account) => ({
      role: account.role,
      name: account.name,
      email: account.email,
      password: passwords[account.key],
    })),
  };
} catch (error) {
  if (session.inTransaction()) await session.abortTransaction();
  throw error;
} finally {
  await session.endSession();
  await mongoose.disconnect();
}

console.log(JSON.stringify(credentials, null, 2));
