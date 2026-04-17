import { users, subscriptionStatusEnum } from "./users";
import { integrations, integrationProviderEnum } from "./integrations";
import { tasks, taskPriorityEnum, taskStatusEnum } from "./tasks";
import { agentRuns, ActionLogEntry, agentRunStatusEnum } from "./agentRuns";

export {
  users,
  subscriptionStatusEnum,
  agentRuns,
  agentRunStatusEnum,
  tasks,
  taskPriorityEnum,
  taskStatusEnum,
  integrations,
  integrationProviderEnum,
  type ActionLogEntry,
};

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Integration = typeof integrations.$inferSelect;
export type NewIntegration = typeof integrations.$inferInsert;

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;

export type AgentRun = typeof agentRuns.$inferSelect;
export type NewAgentRun = typeof agentRuns.$inferInsert;

export type ProcessedEmail = ActionLogEntry & { processedAt: Date };
