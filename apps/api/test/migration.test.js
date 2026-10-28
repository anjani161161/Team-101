import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import mongoose from "mongoose";
import { migrateLegacyRoles } from "../src/services/role-migration.js";

test(
  "role migration is dry-run by default, preserves identifiers and rejects unknown roles without changes",
  { skip: !process.env.MONGODB_TEST_URI },
  async () => {
    const uri = new URL(process.env.MONGODB_TEST_URI);
    uri.pathname = `/atmoswatch_migrate_${randomUUID().replaceAll("-", "")}`;
    await mongoose.connect(uri.toString());
    try {
      const users = mongoose.connection.collection("users");
      const institutionId = new mongoose.Types.ObjectId();
      const instructorId = new mongoose.Types.ObjectId();
      const adminId = new mongoose.Types.ObjectId();
      await users.insertMany([
        { _id: instructorId, name: "Legacy officer", role: "GOVERNMENT_OFFICER", institutionId },
        { _id: adminId, name: "Legacy admin", role: "platform-admin" },
      ]);
      const dryRun = await migrateLegacyRoles(users);
      assert.equal(dryRun.migrated, false);
      assert.equal((await users.findOne({ _id: instructorId })).role, "GOVERNMENT_OFFICER");
      const result = await migrateLegacyRoles(users, true);
      assert.equal(result.migrated, true);
      const instructor = await users.findOne({ _id: instructorId });
      assert.equal(instructor.role, "INSTRUCTOR");
      assert.equal(instructor.institutionId.toString(), institutionId.toString());
      assert.equal(instructor.active, true);
      assert.equal((await users.findOne({ _id: adminId })).role, "ADMIN");
      await users.insertOne({ _id: new mongoose.Types.ObjectId(), role: "unknown-role" });
      await assert.rejects(migrateLegacyRoles(users, true), /Unknown roles found/);
      assert.equal((await users.findOne({ _id: instructorId })).role, "INSTRUCTOR");
    } finally {
      await mongoose.connection.dropDatabase();
      await mongoose.disconnect();
    }
  }
);
