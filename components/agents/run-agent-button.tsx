"use client";
import { useTransition } from "react";
import { Button } from "../ui/button";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";

export function RunAgentButton() {
  const [isPending, startTransition] = useTransition();

  const router = useRouter();
  const handleRunAgent = async () => {
    startTransition(async () => {
      try {
        const response = await fetch("/api/agents/run", {
          method: "POST",
        });

        // if (!response.ok) {
        //   console.error("Agent run failed", result.error);
        // }

        router.refresh();
      } catch (error) {
        console.error("Agent run error:", error);
      }
    });
  };

  return (
    <Button
      className="w-full"
      variant="outline"
      disabled={isPending}
      onClick={handleRunAgent}
    >
      {isPending ? (
        <>
          <Loader2Icon className="w-5 h-5 animate-spin" />
          Running Agent...
        </>
      ) : (
        "Run Agent"
      )}
    </Button>
  );
}
