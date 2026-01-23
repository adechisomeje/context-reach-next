"use client";

import { useState } from "react";
import { Contact } from "@/lib/types";
import { useSequence } from "@/hooks/useSequence";
import { useContactEvents } from "@/hooks/useAnalytics";
import { EmailSequenceTimeline } from "@/components/EmailSequenceTimeline";

interface ContactSequenceDetailProps {
  contact: Contact;
  campaignId: string;
  onClose: () => void;
  onStartSequence?: () => void;
  onSequenceChange?: () => void;
}

export function ContactSequenceDetail({
  contact,
  campaignId,
  onClose,
  onStartSequence,
  onSequenceChange,
}: ContactSequenceDetailProps) {
  const {
    data: sequenceData,
    loading: sequenceLoading,
    error: sequenceError,
    pause,
    resume,
    cancel,
    hasSequence,
  } = useSequence(contact.id, campaignId);

  const { events, loading: eventsLoading } = useContactEvents(contact.id);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const handleCancel = async () => {
    await cancel();
    setShowCancelConfirm(false);
    onSequenceChange?.();
  };

  const handlePause = async () => {
    await pause();
    onSequenceChange?.();
  };

  const handleResume = async () => {
    await resume();
    onSequenceChange?.();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-950 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 z-10 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                {contact.first_name} {contact.last_name}
              </h2>
              <p className="text-sm text-slate-500">
                {contact.title && `${contact.title} at `}
                {contact.company_name || contact.company_domain}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {sequenceLoading ? (
            <div className="text-center py-8">
              <svg
                className="animate-spin h-8 w-8 mx-auto text-slate-400"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <p className="text-slate-500 mt-2">Loading sequence...</p>
            </div>
          ) : sequenceError ? (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-400">
                {sequenceError}
              </p>
            </div>
          ) : !hasSequence || !sequenceData ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
                <svg
                  className="w-6 h-6 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p className="text-slate-500 mb-4">No active sequence for this contact</p>
              {onStartSequence && (
                <button
                  onClick={() => {
                    onClose();
                    onStartSequence();
                  }}
                  className="px-4 py-2 text-sm font-medium bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors inline-flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Start New Sequence
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Sequence Timeline */}
              <EmailSequenceTimeline
                messages={sequenceData.messages}
                sequenceState={sequenceData.sequence_state}
                contactId={contact.id}
                campaignId={campaignId}
                onPause={handlePause}
                onResume={handleResume}
                onCancel={() => setShowCancelConfirm(true)}
                isLoading={sequenceLoading}
              />

              {/* Events Timeline */}
              {events && events.events.length > 0 && (
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                    <h3 className="text-sm font-medium text-slate-900 dark:text-white">
                      Activity Log
                    </h3>
                  </div>
                  <div className="p-4">
                    <div className="space-y-2">
                      {events.events.slice(0, 10).map((event) => (
                        <div
                          key={event.id}
                          className="flex items-center justify-between text-sm py-2 border-b border-slate-100 dark:border-slate-800 last:border-0"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                                event.type === "sent"
                                  ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                                  : event.type === "delivered"
                                  ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                                  : event.type === "opened"
                                  ? "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                                  : event.type === "clicked"
                                  ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                                  : event.type === "bounced"
                                  ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                                  : event.type === "replied"
                                  ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                              }`}
                            >
                              {event.type === "sent"
                                ? "↑"
                                : event.type === "delivered"
                                ? "✓"
                                : event.type === "opened"
                                ? "○"
                                : event.type === "clicked"
                                ? "→"
                                : event.type === "bounced"
                                ? "!"
                                : event.type === "replied"
                                ? "↵"
                                : "•"}
                            </span>
                            <span className="capitalize text-slate-700 dark:text-slate-300">
                              {event.type}
                            </span>
                          </div>
                          <span className="text-slate-500 text-xs">
                            {new Date(event.created_at).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Lock Warning */}
              {sequenceData.is_locked && (
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    <span className="font-medium">⚠️ Sequence locked:</span>{" "}
                    {sequenceData.lock_reason || "Processing in progress"}
                  </p>
                </div>
              )}
            </>
          )}

          {/* Cancel Confirmation */}
          {showCancelConfirm && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-400 font-medium mb-2">
                Are you sure you want to cancel this sequence?
              </p>
              <p className="text-sm text-red-600 dark:text-red-500 mb-4">
                All pending emails will be cancelled. This cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Keep Sequence
                </button>
                <button
                  onClick={handleCancel}
                  className="px-3 py-1.5 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Cancel Sequence
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-6 py-4 rounded-b-lg">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
