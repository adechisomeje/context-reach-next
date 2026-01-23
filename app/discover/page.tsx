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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DiscoveryResponse, JobStatusResponse, TimingStrategy } from "@/lib/types";
import { authFetch } from "@/lib/auth";
import { useOrchestration, usePipelineStatus } from "@/hooks/useOrchestration";
import { PipelineProgress } from "@/components/PipelineProgress";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";
const POLL_INTERVAL = 2000;

type Mode = "auto" | "manual";
type DiscoveryStep = "form" | "progress" | "complete";

export default function DiscoverPage() {
  const router = useRouter();

  // Mode state
  const [mode, setMode] = useState<Mode>("manual");

  // Form state
  const [solution, setSolution] = useState("");
  const [maxContacts, setMaxContacts] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto mode sequence config
  const [maxSteps, setMaxSteps] = useState(3);
  const [timingStrategy, setTimingStrategy] = useState<TimingStrategy>("human_like");
  const [stopOnReply, setStopOnReply] = useState(true);

  // Manual mode discovery state
  const [step, setStep] = useState<DiscoveryStep>("form");
  const [discoveryResult, setDiscoveryResult] = useState<DiscoveryResponse | null>(null);
  const [jobProgress, setJobProgress] = useState<JobStatusResponse | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Auto mode state
  const [orchestrationId, setOrchestrationId] = useState<string | null>(null);
  const { startAutoMode, isStarting } = useOrchestration();
  const { status: pipelineStatus } = usePipelineStatus(orchestrationId);

  // Load mode from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem("contextreach_mode") as Mode;
    if (savedMode === "auto" || savedMode === "manual") {
      setMode(savedMode);
    }
  }, []);

  // Save mode to localStorage
  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    localStorage.setItem("contextreach_mode", newMode);
    handleStartNew();
  };

  const handleContactsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setMaxContacts(Math.min(50, Math.max(1, value)));
  };

  // Poll job status (Manual mode)
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

  const startPolling = useCallback(
    (jobId: string) => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
      pollJobStatus(jobId);
      pollingRef.current = setInterval(() => {
        pollJobStatus(jobId);
      }, POLL_INTERVAL);
    },
    [pollJobStatus]
  );

  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  // Handle Manual mode submit
  const handleManualSubmit = async () => {
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

  // Handle Auto mode submit
  const handleAutoSubmit = async () => {
    if (!solution.trim()) return;
    setError(null);

    const result = await startAutoMode(solution, maxContacts, {
      max_steps: maxSteps,
      stop_on_reply: stopOnReply,
      timing_strategy: timingStrategy,
    });

    if (result) {
      setOrchestrationId(result.orchestration_id);
      setStep("progress");
    }
  };

  const handleSubmit = () => {
    if (mode === "auto") {
      handleAutoSubmit();
    } else {
      handleManualSubmit();
    }
  };

  const handleViewCampaign = () => {
    if (mode === "auto" && pipelineStatus?.campaign_id) {
      router.push(`/campaigns/${pipelineStatus.campaign_id}`);
    } else if (discoveryResult?.campaign_id) {
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
    setOrchestrationId(null);
    setError(null);
  };

  // Form Step
  if (step === "form") {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Link href="/" className="text-sm text-slate-500 hover:text-slate-700">
              ← Back to Dashboard
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              New Discovery
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Describe your solution and we'll find your ideal prospects
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="mb-6">
            <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg w-fit">
              <Button
                variant={mode === "auto" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleModeChange("auto")}
                className="gap-2"
              >
                🚀 Auto Mode
              </Button>
              <Button
                variant={mode === "manual" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleModeChange("manual")}
                className="gap-2"
              >
                🎛️ Manual Mode
              </Button>
            </div>
            <p className="text-sm text-slate-500 mt-2">
              {mode === "auto" ? (
                <>
                  <strong>Auto Mode:</strong> One click starts the entire pipeline
                  — discovery, research, email composition, and scheduling all happen
                  automatically.
                </>
              ) : (
                <>
                  <strong>Manual Mode:</strong> Control each step of the process.
                  Review data between steps and trigger actions when ready.
                </>
              )}
            </p>
          </div>

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
                  placeholder="Example: biometric identity platform for securing distributed operations and eliminating fraud..."
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

              {/* Auto Mode: Sequence Config */}
              {mode === "auto" && (
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg space-y-4">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100">
                    📧 Email Sequence Settings
                  </h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Emails per Contact</Label>
                      <Select
                        value={maxSteps.toString()}
                        onValueChange={(v) => setMaxSteps(parseInt(v))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 email</SelectItem>
                          <SelectItem value="2">2 emails</SelectItem>
                          <SelectItem value="3">3 emails</SelectItem>
                          <SelectItem value="4">4 emails (with breakup)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Timing Strategy</Label>
                      <Select
                        value={timingStrategy}
                        onValueChange={(v) => setTimingStrategy(v as TimingStrategy)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="human_like">Human-like (2-4 days)</SelectItem>
                          <SelectItem value="aggressive">Aggressive (1-2 days)</SelectItem>
                          <SelectItem value="patient">Patient (5-7 days)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Stop on Reply</p>
                      <p className="text-xs text-slate-500">
                        Automatically stop sequence when they respond
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={stopOnReply}
                        onChange={(e) => setStopOnReply(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleSubmit}
                  disabled={!solution.trim() || isSubmitting || isStarting}
                  size="lg"
                  className="px-8"
                >
                  {isSubmitting || isStarting ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Starting...
                    </>
                  ) : mode === "auto" ? (
                    <>🚀 Start Auto Pipeline</>
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

  // Progress Step - Auto Mode
  if (mode === "auto" && orchestrationId) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Link href="/" className="text-sm text-slate-500 hover:text-slate-700">
              ← Back to Dashboard
            </Link>
          </div>

          <div className="mb-8">
            <div className="flex items-center gap-3">
              <Badge className="bg-blue-100 text-blue-800">🚀 Auto Mode</Badge>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Pipeline Running
              </h1>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Sit back and relax — everything is happening automatically
            </p>
          </div>

          {pipelineStatus ? (
            <PipelineProgress status={pipelineStatus} />
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <span className="text-4xl animate-spin inline-block">⏳</span>
                <p className="text-slate-500 mt-4">Starting pipeline...</p>
              </CardContent>
            </Card>
          )}

          <div className="mt-6 flex justify-center">
            {pipelineStatus?.status === "completed" ||
            pipelineStatus?.status === "failed" ? (
              <Button onClick={handleStartNew} variant="outline">
                🔄 Start New Discovery
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  // Progress Step - Manual Mode
  if (step === "progress" || step === "complete") {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Link href="/" className="text-sm text-slate-500 hover:text-slate-700">
              ← Back to Dashboard
            </Link>
          </div>

          <div className="mb-8">
            <div className="flex items-center gap-3">
              <Badge className="bg-slate-100 text-slate-800">🎛️ Manual Mode</Badge>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {step === "complete" ? "Discovery Complete" : "Discovery in Progress"}
              </h1>
            </div>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>
                {step === "complete" ? "🎉 Contacts Found!" : "🔍 Finding Contacts..."}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {discoveryResult?.target_criteria && (
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-3">
                  <h4 className="text-sm font-medium">AI-Generated Targeting</h4>
                  <div className="flex flex-wrap gap-2">
                    {discoveryResult.target_criteria.job_titles.map((title) => (
                      <Badge key={title} variant="secondary">{title}</Badge>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {discoveryResult.target_criteria.industries.map((industry) => (
                      <Badge key={industry} variant="outline">{industry}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {jobProgress && (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span className="font-medium">
                      {jobProgress.processed_contacts} / {jobProgress.total_contacts} contacts
                    </span>
                  </div>
                  <Progress value={jobProgress.progress} className="h-3" />
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                {step === "complete" ? (
                  <>
                    <Button onClick={handleViewCampaign} className="flex-1">
                      📊 View Campaign & Research Contacts
                    </Button>
                    <Button variant="outline" onClick={handleStartNew}>
                      🔄 New
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" onClick={handleStartNew} className="w-full">
                    Cancel
                  </Button>
                )}
              </div>

              {step === "complete" && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <h4 className="font-medium text-amber-800 mb-2">
                    📋 Next Steps (Manual Mode)
                  </h4>
                  <ol className="text-sm text-amber-700 space-y-1 list-decimal list-inside">
                    <li>View the campaign to see discovered contacts</li>
                    <li>Click "Research" on contacts you want to target</li>
                    <li>After research, click "Sequence" to create emails</li>
                    <li>Emails will be sent automatically at scheduled times</li>
                  </ol>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return null;
}
