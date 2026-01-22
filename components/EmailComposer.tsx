"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Contact,
  EmailSignature,
  EmailTone,
  EmailLength,
  PreviewResponse,
  ComposeResponse,
  SignaturePayload,
} from "@/lib/types";
import { authFetch } from "@/lib/auth";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";
const COMPOSE_API_URL = process.env.NEXT_PUBLIC_COMPOSE_API_URL || "http://localhost:8003";

interface EmailComposerProps {
  contact: Contact;
  campaignId: string;
  onClose: () => void;
  onEmailScheduled?: (response: ComposeResponse) => void;
}

const TONE_OPTIONS: { value: EmailTone; label: string; description: string }[] = [
  { value: "professional", label: "Professional", description: "Formal and business-like" },
  { value: "casual", label: "Casual", description: "Friendly and approachable" },
  { value: "excited", label: "Excited", description: "Enthusiastic and energetic" },
];

const LENGTH_OPTIONS: { value: EmailLength; label: string; description: string }[] = [
  { value: "short", label: "Short", description: "50-80 words" },
  { value: "medium", label: "Medium", description: "100-150 words" },
  { value: "long", label: "Long", description: "150-200 words" },
];

const INTENT_LABELS: Record<string, { label: string; color: string }> = {
  introduction: { label: "Introduction", color: "bg-blue-100 text-blue-800" },
  value_prop: { label: "Value Prop", color: "bg-green-100 text-green-800" },
  question: { label: "Question", color: "bg-purple-100 text-purple-800" },
  breakup: { label: "Breakup", color: "bg-orange-100 text-orange-800" },
};

