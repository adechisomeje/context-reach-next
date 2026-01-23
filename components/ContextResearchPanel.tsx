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
import { ContextResearchResponse, BuyingSignal, Contact } from "@/lib/types";
import { useState } from "react";
import { SequenceCreator } from "@/components/SequenceCreator";

interface ContextResearchPanelProps {
  research: ContextResearchResponse;
  contact: Contact;
  campaignId: string;
  onClose: () => void;
  onEmailScheduled?: () => void;
  hasSequence?: boolean; // Whether contact already has a sequence running
}

export function ContextResearchPanel({
  research,
  contact,
  campaignId,
  onClose,
  onEmailScheduled,
  hasSequence = false,
}: ContextResearchPanelProps) {
  const [copiedHook, setCopiedHook] = useState(false);
  const [showComposer, setShowComposer] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHook(true);
    setTimeout(() => setCopiedHook(false), 2000);
  };

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case "strong":
        return "bg-green-100 text-green-800 border-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "weak":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const SignalCard = ({ signal }: { signal: BuyingSignal }) => (
    <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {signal.type.replace("_", " ")}
        </span>
        <Badge className={getStrengthColor(signal.strength)} variant="outline">
          {signal.strength}
        </Badge>
      </div>
      <h4 className="font-medium text-sm text-slate-900 dark:text-white mb-1">
        {signal.title}
      </h4>
      <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
        {signal.summary}
      </p>
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span>{signal.source}</span>
        {signal.date && (
          <>
            <span>•</span>
            <span>{signal.date}</span>
          </>
        )}
      </div>
    </div>
  );

  // Combine all signals for display
  const allSignals = [
    ...research.company_context.buying_signals,
    ...research.company_context.industry_context,
    ...research.company_context.company_news,
    ...research.company_context.hiring_signals,
    ...research.company_context.regulatory_events,
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto py-8">
      <div className="bg-slate-50 dark:bg-slate-950 rounded-xl shadow-2xl w-full max-w-4xl mx-4 my-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 rounded-t-xl p-6 z-10">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                Context Research: {contact.first_name} {contact.last_name}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {contact.title} at {contact.company_name}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Relevance:</span>
              <span className={`text-2xl font-bold ${getScoreColor(research.relevance_score)}`}>
                {research.relevance_score}%
              </span>
            </div>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Signal Strength:</span>
              <Badge className={getStrengthColor(research.signal_strength)}>
                {research.signal_strength}
              </Badge>
            </div>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Urgency:</span>
              <Badge className={getUrgencyColor(research.messaging_brief.urgency_level)}>
                {research.messaging_brief.urgency_level}
              </Badge>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Opening Hook */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Opening Hook</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(research.messaging_brief.opening_hook)}
                >
                  {copiedHook ? "✓ Copied!" : "Copy"}
                </Button>
              </div>
              <CardDescription>Ready-to-use email opener</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 rounded-lg border border-indigo-100 dark:border-indigo-900">
                <p className="text-slate-800 dark:text-slate-200 italic">
                  "{research.messaging_brief.opening_hook}"
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Recommended Angles */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Recommended Outreach Angles</CardTitle>
              <CardDescription>Strategic approaches for your outreach</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {research.messaging_brief.recommended_angles.map((angle, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700"
                  >
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-900 dark:bg-white flex items-center justify-center">
                      <span className="text-xs font-bold text-white dark:text-slate-900">
                        {index + 1}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{angle}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Personalization Hooks */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Personalization Hooks</CardTitle>
              <CardDescription>Key points to reference in your outreach</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {research.messaging_brief.personalization_hooks.map((hook, index) => (
                  <Badge key={index} variant="secondary" className="text-sm py-1.5 px-3">
                    {hook}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Buying Signals & Context */}
          {allSignals.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Buying Signals & Company Context</CardTitle>
                <CardDescription>
                  {allSignals.length} relevant signals identified
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {allSignals.map((signal, index) => (
                    <SignalCard key={index} signal={signal} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tone Guidance */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Tone Guidance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {research.messaging_brief.tone_guidance}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 rounded-b-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {hasSequence && (
                <Badge className="bg-amber-100 text-amber-800">
                  📧 Sequence already running
                </Badge>
              )}
            </span>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              {!hasSequence && (
                <Button onClick={() => setShowComposer(true)}>
                  🚀 Start Sequence
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Email Sequence Creator Modal */}
      {showComposer && (
        <SequenceCreator
          contact={contact}
          campaignId={campaignId}
          onClose={() => setShowComposer(false)}
          onSequenceCreated={() => {
            setShowComposer(false);
            onEmailScheduled?.();
          }}
        />
      )}
    </div>
  );
}
