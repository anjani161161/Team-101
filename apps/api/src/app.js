import "./config/env.js";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./modules/auth/routes.js";
import learningRoutes from "./modules/learning/routes.js";
import quizRoutes from "./modules/learning/quizzes.js";
import simulationRoutes from "./modules/simulations/routes.js";
import preparednessRoutes from "./modules/preparedness/routes.js";
import hazardRoutes from "./modules/hazards/routes.js";
import weatherRoutes from "./modules/weather/routes.js";
import resourceRoutes from "./modules/resources/routes.js";
import userRoutes from "./modules/users/routes.js";
import publicDisasterUpdatesRoutes from "./modules/public/disaster-updates.js";
import mongoose from "mongoose";
import { rateLimit, ipKeyGenerator } from "express-rate-limit";
import { isAllowedOrigin } from "./security/origins.js";
import { connectDatabase } from "./config/db.js";

const app = express();
app.disable("x-powered-by");
// Vercel runs the API behind its trusted reverse proxy.
app.set("trust proxy", 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(
  cors({
    origin(origin, callback) {
      callback(null, !origin || isAllowedOrigin(origin));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  })
);
app.use(express.json({ limit: "32kb" }));
app.use(cookieParser());

// Normalize common API prefixes in case a deployment rewrite or function mount
// strips the leading /api or /api/v1 segment. Keep existing full paths unchanged.
app.use((req, _res, next) => {
  const queryIndex = req.url.indexOf("?");
  const pathname = queryIndex === -1 ? req.url : req.url.slice(0, queryIndex);
  const query = queryIndex === -1 ? "" : req.url.slice(queryIndex);

  let normalizedPath = pathname;
  if (pathname === "/health") {
    normalizedPath = "/api/v1/health";
  } else if (pathname.startsWith("/v1/")) {
    normalizedPath = `/api${pathname}`;
  } else if (
    /^\/(auth|users|learning|simulations|preparedness|hazards|weather|resources|public)(\/|$)/.test(pathname)
  ) {
    normalizedPath = `/api/v1${pathname}`;
  }

  if (normalizedPath !== pathname) req.url = `${normalizedPath}${query}`;
  next();
});

// Make the API self-sufficient when Vercel loads app.js directly instead of
// executing the local server.js bootstrap. Await MongoDB before DB-backed routes.
const databaseRoutePrefixes = [
  "/api/v1/auth",
  "/api/v1/users",
  "/api/v1/learning",
  "/api/v1/preparedness",
  "/api/v1/simulations",
];

app.use(async (req, res, next) => {
  const path = req.path;
  const isHealthCheck = path === "/api/v1/health";
  const needsDatabase =
    isHealthCheck ||
    databaseRoutePrefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));

  if (!needsDatabase) return next();

  try {
    await connectDatabase();
    return next();
  } catch (error) {
    console.error(`AtmosWatch database connection failed (${error.name}): ${error.message}`);
    if (isHealthCheck) return next();
    return next(error);
  }
});

const providerLimit = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  keyGenerator: (req) => ipKeyGenerator(req.ip),
  standardHeaders: "draft-8",
  legacyHeaders: false,
});
app.use((req, res, next) => {
  if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    const origin = req.get("origin");
    if (!origin)
      return res.status(403).json({
        error: { code: "ORIGIN_REQUIRED", message: "A trusted request origin is required." },
      });
    if (!isAllowedOrigin(origin))
      return res
        .status(403)
        .json({ error: { code: "ORIGIN_REJECTED", message: "Request origin is not allowed." } });
  }
  next();
});

const healthHandler = (_req, res) =>
  res.status(200).json({
    status: "ok",
    database: mongoose.connection.readyState === 1 ? "connected" : "unavailable",
    time: new Date().toISOString(),
  });

// Support the canonical health path plus common paths used by hosting rewrites.
app.get(["/", "/health", "/api/health", "/v1/health", "/api/v1/health"], healthHandler);

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/learning", learningRoutes);
app.use("/api/v1/learning/quizzes", quizRoutes);
app.use("/api/v1/simulations", simulationRoutes);
app.use("/api/v1/preparedness", preparednessRoutes);
app.use("/api/v1/hazards", providerLimit, hazardRoutes);
app.use("/api/v1/weather", providerLimit, weatherRoutes);
app.use("/api/v1/resources", resourceRoutes);
app.use("/api/v1/public", publicDisasterUpdatesRoutes);
app.use((_req, res) =>
  res
    .status(404)
    .json({ error: { code: "NOT_FOUND", message: "The requested resource was not found." } })
);
app.use((error, _req, res, _next) => {
  if (error.name === "ZodError")
    return res.status(400).json({
      error: { code: "VALIDATION_ERROR", message: "Check the submitted fields and try again." },
    });
  if (
    [
      "MongoServerSelectionError",
      "MongoNetworkError",
      "MongooseError",
      "MongoNotConnectedError",
    ].includes(error.name)
  )
    return res.status(503).json({
      error: {
        code: "DATABASE_UNAVAILABLE",
        message: "Persistent services are temporarily unavailable.",
      },
    });
  if (error.code === 11000)
    return res
      .status(409)
      .json({ error: { code: "DUPLICATE_RECORD", message: "This record already exists." } });
  res.status(error.status || 500).json({
    error: {
      code: error.code || "INTERNAL_ERROR",
      message: error.status ? error.message : "Something went wrong. Please try again.",
    },
  });
});

export default app;
