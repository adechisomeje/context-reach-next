"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

// Pages that don't require onboarding check (public pages)
const PUBLIC_PATHS = [
  "/",
  "/signin",
  "/login", // Keep for backwards compatibility
  "/signup",
  "/auth/callback",
  "/onboarding",
  "/onboarding/gmail/callback",
  "/privacy",
  "/terms",
];

// Pages that should skip onboarding check (settings allows completing onboarding)
const SKIP_ONBOARDING_PATHS = [
  "/settings",
  "/settings/gmail/callback",
];

interface OnboardingGuardProps {
  children: React.ReactNode;
}

export function OnboardingGuard({ children }: OnboardingGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    // Don't redirect while loading
    if (isLoading) return;

    // Don't check for public paths
    if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) return;

    // Don't redirect if not authenticated (let AuthProvider handle that)
    if (!isAuthenticated || !user) return;

    // Allow access to settings even if onboarding not complete
    if (SKIP_ONBOARDING_PATHS.some(path => pathname.startsWith(path))) return;

    // Redirect to onboarding if not completed
    if (!user.onboarding_completed) {
      router.push("/onboarding");
    }
  }, [isLoading, isAuthenticated, user, pathname, router]);

  return <>{children}</>;
}
