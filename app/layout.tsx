import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { AppShell } from "@/components/AppShell";
import { OnboardingGuard } from "@/components/OnboardingGuard";
import { AppTour } from "@/components/AppTour";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ContextReach",
  description: "AI-powered outreach platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <OnboardingGuard>
            <AppShell>{children}</AppShell>
            <AppTour />
          </OnboardingGuard>
        </AuthProvider>
      </body>
    </html>
  );
}
