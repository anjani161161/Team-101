import { normalizeLegacyRole } from "../security/roles.js";

const roleMap = new Map([
  ["student", "STUDENT"],
  ["educator", "INSTRUCTOR"],
  ["institution-admin", "INSTRUCTOR"],
  ["safety-coordinator", "INSTRUCTOR"],
  ["GOVERNMENT_OFFICER", "INSTRUCTOR"],
  ["platform-admin", "ADMIN"],
]);

export async function migrateLegacyRoles(users, apply = false) {
  const counts = await users
    .aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }])
    .toArray();
  const invalid = counts.filter(({ _id }) => !normalizeLegacyRole(_id));
  if (invalid.length)
    throw new Error(`Unknown roles found; aborting without changes: ${JSON.stringify(invalid)}`);
  if (!apply) return { counts, migrated: false };

  const results = {};
  for (const [oldRole, newRole] of roleMap.entries()) {
    const result = await users.updateMany({ role: oldRole }, { $set: { role: newRole } });
    if (result.modifiedCount) results[oldRole] = result.modifiedCount;
  }
  await users.updateMany({ active: { $exists: false } }, { $set: { active: true } });
  await users.updateMany({ tokenVersion: { $exists: false } }, { $set: { tokenVersion: 0 } });
  return { counts, migrated: true, results };
}
