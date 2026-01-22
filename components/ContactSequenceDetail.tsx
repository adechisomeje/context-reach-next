"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Contact } from "@/lib/types";
import { useSequence } from "@/hooks/useSequence";
import { useContactEvents } from "@/hooks/useAnalytics";
import { EmailSequenceTimeline } from "@/components/EmailSequenceTimeline";

interface ContactSequenceDetailProps {
  contact: Contact;
  campaignId: string;
  onClose: () => void;
}

export function ContactSequenceDetail({
  contact,
  campaignId,
  onClose,
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
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {contact.first_name} {contact.last_name}
              </CardTitle>
              <CardDescription>
                {contact.title && `${contact.title} at `}
                {contact.company_name || contact.company_domain}
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {sequenceLoading ? (
            <div className="text-center py-8">
              <span className="animate-spin text-2xl">⏳</span>
              <p className="text-gray-500 mt-2">Loading sequence...</p>
            </div>
          ) : sequenceError ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {sequenceError}
            </div>
          ) : !hasSequence || !sequenceData ? (
            <div className="text-center py-8">
              <span className="text-4xl mb-4 block">📭</span>
              <p className="text-gray-500">No active sequence for this contact</p>
            </div>
          ) : (
            <>
              {/* Sequence Timeline */}
              <EmailSequenceTimeline
                messages={sequenceData.messages}
                sequenceState={sequenceData.sequence_state}
                onPause={pause}
                onResume={resume}
                onCancel={() => setShowCancelConfirm(true)}
                isLoading={sequenceLoading}
              />

              {/* Events Timeline */}
              {events && events.events.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Activity Log</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {events.events.slice(0, 10).map((event) => (
                        <div
                          key={event.id}
                          className="flex items-center justify-between text-sm py-2 border-b last:border-0"
                        >
                          <div className="flex items-center gap-2">
                            <span>
                              {event.type === "sent"
                                ? "📤"
                                : event.type === "delivered"
                                ? "✅"
                                : event.type === "opened"
                                ? "👀"
                                : event.type === "clicked"
                                ? "🔗"
                                : event.type === "bounced"
                                ? "❌"
                                : event.type === "replied"
                                ? "💬"
                                : "📌"}
                            </span>
                            <span className="capitalize">{event.type}</span>
                          </div>
                          <span className="text-gray-500">
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
                  </CardContent>
                </Card>
              )}

              {/* Lock Warning */}
              {sequenceData.is_locked && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-700">
                    <span className="font-medium">⚠️ Sequence locked:</span>{" "}
                    {sequenceData.lock_reason || "Processing in progress"}
                  </p>
                </div>
              )}
            </>
          )}

          {/* Cancel Confirmation */}
          {showCancelConfirm && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 font-medium mb-3">
                Are you sure you want to cancel this sequence?
              </p>
              <p className="text-sm text-red-600 mb-4">
                All pending emails will be cancelled. This cannot be undone.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCancelConfirm(false)}
                >
                  Keep Sequence
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleCancel}
                >
                  Cancel Sequence
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
