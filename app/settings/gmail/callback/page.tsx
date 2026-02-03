"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export default function GmailCallbackPage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const hasProcessed = useRef(false);
  
  // Store the initial onboarding state before any refresh
  const wasInOnboarding = useRef<boolean | null>(null);

  useEffect(() => {
    // Capture onboarding state on first render
    if (wasInOnboarding.current === null && user) {
      wasInOnboarding.current = !user.onboarding_completed;
    }
  }, [user]);

  useEffect(() => {
    // Prevent double processing
    if (hasProcessed.current) return;
    
    const params = new URLSearchParams(window.location.search);
    const connected = params.get("connected");
    const email = params.get("email");
    const error = params.get("error");

    if (error) {
      hasProcessed.current = true;
      setStatus("error");
      setMessage(decodeURIComponent(error));
      // Redirect after showing error
      setTimeout(() => {
        if (wasInOnboarding.current) {
          router.push(`/onboarding?gmail_error=${encodeURIComponent(error)}`);
        } else {
          router.push(`/settings?gmail_error=${encodeURIComponent(error)}`);
        }
      }, 2000);
      return;
    }

    if (connected === "true") {
      hasProcessed.current = true;
      setStatus("success");
      setMessage(email ? `Connected as ${email}` : "Gmail connected successfully!");
      // Refresh user and redirect
      refreshUser().then(() => {
        setTimeout(() => {
          // Redirect based on where user came from
          if (wasInOnboarding.current) {
            router.push("/onboarding?gmail_connected=true");
          } else {
            router.push("/settings?gmail_connected=true");
          }
        }, 1500);
      });
    } else if (!connected && !error) {
      hasProcessed.current = true;
      setStatus("error");
      setMessage("Connection was not completed");
      setTimeout(() => {
        if (wasInOnboarding.current) {
          router.push("/onboarding");
        } else {
          router.push("/settings");
        }
      }, 2000);
    }
  }, [router, user, refreshUser]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-8 text-center">
          {status === "loading" && (
            <>
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                <svg className="w-7 h-7 text-slate-600 dark:text-slate-400 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                Connecting Gmail...
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Please wait while we complete the connection.
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-4">
                <svg className="w-7 h-7 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                Gmail Connected!
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                {message}
              </p>
              <p className="text-sm text-slate-500 mt-4">
                Redirecting...
              </p>
            </>
          )}

          {status === "error" && (
            <>
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                <svg className="w-7 h-7 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                Connection Failed
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                {message}
              </p>
              <p className="text-sm text-slate-500 mt-4">
                Redirecting...
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
