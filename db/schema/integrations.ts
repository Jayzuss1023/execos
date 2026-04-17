import { pgTable, uuid, text, timestamp, pgEnum } from "drizzle-orm/pg-core";

import { users } from "./users";

export const integrationProviderEnum = pgEnum("integration_provider", [
  "gmail",
  "google_calendar",
]);

export const integrations = pgTable("integrations", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  provider: integrationProviderEnum("provider").notNull(),
  accessToken: text("access_token").notNull(), // Encrypted
  refreshToken: text("refresh_token").notNull(), // Encrypted
  expiresAt: timestamp("expires_at").notNull(),
  scope: text("scope").array().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
