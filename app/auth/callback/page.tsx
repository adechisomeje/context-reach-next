"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { setToken } from "@/lib/auth";
import { useAuth } from "@/components/AuthProvider";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    // Use window.location.search to get params immediately
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const error = params.get("error");
    const isNewUser = params.get("is_new_user") === "true";

    console.log("Auth callback - token:", token ? "present" : "missing", "error:", error);

    if (error) {
      // Handle error - redirect to login with error message
      router.push(`/login?error=${encodeURIComponent(error)}`);
      return;
    }

    if (token) {
      // Store the token using the auth library's setToken function
      setToken(token);
      setStatus("success");

      // Small delay to ensure token is stored, then refresh and redirect
      setTimeout(() => {
        refreshUser()
          .then(() => {
            console.log("User refreshed, redirecting...");
            router.push(isNewUser ? "/discover" : "/");
          })
          .catch((err) => {
            console.error("Refresh failed:", err);
            // Token is stored, redirect anyway
            router.push(isNewUser ? "/discover" : "/");
          });
      }, 100);
    } else {
      // No token received - redirect to login
      setStatus("error");
      setErrorMessage("No authentication token received");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    }
  }, [router, refreshUser]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="glass-card text-center">
          {status === "error" ? (
            <>
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-900/30 mb-4">
                <svg className="w-7 h-7 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Authentication Failed
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                {errorMessage || "Something went wrong"}
              </p>
            </>
          ) : (
            <>
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 mb-4 shadow-lg shadow-purple-500/25">
                <svg className="w-7 h-7 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                {status === "success" ? "Success!" : "Signing you in..."}
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                {status === "success" ? "Redirecting to dashboard..." : "Please wait while we complete your authentication."}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
