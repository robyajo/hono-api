import { Hono } from "hono";
import { db } from "../db/db.ts";
import { jwt } from "hono/jwt";
import { env } from "../data/env.ts";
import { sValidator } from "@hono/standard-validator";
import z from "zod";
import { generateApiKey } from "../lib/crypto.ts";
import { ApiKeyTable } from "../db/schema.ts";
import { and, eq } from "drizzle-orm";

type JwtEnv = {
  Variables: {
    jwtPayload: { sub: string; email: string; exp: number };
  };
};

const app = new Hono<JwtEnv>();

const createKeySchema = z.object({
  name: z.string().min(1).max(255),
});

// Middleware to verify JWT and extract user ID
app.use(jwt({ secret: env.JWT_SECRET, alg: "HS256" }));

app.get("/", async (c) => {
  const { sub: userId } = c.var.jwtPayload;

  const keys = await db.query.ApiKeyTable.findMany({
    where: { userId },
    columns: {
      id: true,
      name: true,
      keyPrefix: true,
      createdAt: true,
    },
  });

  return c.json(keys);
});

app.post("/", sValidator("json", createKeySchema), async (c) => {
  const { sub: userId } = c.var.jwtPayload;
  const { name } = await c.req.valid("json");
  const { hash, prefix, raw } = generateApiKey();

  const [apiKey] = await db
    .insert(ApiKeyTable)
    .values({ name, userId, keyHash: hash, keyPrefix: prefix })
    .returning({ id: ApiKeyTable.id });

  return c.json({ key: raw, id: apiKey.id }, 201);
});

app.delete("/:id", sValidator("json", createKeySchema), async (c) => {
  const { sub: userId } = c.var.jwtPayload;
  const id = c.req.param("id");
  if (!id) {
    return c.json({ error: "Invalid API key ID" }, 400);
  }
  await db
    .delete(ApiKeyTable)
    .where(and(eq(ApiKeyTable.id, id), eq(ApiKeyTable.userId, userId)));
  return c.json({ message: "API key deleted successfully" }, 200);
});

export default app;
