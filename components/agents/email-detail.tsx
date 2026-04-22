"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Email } from "@/db/queries/agentRuns";

import {
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  ListTodo,
  User,
} from "lucide-react";
import { useState } from "react";

const priorityColors: Record<string, string> = {
  high: "bg-destructive",
  medium: "bg-primary/70",
  low: "bg-primary",
};

const categoryColors: Record<string, string> = {
  work: "bg-muted text-muted-foreground",
  personal: "bg-muted text-muted-foreground",
  newsletter: "bg-muted text-muted-foreground",
  notification: "bg-muted text-muted-foreground",
  spam: "bg-destructive/20 text-destructive",
  other: "bg-muted text-muted-foreground",
};

type EDetailProps = {
  key: string;
  email: Email;
};

export function EmailDetail({ key, email }: EDetailProps) {
  const [expanded, setExpanded] = useState(false);

  const senderName =
    email.from?.split("<")[0].trim().replace(/"/g, "") || email.from;

  return (
    <Card className="transition-all duration-300 hover:scale-[1.01]">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left"
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {/* Subejct + Badges */}
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-semibold text-foreground truncate">
                  {email.subject || "(No subject)"}
                </h3>
                {email.priority && (
                  <Badge
                    variant="default"
                    className={priorityColors[email.priority] ?? "bg-muted"}
                  >
                    {email.priority}
                  </Badge>
                )}
                {email.category && (
                  <Badge
                    variant="outline"
                    className={categoryColors[email.category] ?? ""}
                  >
                    {email.category}
                  </Badge>
                )}
                {email.draftCreated && (
                  <Badge
                    variant="outline"
                    className="bg-muted text-muted-foreground"
                  >
                    <FileText className="h-5 w-5" /> Draft
                  </Badge>
                )}
                {(email.tasksCreated ?? 0) > 0 && (
                  <Badge
                    variant="outline"
                    className="bg-muted text-muted-foreground"
                  >
                    <ListTodo className="h-5 w-5" />
                    {email.tasksCreated}
                    {email.tasksCreated !== 1 ? " tasks" : " task"}
                  </Badge>
                )}
              </div>

              {/* From + Date */}
              <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="h-5 w-5 text-muted-foreground" />{" "}
                  {senderName}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  {new Date(email.processedAt).toLocaleString()}
                </span>
              </div>

              {/* Summary */}
              {email.summary && (
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                  {email.summary}
                </p>
              )}
            </div>

            <div>
              {expanded ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </div>
          </div>
        </CardContent>
      </button>

      {/* Expanded Detail */}
      {expanded && (
        <div className="border-t border-border px-4 pb-4">
          <div className="grid gap-4 pt-4 md:grid-cols-2">
            {/* Action Items */}
            {email.actionItems && email.actionItems.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-semibold text-foreground flex items-center gap-1">
                  <ListTodo className="h-5 w-5 text-muted-foreground" />
                  Action Items
                </h4>
                <ul className="space-y-2">
                  {email.actionItems.map((item, i) => (
                    <li className="rounded-lg bg-muted p-3">
                      <p className="text-sm font-medium text-foreground">
                        {item.title}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.description}
                      </p>
                      {item.dueDate && (
                        <p className="mt-1 text-xs text-primary">
                          Due: {new Date(item.dueDate).toLocaleDateString()}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {/* Drafts Reply */}
            {email.draftReply && (
              <div>
                <h4 className="mb-2 text-sm font-semibold text-foreground flex items-center gap-1">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  Draft Reply
                </h4>
                <div className=" rounded-lg bg-muted p-3">
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                    {email.draftReply}
                  </p>
                </div>
              </div>
            )}
            {/* No Details */}
            {(!email.actionItems || email.actionItems.length === 0) &&
              !email.draftReply && (
                <div className="col-span-2 text-center py-4">
                  <p className="text-sm text-muted-foreground">
                    No action items or draft reply for this email.
                  </p>
                </div>
              )}
          </div>

          {/* Error state */}
          {email.status === "error" && email.error && (
            <div className="mt-4 rounded-lg bg-destructive/10 p-3">
              <p className="text-sm text-destructive">{email.error}</p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
