import "dotenv/config";
import mongoose from "mongoose";
import { connectDatabase } from "../config/db.js";
import { Checklist, Institution, User } from "../models/index.js";

await connectDatabase();
console.log(
  "No privileged accounts or fictitious institution records are created by the seed command."
);
console.log(
  "Curriculum and simulations are curated, non-personal educational content served from the API."
);
await Promise.all([Checklist.init(), Institution.init(), User.init()]);
await mongoose.disconnect();
