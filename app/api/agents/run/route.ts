import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getUserByClerkId } from "@/db/queries/user";
import { runAgent } from "@/lib/agent";

export async function POST(request: NextRequest) {
  const cronSecret = request.headers.get("authorization");
  const isCron =
    process.env.CRON_SECRET &&
    cronSecret === `Bearer ${process.env.CRON_SECRET}`;

  if (!isCron) {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
  }

  const results = [];
  // const eligibleUsers = await getUsersWithAgentEnabled()
}
