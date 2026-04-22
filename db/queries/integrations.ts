import { and, count, desc, eq } from "drizzle-orm";
import { db } from "../";
import { integrations } from "@/db/schema/schema";
import { GoogleProvider } from "@/lib/google";

export type integrationData = {
  userId: string;
  provider: GoogleProvider;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  scope: string[];
};

export async function getIntegration(userId: string, provider: GoogleProvider) {
  const [integration] = await db
    .select()
    .from(integrations)
    .where(
      and(eq(integrations.userId, userId), eq(integrations.provider, provider)),
    )
    .limit(1);
  return integration ?? null;
}

export async function getUserIntegrations(userId: string) {
  const results = await db
    .select()
    .from(integrations)
    .where(eq(integrations.userId, userId));
  return results ?? [];
}

export async function upsertIntegration(data: integrationData) {
  const existing = await getIntegration(data.userId, data.provider);
  if (existing) {
    await db
      .update(integrations)
      .set({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresAt: data.expiresAt,
        scope: data.scope,
      })
      .where(eq(integrations.id, existing.id));
    return existing;
  }

  const [result] = await db
    .insert(integrations)
    .values(data)
    .returning({ id: integrations.id });

  return result.id;
}
