"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { Sidebar } from "@/components/Sidebar";

const AUTH_ROUTES = ["/login", "/signup"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();

  const isAuthRoute = AUTH_ROUTES.includes(pathname);
  const isHomePage = pathname === "/";

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  // Auth routes (login/signup) - no sidebar
  if (isAuthRoute) {
    return <>{children}</>;
  }

  // Home page for unauthenticated users - show landing page without sidebar
  if (isHomePage && !isAuthenticated) {
    return <>{children}</>;
  }

  // Authenticated users - show sidebar
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <Sidebar />
        <main className="ml-64">{children}</main>
      </div>
    );
  }

  // Not authenticated and trying to access protected route - will redirect via AuthProvider
  return null;
}
