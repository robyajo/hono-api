import { sValidator } from "@hono/standard-validator";
import { Hono } from "hono";
import z from "zod";
import { db } from "../db/db.ts";
import { AuthorsTable } from "../db/schema.ts";
import { eq } from "drizzle-orm/sql/expressions/conditions";

const app = new Hono();

const crateAuthorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  birthdary: z.coerce.date().optional(),
});
const updateAuthorSchema = z.object({
  name: z.string().optional(),
  birthdary: z.coerce.date().nullable().optional(),
});

type Author = {
  id: string;
  name: string;
  birthdary?: Date | null;
};

const authors: Author[] = [
  { id: "1", name: "Author 1", birthdary: new Date("1990-01-01") },
  { id: "2", name: "Author 2", birthdary: new Date("1992-05-15") },
  { id: "3", name: "Author 3", birthdary: new Date("1988-12-10") },
];

// Get all authors
app.get("/", async (c) => {
  const author = await db.query.AuthorsTable.findMany();
  return c.json(author);
});

// Get author by ID
app.get("/:id", async (c) => {
  const id = c.req.param("id");
  const author = await db.query.AuthorsTable.findFirst({
    where: { id },
  });
  if (!author) {
    return c.json({ error: "Author not found" }, 404);
  }

  return c.json(author);
});

// Create a new author
app.post("/", sValidator("json", crateAuthorSchema), async (c) => {
  const data = c.req.valid("json");

  const [author] = await db.insert(AuthorsTable).values(data).returning();
  return c.json(author, 201);
});

// Update an existing author
app.put("/:id", sValidator("json", updateAuthorSchema), async (c) => {
  const id = c.req.param("id");
  const data = c.req.valid("json");
  const [author] = await db
    .update(AuthorsTable)
    .set(data)
    .where(eq(AuthorsTable.id, id))
    .returning();
  if (author == null) {
    return c.json({ error: "Author not found" }, 404);
  }
  return c.json(author);
});

// Delete an existing author
app.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const author = await db.query.AuthorsTable.findFirst({
    where: { id },
  });
  if (!author) {
    return c.json({ error: "Author not found" }, 404);
  }

  await db.delete(AuthorsTable).where(eq(AuthorsTable.id, id));
  return c.json({ message: "Author deleted successfully" }, 200);
});
export default app;
