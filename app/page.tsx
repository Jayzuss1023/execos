import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PricingTable,
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
// import { dark } from "@clerk/themes";
import Link from "next/link";

const features = [
  {
    key: "email-management",
    title: "Autonomous Email Management",
    description:
      "AI processess your emails every 15 minutes, categorizes them, and drafts intelligent replies",
  },
  {
    key: "task-extraction",
    title: "Smart Task Extraction",
    description:
      "Automatically creates tasks from your emails and calendar events. Never miss a to-do again",
  },
  {
    key: "calendar-intelligence",
    title: "Calendar Intelligence",
    description:
      "Suggests optimal meeting times, detects conflicts, and keeps your schedule organized",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between px-4">
            <Link href="/">
              <span className="text-xl font-bold">ExecOS</span>
            </Link>
            <Show when="signed-in">
              <div className="flex items-center gap-4">
                <Link href="/dashboard">
                  <Button variant="ghost">Dashboard</Button>
                </Link>
                <UserButton />
              </div>
            </Show>
            <Show when="signed-out">
              <div className="flex items-center gap-4">
                <SignInButton />
                <SignUpButton />
              </div>
            </Show>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="text-center">
          <p>
            <span className="text-foreground uppercase text-lg lg:text-xl">
              The AI that actually does things
            </span>
          </p>
          <h1>
            The Autonomous Executive <br />
            Assistant
          </h1>

          <p className="mx-auto mb-8 max-w-2xl text-3xl text-muted-foreground text-white">
            Clears your inbox, sends emails. manages your calendar, all from
            your favorite chat app.
          </p>
          <div>
            <Link href="/sign-up">
              <Button
                variant="ghost"
                className="hover:bg-card hover:shadow-lg transition duration-300"
              >
                Start Free Trial
              </Button>
            </Link>
            <Button className="bg-rose-400 hover:bg-rose-500/80 hover:shadow-lg transition duration-300">
              See How It Works
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <h2>Powerful Features</h2>
        <div className="grid gap-8 lg:grid-cols-3">
          {features.map((feat) => (
            <Card key={feat.key} className="p-6 bg-rose-400">
              <CardHeader>
                <CardTitle className="text-xl text-foreground font-bold text-center">
                  {feat.title}
                </CardTitle>
                <CardDescription className="text-base leading-relaxed text-white">
                  {feat.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section
        className="mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-8"
        id="pricing"
      >
        <h2>Simple, Transparent Pricing</h2>
        <PricingTable
          appearance={{
            variables: {
              colorPrimary: "#86baa9", // blue
              colorForeground: "#000000", // black
              colorBackground: "#86baa9",
            },
          }}
        />
      </section>
    </div>
  );
}
