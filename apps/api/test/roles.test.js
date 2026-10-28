import test from "node:test";
import assert from "node:assert/strict";
import { normalizeLegacyRole, roleHasPermission, ROLES } from "../src/security/roles.js";

test("legacy roles map to least-privileged compatible roles without losing platform admins", () => {
  assert.equal(normalizeLegacyRole("GOVERNMENT_OFFICER"), ROLES.INSTRUCTOR);
  assert.equal(normalizeLegacyRole("institution-admin"), ROLES.INSTRUCTOR);
  assert.equal(normalizeLegacyRole("platform-admin"), ROLES.ADMIN);
  assert.equal(normalizeLegacyRole("unknown"), null);
});

test("permission matrix keeps audit and platform administration exclusive to admins", () => {
  assert.equal(roleHasPermission(ROLES.INSTRUCTOR, "users:create-student"), true);
  assert.equal(roleHasPermission(ROLES.INSTRUCTOR, "users:administer"), false);
  assert.equal(roleHasPermission(ROLES.STUDENT, "users:manage"), false);
  assert.equal(roleHasPermission(ROLES.ADMIN, "audit:read"), true);
});
