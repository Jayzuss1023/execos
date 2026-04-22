import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getUserByClerkId, getUsersWithAgentEnabled } from "@/db/queries/user";
import { runAgent } from "@/lib/agent";

export async function POST(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const dbUser = await getUserByClerkId(userId);

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!dbUser.agentEnabled) {
      return NextResponse.json(
        { error: "Agent is not enabled" },
        { status: 403 },
      );
    }

    // runAgent
    const result = await runAgent(dbUser.id);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error running agent: ", error);
    const errorMessage =
      error instanceof Error ? error.message : "Error running agent";
    return {
      errorMessage,
      processedCount: 0,
    };
  }
}
