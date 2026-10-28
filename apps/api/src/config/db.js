import mongoose from "mongoose";

let connectionPromise;

export async function connectDatabase(uri = process.env.MONGODB_URI) {
  if (!uri) throw new Error("MONGODB_URI is required");
  if (mongoose.connection.readyState === 1) return mongoose.connection;

  // Reuse the in-flight connection during concurrent serverless requests.
  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(uri, {
        serverSelectionTimeoutMS: 5000,
        maxPoolSize: 10,
        minPoolSize: 0,
      })
      .then(() => mongoose.connection)
      .catch((error) => {
        // Allow a later request to retry after a transient connection failure.
        connectionPromise = undefined;
        throw error;
      });
  }

  return connectionPromise;
}
