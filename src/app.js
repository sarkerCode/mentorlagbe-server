
import express from "express";
import cors from "cors";

import { getDB } from "./config/database.js";
import errorHandler from "./middlewares/error-handler.js";
import { env } from "./config/env.js";
import verifyToken from "./middlewares/verify-token.js";
import userRoutes from "./modules/users/user.routes.js";
import tuitionRoutes from "./modules/tuitions/tuition.routes.js";
import applicationRoutes from "./modules/applications/application.routes.js";

const app = express();

// CORS configuration
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);

// Parse JSON request body
app.use(express.json());

// Root API route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to MentorLagbe API",
  });
});

// API health check
app.get("/api/health", async (req, res, next) => {
  try {
    await getDB().command({ ping: 1 });

    res.status(200).json({
      success: true,
      message: "MentorLagbe API is healthy",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

// User routes
app.use("/api/users", userRoutes);

// Tuition routes
app.use("/api/tuitions", tuitionRoutes);

// Application routes
app.use("/api/applications", applicationRoutes);

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global error handler
app.use(errorHandler);

export default app;
