"use client";

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
  { label: string; color: string; bg: string; darkBg: string }
> = {
  draft: {
    label: "Draft",
    color: "text-slate-600 dark:text-slate-400",
    bg: "bg-slate-100",
    darkBg: "dark:bg-slate-800",
  },
  scheduled: {
    label: "Scheduled",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-100",
    darkBg: "dark:bg-blue-900/30",
  },
  sent: {
    label: "Sent",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-100",
    darkBg: "dark:bg-amber-900/30",
  },
  delivered: {
    label: "Delivered",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-100",
    darkBg: "dark:bg-emerald-900/30",
  },
  bounced: {
    label: "Bounced",
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-100",
    darkBg: "dark:bg-red-900/30",
  },
  replied: {
    label: "Replied",
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-100",
    darkBg: "dark:bg-purple-900/30",
  },
  failed: {
    label: "Failed",
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-100",
    darkBg: "dark:bg-red-900/30",
  },
  cancelled: {
    label: "Cancelled",
    color: "text-slate-500 dark:text-slate-500",
    bg: "bg-slate-100",
    darkBg: "dark:bg-slate-800",
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
    const absDays = Math.abs(diffDays);
    const absHours = Math.abs(diffHours);
    if (absDays > 0) return `${absDays} day${absDays > 1 ? "s" : ""} ago`;
    if (absHours > 0) return `${absHours} hour${absHours > 1 ? "s" : ""} ago`;
    return "just now";
  } else {
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
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-slate-900 dark:text-white">
              Email Sequence
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {sequenceState?.reply_detected
                ? "Reply detected - sequence stopped"
                : sequenceState?.is_paused
                ? "Sequence paused"
                : `Step ${sequenceState?.current_step || 1} of ${messages.length}`}
            </p>
          </div>
          <div className="flex gap-2">
            {sequenceState && !sequenceState.reply_detected && (
              <>
                {sequenceState.is_paused ? (
                  <button
                    onClick={onResume}
                    disabled={isLoading}
                    className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                  >
                    Resume
                  </button>
                ) : (
                  <button
                    onClick={onPause}
                    disabled={isLoading}
                    className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                  >
                    Pause
                  </button>
                )}
                <button
                  onClick={onCancel}
                  disabled={isLoading}
                  className="px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="p-4">
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
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${config.bg} ${config.darkBg} ${config.color} ${
                      isCurrent
                        ? "ring-2 ring-slate-900 dark:ring-white ring-offset-2 dark:ring-offset-slate-950"
                        : ""
                    }`}
                  >
                    {msg.step}
                  </div>
                  {!isLast && (
                    <div
                      className={`w-0.5 h-10 mt-1 ${
                        msg.status === "sent" ||
                        msg.status === "delivered" ||
                        msg.status === "replied"
                          ? "bg-emerald-300 dark:bg-emerald-700"
                          : "bg-slate-200 dark:bg-slate-700"
                      }`}
                    />
                  )}
                </div>

                {/* Message card */}
                <div
                  className={`flex-1 p-3 border rounded-lg ${
                    isCurrent
                      ? "border-slate-900 dark:border-white bg-slate-50 dark:bg-slate-900"
                      : "border-slate-200 dark:border-slate-800"
                  }`}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.darkBg} ${config.color}`}
                        >
                          {intentLabels[msg.intent] || msg.intent}
                        </span>
                      </div>
                      <h4 className="font-medium text-slate-900 dark:text-white truncate text-sm">
                        {msg.subject}
                      </h4>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${config.bg} ${config.darkBg} ${config.color}`}
                    >
                      {config.label}
                    </span>
                  </div>

                  {/* Timing info */}
                  <div className="mt-2 text-xs text-slate-500">
                    {msg.status === "scheduled" ? (
                      <div className="flex items-center gap-1">
                        <span>Scheduled:</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {formatDateTime(msg.scheduled_send_at)}
                        </span>
                        <span className="text-slate-400">
                          ({formatRelativeTime(msg.scheduled_send_at)})
                        </span>
                      </div>
                    ) : msg.sent_at ? (
                      <div className="flex items-center gap-1">
                        <span>Sent:</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {formatDateTime(msg.sent_at)}
                        </span>
                      </div>
                    ) : msg.status === "cancelled" ? (
                      <span>Cancelled</span>
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
            <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                <span className="font-medium">Next email scheduled:</span>{" "}
                <span className="text-slate-900 dark:text-white">
                  {formatDateTime(sequenceState.next_send_window)}
                </span>
                <span className="text-slate-500 ml-1">
                  ({formatRelativeTime(sequenceState.next_send_window)})
                </span>
              </p>
            </div>
          )}
      </div>
    </div>
  );
}
