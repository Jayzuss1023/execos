import { and, eq, sql, arrayContains } from "drizzle-orm";
import { db } from "../";
import { integrations, users } from "@/db/schema/schema";
import { getGoogleUserInfo } from "@/lib/google";

export async function getOrCreateUser(
  userId: string,
  email: string,
  name?: string,
) {
  const userById = await getUserByClerkId(userId);

  // Create a new user in the DB if none
  // We have no connected email in DB if no User found
  if (!userById) {
    const [newUser] = await db
      .insert(users)
      .values({
        clerkId: userId,
        connectedAccounts: [email],
        name: name ?? null,
      })
      .returning();

    return newUser;
  }

  // Return if an account with the email exists
  const existing = await getUserByEmail(email);
  if (existing) {
    return existing;
  }

  // Add a new email to existing account
  // Fallback for the previous two
  const [updatedUser] = await db
    .update(users)
    .set({
      connectedAccounts: sql`array_append(${users.connectedAccounts}, ${email})`,
    })
    .where(eq(users.clerkId, userId))
    .returning();

  return updatedUser;
}

export async function getUserByClerkId(clerkId: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1);
  return user ?? null;
}

export async function getUserByEmail(email: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(arrayContains(users.connectedAccounts, [email]))
    .limit(1);
  return user ?? null;
}

export async function getUsersWithAgentEnabled() {
  return db
    .select({ userId: users.id, clerkId: users.clerkId })
    .from(users)
    .innerJoin(integrations, eq(users.id, integrations.userId))
    .where(
      and(eq(users.agentEnabled, true), eq(integrations.provider, "gmail")),
    );
}
