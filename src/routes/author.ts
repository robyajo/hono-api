import { sValidator } from "@hono/standard-validator";
import { Hono } from "hono";
import z from "zod";

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
app.get("/", (c) => {
  return c.json(authors);
});

// Get author by ID
app.get("/:id", (c) => {
  const id = c.req.param("id");
  const author = authors.find((a) => a.id === id);
  if (!author) {
    return c.json({ error: "Author not found" }, 404);
  }

  return c.json(author);
});

// Create a new author
app.post("/", sValidator("json", crateAuthorSchema), (c) => {
  const data = c.req.valid("json");
  const author = {
    id: crypto.randomUUID(),
    ...data,
  };
  authors.push(author as Author);
  return c.json(author, 201);
});

// Update an existing author
app.put("/:id", sValidator("json", updateAuthorSchema), (c) => {
  const id = c.req.param("id");
  const data = c.req.valid("json");
  const author = authors.find((a) => a.id === id);

  if (author == null) {
    return c.json({ error: "Author not found" }, 404);
  }
  if (data.name !== undefined) {
    author.name = data.name;
  }
  if (data.birthdary !== undefined) {
    author.birthdary = data.birthdary;
  }
  return c.json(author);
});

// Delete an existing author
app.delete("/:id", (c) => {
  const id = c.req.param("id");
  const author = authors.findIndex((a) => a.id === id);

  if (author == null) {
    return c.json({ error: "Author not found" }, 404);
  }
  authors.splice(author, 1);
  return c.json({ message: "Author deleted successfully" }, 200);
});
export default app;
