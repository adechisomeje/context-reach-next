"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

// Pages that don't require onboarding check
const PUBLIC_PATHS = [
  "/login",
  "/signup",
  "/auth/callback",
  "/onboarding",
  "/onboarding/gmail/callback",
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
