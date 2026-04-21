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

type TypeUnreadEmails = {
  emailsProcessed: number;
  draftsCreated: number;
  tasksCreated: number;
};

type PromisedAgent = {
  id: string;
  userId: string;
  status: "running" | "success" | "failed";
  summary: string | null;
  actionsLog: ActionLogEntry[];
  emailsProcessed: number;
  tasksCreated: number;
  draftsCreated: number;
  errorMessage: string | null;
  startedAt: Date;
  completedAt: Date | null;
  durationMs: number | null;
};

type CompletedRun = {
  status: "success" | "failed";
  summary: string;
  actionsLog: ActionLogEntry[];
  emailsProcessed: number;
  tasksCreated: number;
  draftsCreated: number;
  errorMessage?: string;
  durationMs: number;
};

export async function getLatestAgentRun(
  userId: string,
): Promise<PromisedAgent> {
  const [run] = await db
    .select()
    .from(agentRuns)
    .where(eq(agentRuns.userId, userId))
    .orderBy(desc(agentRuns.startedAt))
    .limit(1);
  return run ?? null;
}

export async function getUnreadEmails(
  userId: string,
): Promise<TypeUnreadEmails> {
  const [result] = await db
    .select()
    .from(agentRuns)
    .where(and(eq(agentRuns.userId, userId), eq(agentRuns.status, "success")))
    .orderBy(desc(agentRuns.startedAt))
    .limit(1);
  return {
    emailsProcessed: result?.emailsProcessed ?? 0,
    draftsCreated: result?.draftsCreated ?? 0,
    tasksCreated: result?.tasksCreated ?? 0,
  };
}

export async function createAgentRun(userId: string): Promise<PromisedAgent> {
  const [result] = await db
    .insert(agentRuns)
    .values({ userId, status: "running" })
    .returning();
  return result ?? null;
}

export async function completeAgentRun(agentRunId: string, data: CompletedRun) {
  const [run] = await db
    .update(agentRuns)
    .set({ ...data, completedAt: new Date() })
    .where(eq(agentRuns.id, agentRunId))
    .returning();
  return run;
}
