import { EmailDetail } from "@/components/agents/email-detail";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CardTitle } from "@/components/ui/card";
import { getAgentRuns } from "@/db/queries/agentRuns";

import { getUserByEmail } from "@/db/queries/user";
import { auth, currentUser } from "@clerk/nextjs/server";
import {
  AlertCircleIcon,
  FileTextIcon,
  ListTodoIcon,
  LucideIcon,
  MailIcon,
} from "lucide-react";
import { redirect } from "next/navigation";

interface EmailLoopData {
  label: string;
  value: number;
  icon: LucideIcon;
}

export default async function MonitoringPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0].emailAddress ?? "";
  const name = clerkUser?.fullName ?? "";
  const dbUser = await getUserByEmail(email);
  if (!dbUser) {
    redirect("/settings");
  }

  const runs = await getAgentRuns(dbUser.id);

  const processedEmails = [];

  for (const run of runs) {
    const log = run.actionsLog ?? [];
    for (const entry of log) {
      if (entry.emailId) {
        processedEmails.push({
          ...entry,
          processedAt: run.startedAt,
        });
      }
    }
  }

  const highPriority = processedEmails.filter(
    (email) => email.priority === "high",
  ).length;

  const totalTasks = processedEmails.reduce(
    (acc, email) => acc + (email.tasksCreated ?? 0),
    0,
  );
  const totalDrafts = processedEmails.filter(
    (email) => email.draftCreated,
  ).length;

  const totalProcessed = processedEmails.length;

  const emailData: EmailLoopData[] = [
    {
      label: "Processed",
      value: totalProcessed,
      icon: MailIcon,
    },
    {
      label: "High Priority",
      value: highPriority,
      icon: AlertCircleIcon,
    },
    {
      label: "Drafts Created",
      value: totalDrafts,
      icon: FileTextIcon,
    },
    {
      label: "Tasks Extracted",
      value: totalTasks,
      icon: ListTodoIcon,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-card">Monitoring</h1>
        <p className="font-semibold text-2xl text-white">
          Emails processed by your aI agent with AI Analysis
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {emailData.map((data) => (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
              <CardTitle className="text-sm font-medium">
                {data.label}
              </CardTitle>
              <data.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{data.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="space-y-3">
        {processedEmails.map((email, idx) => (
          <EmailDetail key={`${email.emailId}-${idx}`} email={email} />
        ))}
      </div>
    </div>
  );
}
