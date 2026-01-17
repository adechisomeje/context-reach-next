"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DiscoveryResponse, JobStatusResponse } from "@/lib/types";
import { authFetch } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";
const POLL_INTERVAL = 2000; // 2 seconds

type DiscoveryStep = "form" | "progress" | "complete";

export default function DiscoverPage() {
  const router = useRouter();
  
  // Form state
  const [solution, setSolution] = useState("");
  const [maxContacts, setMaxContacts] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Discovery state
  const [step, setStep] = useState<DiscoveryStep>("form");
  const [discoveryResult, setDiscoveryResult] = useState<DiscoveryResponse | null>(null);
  const [jobProgress, setJobProgress] = useState<JobStatusResponse | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const handleContactsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setMaxContacts(Math.min(50, Math.max(1, value)));
  };

  // Poll job status
  const pollJobStatus = useCallback(async (jobId: string) => {
    try {
      const response = await authFetch(API_URL + "/api/discover/" + jobId);
      if (!response.ok) {
        throw new Error("Failed to get job status: " + response.status);
      }
      
      const data: JobStatusResponse = await response.json();
      setJobProgress(data);

      if (data.status === "completed") {
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
        setStep("complete");
      } else if (data.status === "failed") {
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
        setError(data.error || "Discovery failed");
      }
    } catch (err) {
      console.error("Polling failed:", err);
    }
  }, []);

  const startPolling = useCallback((jobId: string) => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }
    
    pollJobStatus(jobId);
    
    pollingRef.current = setInterval(() => {
      pollJobStatus(jobId);
    }, POLL_INTERVAL);
  }, [pollJobStatus]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  const handleSubmit = async () => {
    if (!solution.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await authFetch(API_URL + "/api/analyze-solution", {
        method: "POST",
        body: JSON.stringify({
          solution_description: solution,
          max_contacts: maxContacts,
          enrich_credits: maxContacts,
          auto_discover: true,
        }),
      });

      if (!response.ok) {
        throw new Error("API error: " + response.status);
      }

      const data: DiscoveryResponse = await response.json();
      setDiscoveryResult(data);
      setStep("progress");
      startPolling(data.job_id);
    } catch (err) {
      console.error("Discovery failed:", err);
      setError(err instanceof Error ? err.message : "Failed to start discovery");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewCampaign = () => {
    if (discoveryResult?.campaign_id) {
      router.push(`/campaigns/${discoveryResult.campaign_id}`);
    }
  };

  const handleStartNew = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    setStep("form");
    setSolution("");
    setMaxContacts(10);
    setDiscoveryResult(null);
    setJobProgress(null);
    setError(null);
  };

  // Form Step
  if (step === "form") {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8">
        <div className="max-w-2xl mx-auto">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link href="/" className="text-sm text-slate-500 hover:text-slate-700">
              ← Back to Dashboard
            </Link>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              New Discovery
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Describe your solution and we'll find your ideal prospects
            </p>
          </div>

          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>Describe Your Solution</CardTitle>
              <CardDescription>
                Be specific about what problem you solve and who you help
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="solution">Solution Description</Label>
                <Textarea
                  id="solution"
                  placeholder="Example: biometric identity platform for securing distributed operations and eliminating fraud. Companies can use it to authenticate users via face or fingerprint..."
                  value={solution}
                  onChange={(e) => setSolution(e.target.value)}
                  className="min-h-[180px] resize-none text-base"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxContacts">Max Contacts</Label>
                  <Input
                    id="maxContacts"
                    type="number"
                    min={1}
                    max={50}
                    value={maxContacts}
                    onChange={handleContactsChange}
                  />
                  <p className="text-xs text-slate-500">Maximum 50</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="enrichCredits">Enrich Credits</Label>
                  <Input
                    id="enrichCredits"
                    type="number"
                    value={maxContacts}
                    disabled
                    className="bg-slate-100"
                  />
                  <p className="text-xs text-slate-500">Matches max contacts</p>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleSubmit}
                  disabled={!solution.trim() || isSubmitting}
                  size="lg"
                  className="px-8"
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Starting...
                    </>
                  ) : (
                    <>🔍 Start Discovery</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Progress Step
  if (step === "progress" || step === "complete") {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8">
        <div className="max-w-2xl mx-auto">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link href="/" className="text-sm text-slate-500 hover:text-slate-700">
              ← Back to Dashboard
            </Link>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              {step === "complete" ? "✅ Discovery Complete!" : "Discovery in Progress"}
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              {step === "complete" 
                ? "Your contacts have been found and enriched"
                : "Finding and enriching contacts for you..."}
            </p>
          </div>

          {/* Progress Card */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              {/* Progress Bar */}
              {step !== "complete" && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      {jobProgress?.status === "processing" ? "Processing..." : "Starting..."}
                    </span>
                    <span className="text-sm text-slate-500">
                      {jobProgress?.progress || 0}%
                    </span>
                  </div>
                  <Progress value={jobProgress?.progress || 0} className="h-3" />
                </div>
              )}

              {/* Status Steps */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-green-600">✅</span>
                  <span className="text-sm">AI Analysis complete</span>
                </div>
                <div className="flex items-center gap-3">
                  {jobProgress && jobProgress.total_contacts > 0 ? (
                    <span className="text-green-600">✅</span>
                  ) : (
                    <span className="text-blue-600">🔄</span>
                  )}
                  <span className="text-sm">
                    {jobProgress 
                      ? `Found ${jobProgress.total_contacts} matching contacts`
                      : "Finding matching contacts..."}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {step === "complete" ? (
                    <span className="text-green-600">✅</span>
                  ) : (
                    <span className="text-blue-600">🔄</span>
                  )}
                  <span className="text-sm">
                    {step === "complete"
                      ? `Enriched ${jobProgress?.processed_contacts || 0} emails`
                      : `Enriching emails (${jobProgress?.processed_contacts || 0}/${jobProgress?.total_contacts || 0})...`}
                  </span>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                  {error}
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Generated Targeting */}
          {discoveryResult && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-base">AI Generated Targeting</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Job Titles */}
                <div>
                  <span className="text-xs text-slate-500 uppercase tracking-wide">Job Titles</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {discoveryResult.target_criteria.job_titles.map((title: string) => (
                      <Badge key={title} variant="secondary">{title}</Badge>
                    ))}
                  </div>
                </div>

                {/* Industries */}
                <div>
                  <span className="text-xs text-slate-500 uppercase tracking-wide">Industries</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {discoveryResult.target_criteria.industries.map((industry: string) => (
                      <Badge key={industry} variant="outline">{industry}</Badge>
                    ))}
                  </div>
                </div>

                {/* Company Sizes */}
                {discoveryResult.target_criteria.company_sizes.length > 0 && (
                  <div>
                    <span className="text-xs text-slate-500 uppercase tracking-wide">Company Sizes</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {discoveryResult.target_criteria.company_sizes.map((size: string) => (
                        <Badge key={size} variant="outline">{size}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          {step === "complete" && (
            <div className="flex justify-between">
              <Button variant="outline" onClick={handleStartNew}>
                ← Start New Discovery
              </Button>
              <Button onClick={handleViewCampaign}>
                View Campaign Results →
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
