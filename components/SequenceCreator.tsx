"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Contact,
  EmailSignature,
  TimingStrategy,
  SignaturePayload,
  SequenceConfig,
  CreateSequenceResponse,
} from "@/lib/types";
import { authFetch } from "@/lib/auth";
import { useSequence } from "@/hooks/useSequence";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";
const COMPOSE_API_URL =
  process.env.NEXT_PUBLIC_COMPOSE_API_URL || "http://localhost:8003";

interface SequenceCreatorProps {
  contact: Contact;
  campaignId: string;
  onClose: () => void;
  onSequenceCreated?: () => void;
}

const timingDescriptions: Record<TimingStrategy, { label: string; description: string }> = {
  human_like: {
    label: "Human-like",
    description: "2-4 days between emails, varies timing naturally",
  },
  aggressive: {
    label: "Aggressive",
    description: "1-2 days between emails, more persistent",
  },
  patient: {
    label: "Patient",
    description: "5-7 days between emails, gives time to respond",
  },
};

export function SequenceCreator({
  contact,
  campaignId,
  onClose,
  onSequenceCreated,
}: SequenceCreatorProps) {
  const [signatures, setSignatures] = useState<EmailSignature[]>([]);
  const [selectedSignatureId, setSelectedSignatureId] = useState<string>("");
  const [maxSteps, setMaxSteps] = useState<number>(3);
  const [timingStrategy, setTimingStrategy] = useState<TimingStrategy>("human_like");
  const [stopOnReply, setStopOnReply] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdSequence, setCreatedSequence] = useState<CreateSequenceResponse | null>(null);

  const { data: existingSequence, hasSequence } = useSequence(contact.id, campaignId);

  // Load signatures
  useEffect(() => {
    const loadSignatures = async () => {
      try {
        const res = await authFetch(`${API_URL}/api/settings/signatures`);
        if (res.ok) {
          const data = await res.json();
          // The settings API returns array directly, not wrapped in { signatures: [] }
          setSignatures(Array.isArray(data) ? data : data.signatures || []);
          const sigArray = Array.isArray(data) ? data : data.signatures || [];
          const defaultSig = sigArray.find(
            (s: EmailSignature) => s.is_default
          );
          if (defaultSig) {
            setSelectedSignatureId(defaultSig.id);
          }
        }
      } catch (err) {
        console.error("Failed to load signatures:", err);
      }
    };
    loadSignatures();
  }, []);

  const handleCreate = async () => {
    setIsCreating(true);
    setError(null);

    try {
      // Get selected signature
      let signature: SignaturePayload | undefined;
      if (selectedSignatureId) {
        const sig = signatures.find((s) => s.id === selectedSignatureId);
        if (sig) {
          signature = {
            first_name: sig.first_name,
            last_name: sig.last_name,
            title: sig.title,
            company: sig.company,
            closing: sig.closing,
          };
        }
      }

      const config: SequenceConfig = {
        max_steps: maxSteps,
        stop_on_reply: stopOnReply,
        timing_strategy: timingStrategy,
      };

      const response = await authFetch(`${COMPOSE_API_URL}/api/sequence/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact_id: contact.id,
          campaign_id: campaignId,
          sequence_config: config,
          signature,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to create sequence");
      }

      const result: CreateSequenceResponse = await response.json();
      setCreatedSequence(result);
      onSequenceCreated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create sequence");
    } finally {
      setIsCreating(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // If sequence already exists, show info
  if (hasSequence && existingSequence) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Sequence Already Active</CardTitle>
            <CardDescription>
              A sequence is already running for {contact.first_name}{" "}
              {contact.last_name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  <span className="font-medium">Current step:</span>{" "}
                  {existingSequence.sequence_state?.current_step || 1} of{" "}
                  {existingSequence.messages.length}
                </p>
                {existingSequence.sequence_state?.next_send_window && (
                  <p className="text-sm text-blue-700 mt-1">
                    <span className="font-medium">Next email:</span>{" "}
                    {formatDateTime(existingSequence.sequence_state.next_send_window)}
                  </p>
                )}
              </div>
              <Button variant="outline" className="w-full" onClick={onClose}>
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If sequence was just created, show success
  if (createdSequence) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <span className="text-3xl">🎉</span>
              <div>
                <CardTitle>Sequence Created!</CardTitle>
                <CardDescription>
                  {createdSequence.steps.length} emails scheduled for{" "}
                  {contact.first_name}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {createdSequence.steps.map((step) => (
                <div
                  key={step.message_id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        Step {step.step}
                      </Badge>
                      <span className="text-sm font-medium">
                        {step.intent === "introduction"
                          ? "Introduction"
                          : step.intent === "value_prop"
                          ? "Value Prop"
                          : step.intent === "question"
                          ? "Question"
                          : "Breakup"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 truncate max-w-xs">
                      {step.subject}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-blue-100 text-blue-800">🕐 Scheduled</Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDateTime(step.scheduled_send_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Button className="w-full mt-4" onClick={onClose}>
              Done
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-950 rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Create Sequence</h2>
              <p className="text-sm text-slate-500">
                for {contact.first_name} {contact.last_name}
              </p>
            </div>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Number of Steps */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Number of Emails
            </label>
            <select
              value={maxSteps}
              onChange={(e) => setMaxSteps(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent"
            >
              <option value={1}>1 email</option>
              <option value={2}>2 emails</option>
              <option value={3}>3 emails</option>
              <option value={4}>4 emails</option>
            </select>
          </div>

          {/* Timing Strategy */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Timing Strategy
            </label>
            <select
              value={timingStrategy}
              onChange={(e) => setTimingStrategy(e.target.value as TimingStrategy)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent"
            >
              <option value="human_like">Human-like</option>
              <option value="aggressive">Aggressive</option>
              <option value="patient">Patient</option>
            </select>
            <p className="mt-1.5 text-xs text-slate-500">{timingDescriptions[timingStrategy].description}</p>
          </div>

          {/* Signature */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Email Signature
            </label>
            <select
              value={selectedSignatureId}
              onChange={(e) => setSelectedSignatureId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent"
            >
              <option value="">No signature</option>
              {signatures.map((sig) => (
                <option key={sig.id} value={sig.id}>{sig.name}</option>
              ))}
            </select>
          </div>

          {/* Stop on Reply */}
          <div className="flex items-center justify-between py-3 border-t border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Stop on reply</span>
              <p className="text-xs text-slate-500 mt-0.5">Pause the sequence when contact responds</p>
            </div>
            <button
              type="button"
              onClick={() => setStopOnReply(!stopOnReply)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                stopOnReply ? "bg-slate-900 dark:bg-white" : "bg-slate-200 dark:bg-slate-700"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-slate-900 transition-transform ${
                  stopOnReply ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Preview Info */}
          <div className="rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4">
            <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Preview</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Total emails</span>
                <span className="font-medium text-slate-900 dark:text-white">{maxSteps}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Duration</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {timingStrategy === "aggressive" ? `${(maxSteps - 1) * 2} days` :
                   timingStrategy === "human_like" ? `${(maxSteps - 1) * 3} days` :
                   `${(maxSteps - 1) * 6} days`}
                </span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={isCreating || !selectedSignatureId}
            className="px-4 py-2 text-sm font-medium bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating...
              </span>
            ) : (
              "Create Sequence"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
