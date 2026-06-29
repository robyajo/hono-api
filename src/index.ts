import { serve } from "@hono/node-server";
import { Hono } from "hono";
import dotenv from "dotenv";

dotenv.config();

const app = new Hono();

const port = Number(process.env.PORT) || 8000;
// Mount routes
const { router } = await import("./routes/index.ts");
app.route("/", router);

serve(
  {
    fetch: app.fetch,
    port: port,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
