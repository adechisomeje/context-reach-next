"use client";

import { ContextResearchResponse, BuyingSignal, Contact } from "@/lib/types";
import { useState } from "react";
import { SequenceCreator } from "@/components/SequenceCreator";

interface ContextResearchPanelProps {
  research: ContextResearchResponse;
  contact: Contact;
  campaignId: string;
  onClose: () => void;
  onEmailScheduled?: () => void;
  hasSequence?: boolean;
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

  const getStrengthStyle = (strength: string) => {
    switch (strength) {
      case "strong":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "medium":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      case "weak":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
    }
  };

  const getUrgencyStyle = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "medium":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      case "low":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
    }
  };

  const getScoreStyle = (score: number) => {
    if (score >= 80) return "text-emerald-600 dark:text-emerald-400";
    if (score >= 60) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  };

  const allSignals = [
    ...research.company_context.buying_signals,
    ...research.company_context.industry_context,
    ...research.company_context.company_news,
    ...research.company_context.hiring_signals,
    ...research.company_context.regulatory_events,
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto py-8">
      <div className="bg-white dark:bg-slate-950 rounded-lg shadow-xl w-full max-w-3xl mx-4 my-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 rounded-t-lg px-6 py-4 z-10">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                {contact.first_name} {contact.last_name}
              </h2>
              <p className="text-sm text-slate-500">
                {contact.title} at {contact.company_name}
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

          {/* Quick Stats */}
          <div className="flex items-center gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Relevance:</span>
              <span
                className={`text-lg font-semibold ${getScoreStyle(
                  research.relevance_score
                )}`}
              >
                {research.relevance_score}%
              </span>
            </div>
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Signal:</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStrengthStyle(
                  research.signal_strength
                )}`}
              >
                {research.signal_strength}
              </span>
            </div>
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Urgency:</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${getUrgencyStyle(
                  research.messaging_brief.urgency_level
                )}`}
              >
                {research.messaging_brief.urgency_level}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Opening Hook */}
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-medium text-slate-900 dark:text-white">
                Opening Hook
              </h3>
              <button
                onClick={() =>
                  copyToClipboard(research.messaging_brief.opening_hook)
                }
                className="px-2 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {copiedHook ? "Copied!" : "Copy"}
              </button>
            </div>
            <div className="p-4">
              <p className="text-slate-700 dark:text-slate-300 italic">
                "{research.messaging_brief.opening_hook}"
              </p>
            </div>
          </div>

          {/* Recommended Angles */}
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-medium text-slate-900 dark:text-white">
                Recommended Angles
              </h3>
            </div>
            <div className="p-4 space-y-2">
              {research.messaging_brief.recommended_angles.map((angle, index) => (
                <div key={index} className="flex items-start gap-3 text-sm">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-900 dark:bg-white flex items-center justify-center text-xs font-medium text-white dark:text-slate-900">
                    {index + 1}
                  </span>
                  <p className="text-slate-700 dark:text-slate-300">{angle}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Personalization Hooks */}
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-medium text-slate-900 dark:text-white">
                Personalization Hooks
              </h3>
            </div>
            <div className="p-4">
              <div className="flex flex-wrap gap-2">
                {research.messaging_brief.personalization_hooks.map((hook, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full text-sm text-slate-700 dark:text-slate-300"
                  >
                    {hook}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Buying Signals */}
          {allSignals.length > 0 && (
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-medium text-slate-900 dark:text-white">
                  Buying Signals ({allSignals.length})
                </h3>
              </div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                {allSignals.map((signal: BuyingSignal, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="text-xs uppercase tracking-wide text-slate-500">
                        {signal.type.replace("_", " ")}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-xs font-medium ${getStrengthStyle(
                          signal.strength
                        )}`}
                      >
                        {signal.strength}
                      </span>
                    </div>
                    <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                      {signal.title}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                      {signal.summary}
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                      <span>{signal.source}</span>
                      {signal.date && <span>• {signal.date}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tone Guidance */}
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-medium text-slate-900 dark:text-white">
                Tone Guidance
              </h3>
            </div>
            <div className="p-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {research.messaging_brief.tone_guidance}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 rounded-b-lg px-6 py-4">
          <div className="flex items-center justify-between">
            {hasSequence ? (
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                Sequence already running
              </span>
            ) : (
              <span />
            )}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
              {!hasSequence && (
                <button
                  onClick={() => setShowComposer(true)}
                  className="px-4 py-2 text-sm font-medium bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
                >
                  Start Sequence
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

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
