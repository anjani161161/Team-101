import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const databases = [
  "mongodb://127.0.0.1:27017/atmoswatch_dev",
  "mongodb://127.0.0.1:27017/atmoswatch_local_20261027",
];

async function seed() {
  const adminHash = await bcrypt.hash("@Anjani161161", 12);
  const instructorHash = await bcrypt.hash("Instructor@123456", 12);
  const studentHash = await bcrypt.hash("Student@123456", 12);

  for (const uri of databases) {
    try {
      console.log(`Connecting to ${uri}...`);
      const conn = await mongoose.createConnection(uri).asPromise();
      const users = conn.collection("users");
      const institutions = conn.collection("institutions");

      // Ensure demo institution exists
      let institution = await institutions.findOne({ name: "AtmosWatch Demonstration Academy" });
      if (!institution) {
        const dummyAdminId = new mongoose.Types.ObjectId();
        const instResult = await institutions.insertOne({
          name: "AtmosWatch Demonstration Academy",
          type: "college",
          country: "India",
          city: "New Delhi",
          state: "Delhi",
          createdBy: dummyAdminId,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        institution = { _id: instResult.insertedId };
      }

      // Upsert Admin
      await users.updateOne(
        { email: "anjanisingh161161@gmail.com" },
        {
          $set: {
            name: "Anjani Singh",
            email: "anjanisingh161161@gmail.com",
            passwordHash: adminHash,
            role: "ADMIN",
            active: true,
            educationLevel: "college",
            institutionId: institution._id,
            tokenVersion: 1,
            updatedAt: new Date(),
          },
          $setOnInsert: {
            createdAt: new Date(),
          },
        },
        { upsert: true }
      );

      // Upsert Instructor
      await users.updateOne(
        { email: "instructor@atmoswatch.local" },
        {
          $set: {
            name: "Instructor Account",
            email: "instructor@atmoswatch.local",
            passwordHash: instructorHash,
            role: "INSTRUCTOR",
            active: true,
            educationLevel: "adult",
            institutionId: institution._id,
            tokenVersion: 1,
            updatedAt: new Date(),
          },
          $setOnInsert: {
            createdAt: new Date(),
          },
        },
        { upsert: true }
      );

      // Upsert Student
      await users.updateOne(
        { email: "student@atmoswatch.local" },
        {
          $set: {
            name: "Student Account",
            email: "student@atmoswatch.local",
            passwordHash: studentHash,
            role: "STUDENT",
            active: true,
            educationLevel: "college",
            tokenVersion: 1,
            updatedAt: new Date(),
          },
          $setOnInsert: {
            createdAt: new Date(),
          },
        },
        { upsert: true }
      );

      const all = await users.find({}).toArray();
      console.log(
        `Seeded ${uri}. Users:`,
        all.map((u) => ({ email: u.email, role: u.role, active: u.active }))
      );
      await conn.close();
    } catch (err) {
      console.error(`Error with ${uri}:`, err.message);
    }
  }
}

seed()
  .then(() => {
    console.log("Seeding complete!");
    process.exit(0);
  })
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  });
