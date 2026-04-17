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

export async function getLatestAgentRun(userId: string) {
  const [run] = await db
    .select()
    .from(agentRuns)
    .where(eq(agentRuns.userId, userId))
    .orderBy(desc(agentRuns.startedAt))
    .limit(1);
  return run ?? null;
}
