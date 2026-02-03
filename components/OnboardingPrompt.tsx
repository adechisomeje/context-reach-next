"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";

interface OnboardingPromptProps {
  onClose: () => void;
}

export function OnboardingPromptModal({ onClose }: OnboardingPromptProps) {
  const router = useRouter();
  const { user } = useAuth();

  const missingSteps = [];
  if (!user?.has_signature) {
    missingSteps.push("Create an email signature");
  }
  if (!user?.gmail_connected) {
    missingSteps.push("Connect your Gmail account");
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold">Complete Your Setup</h2>
              <p className="text-white/80 text-sm">Required to start outreach</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Before you can discover prospects and send emails, please complete the following:
          </p>

          <div className="space-y-3 mb-6">
            {missingSteps.map((step, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg"
              >
                <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  {step}
                </span>
              </div>
            ))}
          </div>

          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-2">Why is this needed?</h4>
            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
              <li>• Your email signature will be added to all outreach emails</li>
              <li>• Gmail connection allows us to send emails on your behalf</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Maybe Later
            </Button>
            <Button
              className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
              onClick={() => router.push("/onboarding")}
            >
              Complete Setup
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook to check if onboarding is required
export function useOnboardingCheck() {
  const { user } = useAuth();
  const [showPrompt, setShowPrompt] = useState(false);

  const isOnboardingIncomplete = user && !user.onboarding_completed && (!user.has_signature || !user.gmail_connected);

  const checkOnboarding = (): boolean => {
    if (isOnboardingIncomplete) {
      setShowPrompt(true);
      return false; // Onboarding not complete
    }
    return true; // Onboarding complete, proceed
  };

  const closePrompt = () => setShowPrompt(false);

  return {
    isOnboardingIncomplete,
    showPrompt,
    checkOnboarding,
    closePrompt,
  };
}
