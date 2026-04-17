import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
// import { getOrCreateUser } from "@/db/queries";
import { UserButton } from "@clerk/nextjs";
import { auth, currentUser } from "@clerk/nextjs/server";
import { HomeIcon, MailIcon, SettingsIcon, ZapIcon } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: HomeIcon,
  },
  {
    label: "Monitoring",
    href: "/monitoring",
    icon: MailIcon,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: SettingsIcon,
  },
];

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if user is authenticated
  const { userId, has } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  // Show children if authenticated
  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0].emailAddress ?? "";
  const name = clerkUser?.fullName ?? "";

  // Get the user from db or create the user in the db

  const isPaidUser = has({ plan: "pro_plan" });

  return (
    <div className="flex h-screen bg-background">
      <aside className="w-40 lg:w-64 border border-r border-gray-300 bg-card p-5">
        <div className="flex h-full flex-col">
          <div className=" flex h-16 items-center justify-between px-4">
            <Link href="/">
              <span className="text-xl font-bold">ExecOS</span>
            </Link>
          </div>
          <nav className="flex-1 space-y-1 p-4 flex flex-col items-start">
            {navItems.map((item) => (
              <Link href={item.href} key={item.href} className="hover:bg-none">
                <Button
                  variant="ghost"
                  className="w-full hover:bg-none  hover:bg-transparent group"
                >
                  <span className="group-hover:text-rose-500">
                    <item.icon className="w-5 h-5" />
                  </span>
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>

          {!isPaidUser && (
            <div className="border-t border-border p-4">
              <div className="rounded-lg bg-teal-400/20 p-4 text-gray-700">
                <div className="mb-2 flex items-center gap-2">
                  <ZapIcon className="h-5 w-5 text-mutes-foreground" />
                  <span className="text-muted-foreground font-semibold">
                    Upgrade to Pro
                  </span>
                </div>
                <p className="mb-3 text-sm opacity-90">
                  Unlock autonomous AI agents
                </p>
                <Button
                  variant="secondary"
                  className="w-full hover:shadow-sm transition duration-200"
                >
                  <Link href="/#pricing">Upgrade Now</Link>
                </Button>
              </div>
            </div>
          )}

          <div className="border-t border-border p-4">
            <div className="flex items-center justify-between">
              <UserButton />
              {isPaidUser && <Badge>Pro</Badge>}
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-8">{children}</div>
      </main>
    </div>
  );
}
