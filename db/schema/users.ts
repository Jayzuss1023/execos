import { sql } from "drizzle-orm";
import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "none",
  "active",
  "cancelled",
  "past_due",
]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  clerkId: text("clerk_id").notNull().unique(),
  name: text("name"),
  subscriptionStatus: subscriptionStatusEnum("subscription_status")
    .default("none")
    .notNull(),
  subscriptionId: text("subscription_id"),
  connectedAccounts: text("connected_accounts")
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`),
  agentEnabled: boolean("agent_enabled").default(true).notNull(),
  onboardingCompleted: boolean("onboarding_completed").default(false).notNull(),
  preferences: jsonb("preferences").default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
