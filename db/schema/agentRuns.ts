import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";

import { users } from "./users";

export const agentRunStatusEnum = pgEnum("agent_run_status", [
  "running",
  "success",
  "failed",
]);

export interface ActionLogEntry {
  emailId: string;
  subject: string;
  from: string;
  date: string;
  status: "success" | "error";
  summary?: string;
  priority?: string;
  category?: string;
  needsReply?: boolean;
  draftReply?: string | null;
  actionItems?: {
    title: string;
    description: string;
    dueDate: string | null;
  }[];
  tasksCreated?: number;
  draftCreated?: boolean;
  eventsCreated?: number;
  error?: string;
}

// Agent runs table (execution history)
export const agentRuns = pgTable("agent_runs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  status: agentRunStatusEnum("status").default("running").notNull(),
  summary: text("summary"),
  actionsLog: jsonb("actions_log")
    .$type<ActionLogEntry[]>()
    .default([])
    .notNull(),
  emailsProcessed: integer("emails_processed").default(0).notNull(),
  tasksCreated: integer("tasks_created").default(0).notNull(),
  draftsCreated: integer("drafts_created").default(0).notNull(),
  errorMessage: text("error_message"),
  startedAt: timestamp("stated_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  durationMs: integer("duration_ms"),
});