export function EmailComposer({
  contact,
  campaignId,
  onClose,
  onEmailScheduled,
}: EmailComposerProps) {
  // Signature state
  const [signature, setSignature] = useState<EmailSignature | null>(null);
  const [loadingSignature, setLoadingSignature] = useState(true);
  
  // Compose options
  const [tone, setTone] = useState<EmailTone>("professional");
  const [length, setLength] = useState<EmailLength>("medium");
  const [sequenceStep, setSequenceStep] = useState(1);
  
  // Preview state
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  
  // Send state
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<ComposeResponse | null>(null);
  
  // Error state
  const [error, setError] = useState<string | null>(null);

  // Load default signature on mount
  useEffect(() => {
    const loadSignature = async () => {
      setLoadingSignature(true);
      try {
        const response = await authFetch(`${API_URL}/api/settings/signatures/default`);
        if (response.ok) {
          const data = await response.json();
          setSignature(data);
        } else if (response.status === 404) {
          // No default signature
          setSignature(null);
        }
      } catch (err) {
        console.error("Failed to load signature:", err);
      } finally {
        setLoadingSignature(false);
      }
    };
    loadSignature();
  }, []);

  const getSignaturePayload = (): SignaturePayload | undefined => {
    if (!signature) return undefined;
    return {
      first_name: signature.first_name,
      last_name: signature.last_name,
      title: signature.title,
      company: signature.company,
      closing: signature.closing,
    };
  };

  const handlePreview = async () => {
    if (!signature) {
      setError("Please create a signature in Settings first");
      return;
    }

    setLoadingPreview(true);
    setError(null);
    setPreview(null);

    try {
      const response = await authFetch(`${COMPOSE_API_URL}/api/compose/preview`, {
        method: "POST",
        body: JSON.stringify({
          contact_id: contact.id,
          campaign_id: campaignId,
          sequence_step: sequenceStep,
          overrides: { tone, length },
          signature: getSignaturePayload(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.reason || "Failed to generate preview");
      }

      const data: PreviewResponse = await response.json();
      setPreview(data);
    } catch (err) {
      console.error("Preview failed:", err);
      setError(err instanceof Error ? err.message : "Failed to generate preview");
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleSend = async () => {
    if (!signature) {
      setError("Please create a signature in Settings first");
      return;
    }

    setSending(true);
    setError(null);

    try {
      const response = await authFetch(`${COMPOSE_API_URL}/api/compose`, {
        method: "POST",
        body: JSON.stringify({
          contact_id: contact.id,
          campaign_id: campaignId,
          sequence_step: sequenceStep,
          overrides: { tone, length },
          signature: getSignaturePayload(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.reason || "Failed to schedule email");
      }

      const data: ComposeResponse = await response.json();
      setSent(data);
      onEmailScheduled?.(data);
    } catch (err) {
      console.error("Send failed:", err);
      setError(err instanceof Error ? err.message : "Failed to schedule email");
    } finally {
      setSending(false);
    }
  };

  const formatScheduledTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Success state - email scheduled
  if (sent) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl mx-4 p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Email Scheduled!
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Your email to {contact.first_name} will be sent on<br />
            <span className="font-medium text-slate-900 dark:text-white">
              {formatScheduledTime(sent.scheduled_send_at)}
            </span>
          </p>
          
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 mb-6 text-left">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-slate-500">Subject:</span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">{sent.subject}</span>
            </div>
            <div className="text-xs text-slate-500">
              Send window: {sent.human_like_timing.send_window}
            </div>
          </div>

          <Button onClick={onClose} className="px-8">
            Done
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto py-8">
      <div className="bg-slate-50 dark:bg-slate-950 rounded-xl shadow-2xl w-full max-w-3xl mx-4 my-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 rounded-t-xl p-6 z-10">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                Compose Email
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                To: {contact.first_name} {contact.last_name} ({contact.email})
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {error}
              <Button variant="ghost" size="sm" className="ml-2" onClick={() => setError(null)}>
                Dismiss
              </Button>
            </div>
          )}

          {/* Signature Warning */}
          {!loadingSignature && !signature && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="font-medium text-amber-800">No signature found</p>
                  <p className="text-sm text-amber-700 mt-1">
                    You need to create an email signature before composing emails.
                  </p>
                  <Link href="/settings" className="text-sm text-amber-800 font-medium underline mt-2 inline-block">
                    Go to Settings →
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Signature Display */}
          {signature && (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Using Signature</CardTitle>
                  <Link href="/settings">
                    <Button variant="ghost" size="sm" className="text-xs">
                      Change
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{signature.name}</Badge>
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {signature.first_name} {signature.last_name}
                    {signature.title && ` • ${signature.title}`}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Compose Options */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Email Options</CardTitle>
              <CardDescription>Customize how your email is generated</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Tone Selection */}
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                  Tone
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {TONE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setTone(option.value)}
                      className={`p-3 rounded-lg border text-left transition-colors ${
                        tone === option.value
                          ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900"
                          : "border-slate-200 hover:border-slate-300 dark:border-slate-700"
                      }`}
                    >
                      <div className="font-medium text-sm">{option.label}</div>
                      <div className={`text-xs mt-0.5 ${tone === option.value ? "text-slate-300 dark:text-slate-600" : "text-slate-500"}`}>
                        {option.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Length Selection */}
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                  Length
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {LENGTH_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setLength(option.value)}
                      className={`p-3 rounded-lg border text-left transition-colors ${
                        length === option.value
                          ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900"
                          : "border-slate-200 hover:border-slate-300 dark:border-slate-700"
                      }`}
                    >
                      <div className="font-medium text-sm">{option.label}</div>
                      <div className={`text-xs mt-0.5 ${length === option.value ? "text-slate-300 dark:text-slate-600" : "text-slate-500"}`}>
                        {option.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sequence Step */}
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                  Email Type (Sequence Step)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((step) => {
                    const intents = ["introduction", "value_prop", "question", "breakup"];
                    const intent = intents[step - 1];
                    const { label, color } = INTENT_LABELS[intent];
                    return (
                      <button
                        key={step}
                        onClick={() => setSequenceStep(step)}
                        className={`p-2 rounded-lg border text-center transition-colors ${
                          sequenceStep === step
                            ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900"
                            : "border-slate-200 hover:border-slate-300 dark:border-slate-700"
                        }`}
                      >
                        <div className="font-medium text-sm">Step {step}</div>
                        <div className={`text-xs mt-0.5 ${sequenceStep === step ? "text-slate-300 dark:text-slate-600" : "text-slate-500"}`}>
                          {label}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview Button */}
          {!preview && (
            <div className="flex justify-center">
              <Button
                onClick={handlePreview}
                disabled={loadingPreview || !signature}
                size="lg"
                className="px-8"
              >
                {loadingPreview ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Generating Preview...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Preview Email
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Preview Display */}
          {preview && (
            <Card className="border-2 border-indigo-200 dark:border-indigo-800">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">Email Preview</CardTitle>
                    <Badge className={INTENT_LABELS[preview.intent]?.color || "bg-slate-100"}>
                      {INTENT_LABELS[preview.intent]?.label || preview.intent}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setPreview(null)}>
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Regenerate
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Subject */}
                <div>
                  <span className="text-xs text-slate-500 uppercase tracking-wide">Subject</span>
                  <p className="font-medium text-slate-900 dark:text-white mt-1">
                    {preview.subject}
                  </p>
                </div>

                {/* Body */}
                <div>
                  <span className="text-xs text-slate-500 uppercase tracking-wide">Body</span>
                  <div className="mt-2 p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700 dark:text-slate-300">
                      {preview.body}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 rounded-b-xl p-4">
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            {preview && (
              <Button
                onClick={handleSend}
                disabled={sending || !signature}
                className="px-8"
              >
                {sending ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Scheduling...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Schedule Email
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
