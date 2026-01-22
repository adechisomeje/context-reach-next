"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SequenceStep, MessageStatus, SequenceState } from "@/lib/types";

interface EmailSequenceTimelineProps {
  messages: SequenceStep[];
  sequenceState: SequenceState | null;
  onPause?: () => void;
  onResume?: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

const statusConfig: Record<
  MessageStatus,
  { label: string; color: string; icon: string; bgColor: string }
> = {
  draft: {
    label: "Draft",
    color: "text-gray-600",
    icon: "📝",
    bgColor: "bg-gray-100",
  },
  scheduled: {
    label: "Scheduled",
    color: "text-blue-600",
    icon: "🕐",
    bgColor: "bg-blue-100",
  },
  sent: {
    label: "Sent",
    color: "text-yellow-600",
    icon: "📤",
    bgColor: "bg-yellow-100",
  },
  delivered: {
    label: "Delivered",
    color: "text-green-600",
    icon: "✅",
    bgColor: "bg-green-100",
  },
  bounced: {
    label: "Bounced",
    color: "text-red-600",
    icon: "❌",
    bgColor: "bg-red-100",
  },
  replied: {
    label: "Replied",
    color: "text-purple-600",
    icon: "💬",
    bgColor: "bg-purple-100",
  },
  failed: {
    label: "Failed",
    color: "text-red-600",
    icon: "⚠️",
    bgColor: "bg-red-100",
  },
  cancelled: {
    label: "Cancelled",
    color: "text-gray-500",
    icon: "🚫",
    bgColor: "bg-gray-100",
  },
};

const intentLabels: Record<string, string> = {
  introduction: "Introduction",
  value_prop: "Value Proposition",
  question: "Engagement Question",
  breakup: "Final Follow-up",
};

function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (diffMs < 0) {
    // In the past
    const absDays = Math.abs(diffDays);
    const absHours = Math.abs(diffHours);
    if (absDays > 0) return `${absDays} day${absDays > 1 ? "s" : ""} ago`;
    if (absHours > 0) return `${absHours} hour${absHours > 1 ? "s" : ""} ago`;
    return "just now";
  } else {
    // In the future
    if (diffDays > 0) return `in ${diffDays} day${diffDays > 1 ? "s" : ""}`;
    if (diffHours > 0) return `in ${diffHours} hour${diffHours > 1 ? "s" : ""}`;
    return "soon";
  }
}

export function EmailSequenceTimeline({
  messages,
  sequenceState,
  onPause,
  onResume,
  onCancel,
  isLoading,
}: EmailSequenceTimelineProps) {
  const sortedMessages = [...messages].sort((a, b) => a.step - b.step);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Email Sequence</CardTitle>
            <CardDescription>
              {sequenceState?.reply_detected
                ? "🎉 Reply detected - sequence stopped"
                : sequenceState?.is_paused
                ? "⏸️ Sequence paused"
                : `Step ${sequenceState?.current_step || 1} of ${messages.length}`}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {sequenceState && !sequenceState.reply_detected && (
              <>
                {sequenceState.is_paused ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onResume}
                    disabled={isLoading}
                  >
                    ▶️ Resume
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onPause}
                    disabled={isLoading}
                  >
                    ⏸️ Pause
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCancel}
                  disabled={isLoading}
                  className="text-red-600 hover:text-red-700"
                >
                  Cancel
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedMessages.map((msg, idx) => {
            const config = statusConfig[msg.status] || statusConfig.draft;
            const isLast = idx === sortedMessages.length - 1;
            const isCurrent = sequenceState?.current_step === msg.step;

            return (
              <div key={msg.message_id} className="flex items-start gap-4">
                {/* Timeline connector */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                      config.bgColor
                    } ${isCurrent ? "ring-2 ring-blue-500 ring-offset-2" : ""}`}
                  >
                    {config.icon}
                  </div>
                  {!isLast && (
                    <div
                      className={`w-0.5 h-12 mt-1 ${
                        msg.status === "sent" ||
                        msg.status === "delivered" ||
                        msg.status === "replied"
                          ? "bg-green-300"
                          : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>

                {/* Message card */}
                <div
                  className={`flex-1 p-4 border rounded-lg ${
                    isCurrent ? "border-blue-300 bg-blue-50/50" : ""
                  }`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-500">
                          Step {msg.step}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {intentLabels[msg.intent] || msg.intent}
                        </Badge>
                      </div>
                      <h4 className="font-medium text-gray-900 truncate">
                        {msg.subject}
                      </h4>
                    </div>
                    <Badge
                      className={`${config.bgColor} ${config.color} border-0 whitespace-nowrap`}
                    >
                      {config.label}
                    </Badge>
                  </div>

                  {/* Timing info */}
                  <div className="mt-3 text-sm text-gray-600">
                    {msg.status === "scheduled" ? (
                      <div className="flex items-center gap-2">
                        <span>📅 Scheduled for:</span>
                        <span className="font-medium">
                          {formatDateTime(msg.scheduled_send_at)}
                        </span>
                        <span className="text-gray-400">
                          ({formatRelativeTime(msg.scheduled_send_at)})
                        </span>
                      </div>
                    ) : msg.sent_at ? (
                      <div className="flex items-center gap-2">
                        <span>✅ Sent:</span>
                        <span className="font-medium">
                          {formatDateTime(msg.sent_at)}
                        </span>
                      </div>
                    ) : msg.status === "cancelled" ? (
                      <span className="text-gray-500">Cancelled</span>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Next send window */}
        {sequenceState?.next_send_window &&
          !sequenceState.is_paused &&
          !sequenceState.reply_detected && (
            <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <span className="font-medium">Next email scheduled:</span>{" "}
                {formatDateTime(sequenceState.next_send_window)}
                <span className="text-blue-500 ml-2">
                  ({formatRelativeTime(sequenceState.next_send_window)})
                </span>
              </p>
            </div>
          )}
      </CardContent>
    </Card>
  );
}
