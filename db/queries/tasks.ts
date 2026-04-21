import { and, count, desc, eq } from "drizzle-orm";
import { db } from "../";
import {
  ActionLogEntry,
  agentRuns,
  integrations,
  tasks,
  users,
} from "../schema/schema";
import { GoogleProvider } from "@/lib/google";

type NewTask = {
  userId: string;
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high";
  dueDate?: Date | null;
  createdByAgent?: boolean;
};

export async function createTask(data: NewTask) {
  const [task] = await db
    .insert(tasks)
    .values({
      userId: data.userId,
      title: data.title,
      description: data.description ?? null,
      priority: data.priority ?? "medium",
      dueDate: data.dueDate ?? null,
      createdByAgent: data.createdByAgent ?? false,
    })
    .returning();
  return task;
}
