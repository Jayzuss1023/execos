import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getUserIntegrations } from "@/db/queries/integrations";
import { getUserByClerkId } from "@/db/queries/user";
import { auth, currentUser } from "@clerk/nextjs/server";
import { CalendarIcon, MailIcon } from "lucide-react";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0].emailAddress ?? "";
  const name = clerkUser?.fullName ?? "";

  const user = await getUserByClerkId(userId);
  const userIntegrations = await getUserIntegrations(user.id);
  const gmailProvider = userIntegrations.find(
    (integration) => integration.provider === "gmail",
  );

  let googleCalendarIntegration = userIntegrations.find(
    (integration) => integration.provider === "google_calendar",
  );

  const providers = [
    {
      key: "gmail",
      name: "Gmail",
      description: "Read and manage your emails.",
      icon: MailIcon,
      integration: userIntegrations[0],
    },
    {
      key: "google_calendar",
      name: "Google Calendar",
      description: "View and manage your calendar events.",
      icon: CalendarIcon,
      integration: googleCalendarIntegration,
    },
  ];
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-card">Settings</h1>
        <p className="font-semibold text-2xl text-white">
          Manage your integrations and preferences
        </p>
      </div>

      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-black">Integrations</CardTitle>
          <CardDescription className="text-black">
            Connect your accounts to enable AI assistance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {providers.map((provider) => (
            <div
              key={provider.key}
              className="group flex items-center justify-between rounded-xl border border-teal-200 p-5"
            >
              <div className="flex items-center gap-3">
                <provider.icon className="w-5 h-5 text-muted-foreground group-hover:text-teal-200" />
                <div>
                  <p className="font-medium text-black">{provider.name}</p>
                  <p className="text-sm text-black">{provider.description}</p>
                </div>
              </div>
              {provider.integration ? (
                <div>
                  <Badge className="p-3 bg-teal-500/70">Connected</Badge>
                </div>
              ) : (
                <Button
                  asChild
                  className="bg-white text-black group-hover:bg-teal-500/70"
                >
                  <a
                    href={`/api/auth/google?provider=${provider.key}`}
                    className="bg-transparent"
                  >
                    Connect
                  </a>
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
