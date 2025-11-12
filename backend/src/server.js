import express from "express";
import path from "path";
import cors from "cors";
import { serve } from "inngest/express";
import { clerkMiddleware } from "@clerk/express";
import { fileURLToPath } from "url";

import { ENV } from "./lib/env.js";
import { connectDB } from "./lib/db.js";
import { inngest, functions } from "./lib/inngest.js";

import chatRoutes from "./routes/chatRoutes.js";
import sessionRoutes from "./routes/sessionRoute.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// middleware
app.use(express.json());
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true }));
app.use(clerkMiddleware());

// API routes
app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/chat", chatRoutes);
app.use("/api/sessions", sessionRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ msg: "api is up and running" });
});

console.log("NODE_ENV is:", ENV.NODE_ENV);

// Serve frontend in production
if (ENV.NODE_ENV === "production") {
  const frontendPath = path.resolve(__dirname, "../../frontend/dist");
  console.log("📦 Serving frontend from:", frontendPath);

  app.use(express.static(frontendPath));

  app.get("/.*/", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

const startServer = async () => {
  try {
    await connectDB();
    app.listen(ENV.PORT || 10000, "0.0.0.0", () =>
      console.log(`🚀 Server running on port ${ENV.PORT || 3000}`)
    );
  } catch (error) {
    console.error("💥 Error starting the server", error);
  }
};

startServer();
