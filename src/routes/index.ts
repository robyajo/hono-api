import { Hono } from "hono";
import authorRoutes from "./author.ts";
import authRoutes from "./auth.ts";
import apiKeyRoutes from "./apiKey.ts";

const router = new Hono();

router.route("/authors", authorRoutes);
router.route("/auth", authRoutes);
router.route("/api-keys", apiKeyRoutes);
// Health check
router.get("/", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

export { router };
