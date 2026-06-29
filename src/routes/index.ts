import { Hono } from "hono";
import authorRoutes from "./author.ts";

const router = new Hono();

router.route("/authors", authorRoutes);

// Health check
router.get("/", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

export { router };
