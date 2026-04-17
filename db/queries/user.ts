import { google } from "googleapis";
import { and, count, desc, eq, sql, arrayContains } from "drizzle-orm";
import { db } from "../";
import {
  ActionLogEntry,
  agentRuns,
  integrations,
  tasks,
  users,
} from "@/db/schema/schema";
import {
  createOAuth2Client,
  getGoogleUserInfo,
  GoogleProvider,
} from "@/lib/google";
import { auth } from "@clerk/nextjs/server";

export async function getOrCreateUser(userId: string, accessToken: string) {
  const userInfo = await getGoogleUserInfo(accessToken);
  const userById = await getUserByClerkId(userId);

  // Create a new user in the DB if none
  // We have no connected email in DB if no User found
  if (!userById) {
    const [newUser] = await db
      .insert(users)
      .values({
        clerkId: userId,
        connectedAccounts: [userInfo.email],
        name: userInfo.name ?? null,
      })
      .returning();

    return newUser;
  }

  // Return if an account with the email exists
  const existing = await getUserByEmail(userInfo.email);
  if (existing) {
    return existing;
  }

  // Add a new email to existing account
  // Fallback for the previous two
  const [updatedUser] = await db
    .update(users)
    .set({
      connectedAccounts: sql`array_append(${users.connectedAccounts}, ${userInfo.email})`,
    })
    .where(eq(users.clerkId, userId))
    .returning();

  console.log("UPDATEDUSER", updatedUser);
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
