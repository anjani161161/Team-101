import "../config/env.js";
import mongoose from "mongoose";
import { migrateLegacyRoles } from "../services/role-migration.js";

if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is required.");
await mongoose.connect(process.env.MONGODB_URI);
try {
  const users = mongoose.connection.collection("users");
  const result = await migrateLegacyRoles(users, process.argv.includes("--apply"));
  console.log("Current role counts:", JSON.stringify(result.counts));
  if (!result.migrated)
    console.log(
      "Dry run only. Review counts, then rerun with --apply to update role fields in place."
    );
  else
    console.log(
      "Role migration applied in place:",
      JSON.stringify(result.results),
      "IDs and references preserved."
    );
} finally {
  await mongoose.disconnect();
}
