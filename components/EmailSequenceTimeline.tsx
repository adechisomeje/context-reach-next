"use client";

import { useState } from "react";
import { SequenceStep, MessageStatus, SequenceState } from "@/lib/types";
import { API_URL } from "@/lib/config";

interface EmailPreview {
  subject: string;
  body: string;
  intent: string;
  preview: boolean;
  cached?: boolean;
}

interface EmailSequenceTimelineProps {
  messages: SequenceStep[];
  sequenceState: SequenceState | null;
  contactId: string;
  campaignId: string;
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
  contactId,
  campaignId,
  onPause,
  onResume,
  onCancel,
  isLoading,
}: EmailSequenceTimelineProps) {
  const [previewingStep, setPreviewingStep] = useState<number | null>(null);
  const [previewCache, setPreviewCache] = useState<Record<number, EmailPreview>>({});
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // Get current preview from cache
  const emailPreview = previewingStep !== null ? previewCache[previewingStep] : null;

  const fetchEmailPreview = async (step: number, regenerate: boolean = false) => {
    // If we have a cached preview and not regenerating, just show the modal
    if (!regenerate && previewCache[step]) {
      setPreviewingStep(step);
      setPreviewError(null);
      return;
    }

    setPreviewLoading(true);
    setPreviewError(null);
    setPreviewingStep(step);
    
    try {
      const response = await fetch(`${API_URL}/api/compose/preview`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contact_id: contactId,
          campaign_id: campaignId,
          sequence_step: step,
          regenerate,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "Failed to load preview");
      }
      
      const data = await response.json();
      // Cache the preview for this step
      setPreviewCache(prev => ({ ...prev, [step]: data }));
    } catch (err) {
      setPreviewError(err instanceof Error ? err.message : "Failed to load preview");
    } finally {
      setPreviewLoading(false);
    }
  };

  const closePreview = () => {
    setPreviewingStep(null);
    setPreviewError(null);
    // Don't clear the cache - keep it for reopening
  };

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
              <div key={msg.message_id || `step-${msg.step}`} className="flex items-start gap-4">
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

                  {/* Preview button for scheduled/draft emails */}
                  {(msg.status === "scheduled" || msg.status === "draft") && (
                    <button
                      onClick={() => fetchEmailPreview(msg.step)}
                      className="mt-2 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors inline-flex items-center gap-1.5"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Preview Email
                    </button>
                  )}
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

      {/* Email Preview Modal */}
      {previewingStep !== null && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-950 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Email Preview
                </h3>
                <p className="text-sm text-slate-500">
                  Step {previewingStep} • {emailPreview?.intent ? intentLabels[emailPreview.intent] || emailPreview.intent : "Loading..."}
                </p>
              </div>
              <button
                onClick={closePreview}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {previewLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <svg className="animate-spin h-8 w-8 text-slate-400 mb-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <p className="text-slate-500">Generating email preview...</p>
                </div>
              ) : previewError ? (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-700 dark:text-red-400">{previewError}</p>
                </div>
              ) : emailPreview ? (
                <div className="space-y-4">
                  {/* Cached indicator */}
                  {emailPreview.cached && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Loaded from cache</span>
                    </div>
                  )}

                  {/* Subject */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                    <p className="text-xs text-slate-500 mb-1">Subject</p>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {emailPreview.subject}
                    </p>
                  </div>

                  {/* Body */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                    <p className="text-xs text-slate-500 mb-2">Body</p>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <div className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap text-sm leading-relaxed">
                        {emailPreview.body}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex justify-between">
              <button
                onClick={() => previewingStep && fetchEmailPreview(previewingStep, true)}
                disabled={previewLoading}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
              >
                <svg className={`w-4 h-4 ${previewLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Regenerate
              </button>
              <button
                onClick={closePreview}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
