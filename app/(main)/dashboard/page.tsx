import { RunAgentButton } from "@/components/agents/run-agent-button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

import { getLatestAgentRun, getUnreadEmails } from "@/db/queries/agentRuns";
import { getUserIntegrations } from "@/db/queries/integrations";
import { getOrCreateUser, getUserByClerkId } from "@/db/queries/user";
import { auth, currentUser } from "@clerk/nextjs/server";
import { CheckCircle2Icon, CircleIcon, ZapIcon } from "lucide-react";
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
  const user = await getOrCreateUser(userId, email, name);

  const latestRun = await getLatestAgentRun(user.id);
  const userIntegrations = await getUserIntegrations(user.id);
  const gmailConnected = userIntegrations.some(
    (integration) => integration.provider === "gmail",
  );
  const calendarConnected = userIntegrations.some(
    (integration) => integration.provider === "google_calendar",
  );

  const { emailsProcessed, draftsCreated, tasksCreated } =
    await getUnreadEmails(user.id);

  const emailData = [
    {
      label: "Unread Emails",
      value: emailsProcessed,
    },
    {
      label: "Drafts Created",
      value: draftsCreated,
    },
    {
      label: "Tasks Created",
      value: tasksCreated,
    },
  ];

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
        {!user.onboardingCompleted && (
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
              <Progress
                value={progressPercentage}
                className="mt-4 !bg-secondary/80"
              />
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
                  <span className="text-sm text-muted-foreground">Gmail</span>
                  <span className="text-sm font-medium">Connected</span>
                </div>
                <RunAgentButton />
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
              <div className="space-y-3">
                {agentDetails.map((d) => (
                  <div
                    key={d.label}
                    className="flex items-center justify-between gap-4"
                  >
                    <span className="text-sm text-muted-foreground">
                      {d.label}
                    </span>
                    <span className="text-sm font-medium">{d.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Quick Stats */}
        <div className="grid gap-6 md:grid-cols-3">
          {emailData.map((edata) => (
            <Card key={edata.label}>
              <CardHeader className="items-center pb-2">
                <CardTitle className="text-md font-medium">
                  {edata.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm font-medium">{edata.value}</div>
                <p className="text-xs text-muted-foreground mt-2">
                  {edata.value === 0 ? "No Items" : "View All"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
