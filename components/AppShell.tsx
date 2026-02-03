"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { Sidebar } from "@/components/Sidebar";

// Routes that don't need the sidebar and are accessible without auth
const PUBLIC_ROUTES = ["/", "/signin", "/login", "/signup", "/auth/callback", "/privacy", "/terms"];

// Routes that need auth but shouldn't show sidebar
const CALLBACK_ROUTES = ["/settings/gmail/callback", "/onboarding", "/onboarding/gmail/callback"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname) || pathname.startsWith("/auth/");
  const isCallbackRoute = CALLBACK_ROUTES.some(route => pathname.startsWith(route));
  const isLandingPage = pathname === "/";

  // Show loading state (but not for public routes - let them render immediately)
  if (isLoading && !isPublicRoute) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  // Public routes (landing/login/signup/callback/privacy/terms) - no sidebar, render immediately
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Landing page for unauthenticated users - show landing page without sidebar
  if (isLandingPage && !isAuthenticated) {
    return <>{children}</>;
  }

  // Authenticated users on callback/onboarding routes - no sidebar
  if (isAuthenticated && isCallbackRoute) {
    return <>{children}</>;
  }

  // Authenticated users - show sidebar
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950">
        <Sidebar />
        <main className="ml-60">{children}</main>
      </div>
    );
  }

  // Not authenticated and trying to access protected route - will redirect via AuthProvider
  // Show loading state while redirect happens
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
      <div className="text-slate-500">Redirecting...</div>
    </div>
  );
}
