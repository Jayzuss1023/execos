// import { RunAgentButton } from "@/components/agents/run-agent-button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
// import {
//   getLatestAgentRun,
//   getOrCreateUser,
//   getUnreadEmails,
//   getUserIntegrations,
// } from "@/db/queries";
import { getLatestAgentRun } from "@/db/queries/agentRuns";
import { getUserIntegrations } from "@/db/queries/integrations";
import { getUserByClerkId } from "@/db/queries/user";
import { auth, currentUser } from "@clerk/nextjs/server";
import { BadgeIcon, CheckCircle2Icon, CircleIcon, ZapIcon } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { userId, has } = await auth();
  const isPaidUser = has({ plan: "pro_plan" });

  if (!userId) {
    redirect("/sign-in");
  }

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0].emailAddress ?? "";
  const name = clerkUser?.fullName ?? "";

  const dbUser = await getUserByClerkId(userId);
  const latestRun = await getLatestAgentRun(dbUser.id);
  const userIntegrations = await getUserIntegrations(dbUser.id);
  const gmailConnected = userIntegrations.some(
    (integration) => integration.provider === "gmail",
  );
  const calendarConnected = userIntegrations.some(
    (integration) => integration.provider === "google_calendar",
  );

  const onboardingSteps = [
    {
      name: "Connected Gmail",
      completed: gmailConnected,
      href: "/settings",
    },
    {
      name: "Connected Google Calendar",
      completed: calendarConnected,
      href: "/settings",
    },
    {
      name: "Subscribe to activate agent",
      completed: isPaidUser,
      href: "/settings",
    },
  ];

  const agentDetails = [
    {
      label: "Time",
      value: latestRun?.startedAt
        ? new Date(latestRun.startedAt).toLocaleString()
        : "N/A",
    },
    {
      label: "Status",
      value: latestRun?.status || "N/A",
    },
    {
      label: "Summary",
      value: latestRun?.summary || "N/A",
    },
  ];

  const completedCount = onboardingSteps.filter(
    (step) => step.completed,
  ).length;
  const progressPercentage = Math.round(
    (completedCount / onboardingSteps.length) * 100,
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-card">Dashboard</h1>
        <p className="font-semibold text-2xl text-white">
          Welcome back! Here's what's happening with your AI Agents.
        </p>
      </div>

      <div className="space-y-4">
        {!dbUser.onboardingCompleted && (
          <Card>
            <CardHeader>
              <CardTitle>Get Started</CardTitle>
              <CardDescription>
                Complete these steps to activate your AI assistant
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {onboardingSteps.map((step, index) => (
                  <Link key={step.name} href={step.href}>
                    <div className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-muted">
                      {step.completed ? (
                        <CheckCircle2Icon className="w-5 h-5" />
                      ) : (
                        <CircleIcon className="h-5 w-5" />
                      )}
                      <span
                        className={
                          step.completed
                            ? "text-muted-foreground line-through"
                            : ""
                        }
                      >
                        {index + 1} • {step.name}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
              {/* <Progress
                value={progressPercentage}
                className="onboarding-progress"
                /> */}
              <p className="text-sm text-muted-foreground">
                {completedCount} of {onboardingSteps.length} steps completed
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ZapIcon className="h-5 w-5" />
                Agent Status
              </CardTitle>
              <CardDescription>
                Subscribe to activate the autonomous agent
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">Status</span>
                  <Badge variant="default" className="bg-teal-500/70">
                    Ready
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm tex-muted-foreground">Gmail</span>
                  <span className="text-sm font-medium">Connected</span>
                </div>
                {/* <RunAgentButton/> */}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Last Agent Run</CardTitle>
              <CardDescription>
                {latestRun ? "Most Recent Activity" : "No runs yet"}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div>
                {agentDetails.map((d) => (
                  <div key={d.label}>
                    <span>{d.label}</span>
                    <span>{d.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Quick Stats */}
      </div>
    </div>
  );
}
