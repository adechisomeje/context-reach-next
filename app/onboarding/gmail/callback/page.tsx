"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { authFetch } from "@/lib/auth";
import { API_URL } from "@/lib/config";

export default function OnboardingGmailCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, refreshUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code");
      const errorParam = searchParams.get("error");

      if (errorParam) {
        setError(decodeURIComponent(errorParam));
        setProcessing(false);
        setTimeout(() => router.push("/onboarding"), 3000);
        return;
      }

      if (!code) {
        setError("No authorization code received");
        setProcessing(false);
        setTimeout(() => router.push("/onboarding"), 3000);
        return;
      }

      if (!user?.id) {
        // Wait for user to load
        return;
      }

      try {
        const response = await authFetch(
          `${API_URL}/api/oauth/google/callback?code=${encodeURIComponent(code)}&user_id=${user.id}&redirect_uri=${encodeURIComponent(window.location.origin + "/onboarding/gmail/callback")}`,
          { method: "POST" }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || "Failed to connect Gmail");
        }

        // Refresh user data to get updated gmail_connected status
        await refreshUser();
        
        // Redirect back to onboarding
        router.push("/onboarding");
      } catch (err) {
        console.error("Gmail callback error:", err);
        setError(err instanceof Error ? err.message : "Failed to connect Gmail");
        setProcessing(false);
        setTimeout(() => router.push("/onboarding"), 3000);
      }
    };

    if (user?.id) {
      handleCallback();
    }
  }, [searchParams, user?.id, router, refreshUser]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        {processing && !error ? (
          <>
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Connecting your Gmail...
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              Please wait while we complete the connection
            </p>
          </>
        ) : error ? (
          <>
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Connection Failed
            </h2>
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Redirecting back to onboarding...
            </p>
          </>
        ) : null}
      </div>
    </div>
  );
}
