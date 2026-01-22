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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>Create Email Sequence</CardTitle>
          <CardDescription>
            Start a multi-step email sequence for {contact.first_name}{" "}
            {contact.last_name}
            {contact.company_name && ` at ${contact.company_name}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Number of Steps */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Number of Emails</label>
            <Select
              value={maxSteps.toString()}
              onValueChange={(v) => setMaxSteps(parseInt(v))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" className="z-[100]">
                <SelectItem value="1">1 email (Introduction only)</SelectItem>
                <SelectItem value="2">2 emails (Intro + Value)</SelectItem>
                <SelectItem value="3">3 emails (Intro + Value + Question)</SelectItem>
                <SelectItem value="4">4 emails (Full sequence with breakup)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Each email builds on the previous, ending with a polite breakup if needed
            </p>
          </div>

          {/* Timing Strategy */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Timing Strategy</label>
            <Select
              value={timingStrategy}
              onValueChange={(v) => setTimingStrategy(v as TimingStrategy)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" className="z-[100]">
                {Object.entries(timingDescriptions).map(([key, { label }]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              {timingDescriptions[timingStrategy].description}
            </p>
          </div>

          {/* Stop on Reply */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium">Stop on Reply</p>
              <p className="text-xs text-gray-500">
                Automatically stop sequence when they respond
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={stopOnReply}
                onChange={(e) => setStopOnReply(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Signature Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Signature</label>
            <Select
              value={selectedSignatureId}
              onValueChange={setSelectedSignatureId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a signature" />
              </SelectTrigger>
              <SelectContent position="popper" className="z-[100]">
                {signatures.length === 0 ? (
                  <div className="p-2 text-sm text-gray-500">
                    No signatures found. Create one in Settings.
                  </div>
                ) : (
                  signatures.map((sig) => (
                    <SelectItem key={sig.id} value={sig.id}>
                      {sig.name}
                      {sig.is_default && " (Default)"}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {signatures.length === 0 && (
              <p className="text-xs text-amber-600">
                ⚠️ No signatures available. <a href="/settings" className="underline">Create one</a> first.
              </p>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleCreate}
              disabled={isCreating || !selectedSignatureId}
            >
              {isCreating ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Creating...
                </>
              ) : (
                <>🚀 Start Sequence</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
