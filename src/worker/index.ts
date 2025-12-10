import { zValidator } from "@hono/zod-validator";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import { z } from "zod";
import { task, taskStatusEnum, taskPriorityEnum, tag, taskTag } from "./db/schema";
import { getAuth } from "./lib/auth";
import { getAuthUser } from "./lib/get-auth-user";

const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.enum(taskStatusEnum).optional().default("todo"),
  priority: z.enum(taskPriorityEnum).optional().default("medium"),
  tags: z.array(z.string()).optional(),
});

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(taskStatusEnum).optional(),
  priority: z.enum(taskPriorityEnum).optional(),
  tags: z.array(z.string()).optional(),
});

const app = new Hono<{ Bindings: Env }>();

app.get("/api/", (c) => c.json({ name: "Cloudflare" }));

app.on(["POST", "GET"], "/api/auth/*", (c) => {
  const auth = getAuth(c.env);
  return auth.handler(c.req.raw);
});

app.get("/api/me", async (c) => {
  const auth = getAuth(c.env);
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  return c.json({ user: session.user });
});

app.get("/api/tasks", async (c) => {
  const user = await getAuthUser(c);
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const db = drizzle(c.env.DB);
  const tagFilter = c.req.query("tag");
  let tasks;
  if (tagFilter) {
    const rows = await db
      .select()
      .from(task)
      .innerJoin(taskTag, eq(task.id, taskTag.taskId))
      .where(and(eq(task.userId, user.id), eq(taskTag.tagId, tagFilter)));
    // rows may be tuples depending on drizzle version; map to first element if needed
    tasks = rows.map((r: any) => (Array.isArray(r) ? r[0] : r));
  } else {
    tasks = await db.select().from(task).where(eq(task.userId, user.id));
  }

  const tasksWithTags = await Promise.all(
    tasks.map(async (t: any) => {
      const tagRows = await db
        .select()
        .from(taskTag)
        .innerJoin(tag, eq(taskTag.tagId, tag.id))
        .where(eq(taskTag.taskId, t.id));
      const tagsForTask = tagRows.map((r: any) => {
        const joinedTag = Array.isArray(r) ? r[1] : r;
        return { id: joinedTag.id, name: joinedTag.name };
      });
      return { ...t, tags: tagsForTask };
    })
  );

  return c.json({ tasks: tasksWithTags });
});

app.get("/api/tasks/:id", async (c) => {
  const user = await getAuthUser(c);
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const taskId = c.req.param("id");
  const db = drizzle(c.env.DB);

  const [foundTask] = await db
    .select()
    .from(task)
    .where(and(eq(task.id, taskId), eq(task.userId, user.id)));

  if (!foundTask) {
    return c.json({ error: "Task not found" }, 404);
  }

  return c.json({ task: foundTask });
});

app.post("/api/tasks", zValidator("json", createTaskSchema), async (c) => {
  const user = await getAuthUser(c);
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const body = c.req.valid("json");

  const db = drizzle(c.env.DB);
  const now = new Date();
  const newTask = {
    id: crypto.randomUUID(),
    title: body.title,
    description: body.description ?? null,
    status: body.status,
    priority: body.priority,
    userId: user.id,
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(task).values(newTask);
  if (body.tags && Array.isArray(body.tags) && body.tags.length) {
    for (const tagId of body.tags) {
      await db.insert(taskTag).values({ taskId: newTask.id, tagId });
    }
  }

  // fetch attached tags for response
  const tagRows = await db
    .select()
    .from(taskTag)
    .innerJoin(tag, eq(taskTag.tagId, tag.id))
    .where(eq(taskTag.taskId, newTask.id));
  const tagsForTask = tagRows.map((r: any) => {
    const joinedTag = Array.isArray(r) ? r[1] : r;
    return { id: joinedTag.id, name: joinedTag.name };
  });

  return c.json({ task: { ...newTask, tags: tagsForTask } }, 201);
});

app.patch("/api/tasks/:id", zValidator("json", updateTaskSchema), async (c) => {
  const user = await getAuthUser(c);
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const taskId = c.req.param("id");
  const db = drizzle(c.env.DB);

  const [existingTask] = await db
    .select()
    .from(task)
    .where(and(eq(task.id, taskId), eq(task.userId, user.id)));

  if (!existingTask) {
    return c.json({ error: "Task not found" }, 404);
  }

  const body = c.req.valid("json");

  const updateData: Partial<typeof existingTask> = {
    updatedAt: new Date(),
  };

  if (body.title !== undefined) updateData.title = body.title;
  if (body.description !== undefined) updateData.description = body.description;
  if (body.status !== undefined) updateData.status = body.status;
  if (body.priority !== undefined) updateData.priority = body.priority;

  await db.update(task).set(updateData).where(eq(task.id, taskId));
  if (body.tags) {
    await db.delete(taskTag).where(eq(taskTag.taskId, taskId));
    for (const tagId of body.tags) {
      await db.insert(taskTag).values({ taskId, tagId });
    }
  }

  const [updatedTask] = await db.select().from(task).where(eq(task.id, taskId));

  const tagRows = await db
    .select()
    .from(taskTag)
    .innerJoin(tag, eq(taskTag.tagId, tag.id))
    .where(eq(taskTag.taskId, taskId));
  const tagsForTask = tagRows.map((r: any) => {
    const joinedTag = Array.isArray(r) ? r[1] : r;
    return { id: joinedTag.id, name: joinedTag.name };
  });

  return c.json({ task: { ...updatedTask, tags: tagsForTask } });
});

// Tags endpoints
app.get("/api/tags", async (c) => {
  const user = await getAuthUser(c);
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  const db = drizzle(c.env.DB);
  const tags = await db.select().from(tag).where(eq(tag.userId, user.id));
  return c.json({ tags });
});

app.post(
  "/api/tags",
  zValidator(
    "json",
    z.object({
      name: z.string().min(1),
    })
  ),
  async (c) => {
    const user = await getAuthUser(c);
    if (!user) return c.json({ error: "Unauthorized" }, 401);
    const body = c.req.valid("json");
    const db = drizzle(c.env.DB);
    const now = new Date();
    const newTag = { id: crypto.randomUUID(), name: body.name, userId: user.id, createdAt: now };
    await db.insert(tag).values(newTag);
    return c.json({ tag: newTag }, 201);
  }
);

app.delete("/api/tasks/:id", async (c) => {
  const user = await getAuthUser(c);
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const taskId = c.req.param("id");
  const db = drizzle(c.env.DB);

  const [existingTask] = await db
    .select()
    .from(task)
    .where(and(eq(task.id, taskId), eq(task.userId, user.id)));

  if (!existingTask) {
    return c.json({ error: "Task not found" }, 404);
  }

  await db.delete(task).where(eq(task.id, taskId));

  return c.json({ message: "Task deleted successfully" });
});

export default app;
