"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { authFetch } from "@/lib/auth";
import { API_URL, DELIVERY_URL } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Icons
const Icons = {
  Check: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  Mail: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  Signature: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  ),
  Google: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  ),
  Loader: () => (
    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  ),
  ArrowRight: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  ),
};

// Default signature template
const DEFAULT_SIGNATURE_HTML = `<p>Best regards,</p>
<p><strong>Your Name</strong></p>
<p>Your Title</p>
<p>Your Company</p>`;

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

export default function OnboardingPage() {
  const router = useRouter();
  const { user, refreshUser, isLoading: authLoading } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Signature form state
  const [signatureName, setSignatureName] = useState("Default Signature");
  const [signatureHtml, setSignatureHtml] = useState(DEFAULT_SIGNATURE_HTML);
  
  // Gmail connection state
  const [gmailConnecting, setGmailConnecting] = useState(false);

  // Check for callback params from Gmail OAuth
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const gmailConnected = params.get("gmail_connected");
    const gmailError = params.get("gmail_error");
    
    if (gmailConnected === "true") {
      setSuccessMessage("Gmail connected successfully!");
      // Clear the URL params
      window.history.replaceState({}, "", "/onboarding");
      // Refresh user to get updated status, then complete onboarding
      refreshUser().then(() => {
        // Auto-complete onboarding after Gmail is connected
        completeOnboarding();
      });
    }
    
    if (gmailError) {
      setError(decodeURIComponent(gmailError));
      window.history.replaceState({}, "", "/onboarding");
    }
  }, []);
  
  // Function to complete onboarding
  const completeOnboarding = async () => {
    try {
      const response = await authFetch(`${API_URL}/api/settings/onboarding/complete`, {
        method: "POST",
      });

      if (!response.ok) {
        console.error("Failed to complete onboarding");
        return;
      }

      await refreshUser();
      // Redirect to dashboard with tour parameter to start the app tour
      router.push("/dashboard?tour=true");
    } catch (err) {
      console.error("Error completing onboarding:", err);
    }
  };

  // Function to skip onboarding
  const handleSkipOnboarding = async () => {
    try {
      const response = await authFetch(`${API_URL}/api/settings/onboarding/skip`, {
        method: "POST",
      });

      if (!response.ok) {
        console.error("Failed to skip onboarding");
        // Still redirect even if API fails - we'll prompt them later
      }

      await refreshUser();
      router.push("/dashboard?tour=true");
    } catch (err) {
      console.error("Error skipping onboarding:", err);
      // Still redirect - we'll prompt them later
      router.push("/dashboard");
    }
  };

  // Redirect if already completed onboarding
  useEffect(() => {
    if (!authLoading && user?.onboarding_completed) {
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  // Set initial step based on user status
  useEffect(() => {
    if (user) {
      if (user.has_signature && !user.gmail_connected) {
        setCurrentStep(2);
      } else if (!user.has_signature) {
        setCurrentStep(1);
      }
      
      // Pre-fill signature HTML with user data
      if (user.first_name || user.last_name || user.company_name) {
        const name = `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Your Name";
        const company = user.company_name || "Your Company";
        setSignatureHtml(`<p>Best regards,</p>
<p><strong>${name}</strong></p>
<p>Your Title</p>
<p>${company}</p>`);
      }
    }
  }, [user]);

  const steps: OnboardingStep[] = [
    {
      id: 1,
      title: "Create Email Signature",
      description: "Set up your professional email signature",
      completed: user?.has_signature || false,
    },
    {
      id: 2,
      title: "Connect Gmail",
      description: "Allow ContextReach to send emails on your behalf",
      completed: user?.gmail_connected || false,
    },
  ];

  const handleCreateSignature = async () => {
    if (!signatureName.trim()) {
      setError("Please enter a signature name");
      return;
    }
    if (!signatureHtml.trim()) {
      setError("Please enter your signature HTML content");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await authFetch(`${API_URL}/api/settings/signatures`, {
        method: "POST",
        body: JSON.stringify({
          name: signatureName,
          html_content: signatureHtml,
          is_default: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to create signature");
      }

      setSuccessMessage("Signature created successfully!");
      await refreshUser();
      
      // Move to next step after a brief delay
      setTimeout(() => {
        setCurrentStep(2);
        setSuccessMessage(null);
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create signature");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectGmail = async () => {
    if (!user?.id) {
      setError("User not authenticated");
      return;
    }

    setGmailConnecting(true);
    setError(null);

    try {
      const response = await authFetch(`${DELIVERY_URL}/api/oauth/google/auth-url?user_id=${user.id}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to get Gmail authorization URL");
      }

      const data = await response.json();
      window.location.href = data.auth_url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect Gmail");
      setGmailConnecting(false);
    }
  };

  const handleCompleteOnboarding = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await completeOnboarding();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to complete onboarding");
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  if (!user) {
    router.push("/signin");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container max-w-4xl mx-auto px-4 py-12">
        {/* Skip Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={handleSkipOnboarding}
            className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors flex items-center gap-1"
          >
            Skip for now
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
            Welcome to ContextReach, {user.first_name}!
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Let&apos;s get you set up in just a few minutes
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    step.completed
                      ? "bg-green-500 text-white"
                      : currentStep === step.id
                      ? "bg-blue-600 text-white"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-500"
                  }`}
                >
                  {step.completed ? (
                    <Icons.Check />
                  ) : (
                    <span className="font-semibold">{step.id}</span>
                  )}
                </div>
                <span className={`mt-2 text-sm font-medium ${
                  currentStep === step.id
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-slate-500 dark:text-slate-400"
                }`}>
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-24 h-1 mx-4 rounded ${
                  step.completed
                    ? "bg-green-500"
                    : "bg-slate-200 dark:bg-slate-700"
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-center">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-600 dark:text-green-400 text-center">
            {successMessage}
          </div>
        )}

        {/* Step Content */}
        <div className="max-w-2xl mx-auto">
          {/* Step 1: Create Signature */}
          {currentStep === 1 && (
            <Card className="border-slate-200 dark:border-slate-800 shadow-lg">
              <CardHeader className="text-center pb-2">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Icons.Signature />
                </div>
                <CardTitle className="text-2xl">Create Your Email Signature</CardTitle>
                <CardDescription className="text-base">
                  This signature will be automatically added to all your outreach emails
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="signatureName">Signature Name *</Label>
                  <Input
                    id="signatureName"
                    value={signatureName}
                    onChange={(e) => setSignatureName(e.target.value)}
                    placeholder="e.g., Work Signature"
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="html_content">HTML Content *</Label>
                    <textarea
                      id="html_content"
                      placeholder="<p>Best regards,</p>&#10;<p><strong>Your Name</strong></p>"
                      value={signatureHtml}
                      onChange={(e) => setSignatureHtml(e.target.value)}
                      className="w-full h-48 px-3 py-2 rounded-md border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 text-sm font-mono resize-y"
                      required
                    />
                    <p className="text-xs text-slate-500">
                      Use HTML tags like &lt;p&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;br&gt;, &lt;a&gt; to format your signature
                    </p>
                  </div>

                  {/* Live Preview */}
                  <div className="space-y-2">
                    <Label>Preview</Label>
                    <div className="h-48 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 overflow-auto">
                      <div
                        className="text-sm text-slate-700 dark:text-slate-300"
                        dangerouslySetInnerHTML={{ __html: signatureHtml }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    onClick={handleCreateSignature}
                    disabled={isLoading || !signatureName.trim() || !signatureHtml.trim()}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-base"
                  >
                    {isLoading ? (
                      <>
                        <Icons.Loader />
                        <span className="ml-2">Creating...</span>
                      </>
                    ) : (
                      <>
                        Continue
                        <Icons.ArrowRight />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Connect Gmail */}
          {currentStep === 2 && (
            <Card className="border-slate-200 dark:border-slate-800 shadow-lg">
              <CardHeader className="text-center pb-2">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Icons.Mail />
                </div>
                <CardTitle className="text-2xl">Connect Your Gmail</CardTitle>
                <CardDescription className="text-base">
                  Allow ContextReach to send personalized emails on your behalf
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-6 space-y-4">
                  <h4 className="font-medium text-slate-900 dark:text-white">Why connect Gmail?</h4>
                  <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                    <li className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icons.Check />
                      </div>
                      <span>Automatically send personalized outreach emails</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icons.Check />
                      </div>
                      <span>Track email opens and responses</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icons.Check />
                      </div>
                      <span>Maintain your sender reputation with Gmail&apos;s infrastructure</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    <strong>Note:</strong> We only request permission to send emails. We never read your inbox or access your contacts.
                  </p>
                </div>

                {user?.gmail_connected ? (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-center">
                    <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                      <Icons.Check />
                      <span className="font-medium">Gmail Connected Successfully!</span>
                    </div>
                  </div>
                ) : null}

                <div className="pt-4 space-y-3">
                  {!user?.gmail_connected && (
                    <Button
                      onClick={handleConnectGmail}
                      disabled={gmailConnecting}
                      className="w-full bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 h-12 text-base"
                    >
                      {gmailConnecting ? (
                        <>
                          <Icons.Loader />
                          <span className="ml-2">Connecting...</span>
                        </>
                      ) : (
                        <>
                          <Icons.Google />
                          <span className="ml-2">Connect with Google</span>
                        </>
                      )}
                    </Button>
                  )}

                  {user?.gmail_connected && (
                    <Button
                      onClick={handleCompleteOnboarding}
                      disabled={isLoading}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-base"
                    >
                      {isLoading ? (
                        <>
                          <Icons.Loader />
                          <span className="ml-2">Finishing...</span>
                        </>
                      ) : (
                        <>
                          Get Started
                          <Icons.ArrowRight />
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Skip for now (optional) */}
        <div className="text-center mt-8">
          <button
            onClick={handleSkipOnboarding}
            className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline"
          >
            Skip for now (you can complete this later in Settings)
          </button>
        </div>
      </div>
    </div>
  );
}
