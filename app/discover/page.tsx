"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DiscoveryResponse, JobStatusResponse, TimingStrategy, TargetRegion, RegionInfo } from "@/lib/types";
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

  // Target location state
  const [availableRegions, setAvailableRegions] = useState<Record<string, RegionInfo>>({});
  const [selectedRegions, setSelectedRegions] = useState<TargetRegion[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [locationMode, setLocationMode] = useState<"regions" | "countries">("regions");
  const [regionsLoading, setRegionsLoading] = useState(false);

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

  // Fetch available regions
  useEffect(() => {
    const fetchRegions = async () => {
      setRegionsLoading(true);
      try {
        const response = await authFetch(`${API_URL}/api/regions`);
        if (response.ok) {
          const data = await response.json();
          setAvailableRegions(data.regions || data);
        }
      } catch (err) {
        console.error("Failed to fetch regions:", err);
      } finally {
        setRegionsLoading(false);
      }
    };
    fetchRegions();
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
          ...(locationMode === "regions" && selectedRegions.length > 0 && { target_regions: selectedRegions }),
          ...(locationMode === "countries" && selectedCountries.length > 0 && { target_countries: selectedCountries }),
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

    const result = await startAutoMode(
      solution, 
      maxContacts, 
      {
        max_steps: maxSteps,
        stop_on_reply: stopOnReply,
        timing_strategy: timingStrategy,
      },
      locationMode === "regions" ? selectedRegions : undefined,
      locationMode === "countries" ? selectedCountries : undefined
    );

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
    setSelectedRegions([]);
    setSelectedCountries([]);
    setLocationMode("regions");
  };

  // Form Step
  if (step === "form") {
    return (
      <div className="h-screen flex flex-col bg-white dark:bg-slate-950">
        {/* Page Header */}
        <div className="flex-shrink-0 border-b border-slate-200 dark:border-slate-800">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-slate-900 dark:text-white">New Discovery</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Find leads matching your ideal customer profile
                </p>
              </div>
              <Link href="/campaigns">
                <button className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
                  Cancel
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-2xl mx-auto px-6 py-8">
            {/* Mode Toggle */}
            <div className="mb-6 p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-white">Mode</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {mode === "auto" 
                      ? "Fully automated — discovery to sending" 
                      : "Step-by-step control"}
                  </p>
                </div>
                <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  <button
                    onClick={() => handleModeChange("auto")}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      mode === "auto"
                        ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                        : "text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    ⚡ Auto
                  </button>
                  <button
                    onClick={() => handleModeChange("manual")}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      mode === "manual"
                        ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                        : "text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    Manual
                  </button>
                </div>
              </div>
            </div>

            {/* Main Form */}
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="p-6 space-y-6">
                {/* Solution Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                    Solution Description
                  </label>
                  <textarea
                    placeholder="Example: We provide a biometric identity platform for securing distributed operations and eliminating fraud in logistics and supply chain..."
                    value={solution}
                    onChange={(e) => setSolution(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white/20 focus:border-transparent resize-none min-h-[120px]"
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    Be specific about what problem you solve and who benefits
                  </p>
                </div>

                {/* Settings Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                      Max Contacts
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={maxContacts}
                      onChange={handleContactsChange}
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white/20 focus:border-transparent"
                    />
                    <p className="text-xs text-slate-500 mt-1">Maximum 50</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                      Credits Used
                    </label>
                    <input
                      type="number"
                      value={maxContacts}
                      disabled
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg opacity-60 cursor-not-allowed"
                    />
                    <p className="text-xs text-slate-500 mt-1">Matches max contacts</p>
                  </div>
                </div>

                {/* Auto Mode Settings */}
                {mode === "auto" && (
                  <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <h4 className="font-medium text-slate-900 dark:text-white mb-4">
                      📧 Email Sequence Settings
                    </h4>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Emails per Contact
                        </label>
                        <Select
                          value={maxSteps.toString()}
                          onValueChange={(v) => setMaxSteps(parseInt(v))}
                        >
                          <SelectTrigger className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 email</SelectItem>
                            <SelectItem value="2">2 emails</SelectItem>
                            <SelectItem value="3">3 emails</SelectItem>
                            <SelectItem value="4">4 emails</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Timing Strategy
                        </label>
                        <Select
                          value={timingStrategy}
                          onValueChange={(v) => setTimingStrategy(v as TimingStrategy)}
                        >
                          <SelectTrigger className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg">
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

                    <div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">Stop on Reply</p>
                        <p className="text-xs text-slate-500">Auto stop when they respond</p>
                      </div>
                      <button
                        onClick={() => setStopOnReply(!stopOnReply)}
                        className={`w-10 h-6 rounded-full transition-all relative ${
                          stopOnReply ? 'bg-slate-900 dark:bg-white' : 'bg-slate-300 dark:bg-slate-600'
                        }`}
                      >
                        <div 
                          className={`w-4 h-4 rounded-full absolute top-1 transition-transform ${
                            stopOnReply 
                              ? 'translate-x-5 bg-white dark:bg-slate-900' 
                              : 'translate-x-1 bg-white'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                )}

                {/* Target Location Settings - Available for both modes */}
                <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  <h4 className="font-medium text-slate-900 dark:text-white mb-4">
                    🌍 Target Location
                  </h4>

                  {/* Location Mode Toggle */}
                  <div className="flex gap-2 mb-4">
                    <button
                        onClick={() => {
                          setLocationMode("regions");
                          setSelectedCountries([]);
                        }}
                        className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          locationMode === "regions"
                            ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                            : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        By Region
                      </button>
                      <button
                        onClick={() => {
                          setLocationMode("countries");
                          setSelectedRegions([]);
                        }}
                        className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          locationMode === "countries"
                            ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                            : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        By Country
                      </button>
                    </div>

                    {regionsLoading ? (
                      <div className="flex items-center gap-2 py-4 text-sm text-slate-500">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Loading locations...
                      </div>
                    ) : locationMode === "regions" ? (
                      <div className="space-y-2">
                        <p className="text-xs text-slate-500 mb-2">Select one or more regions to target</p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(availableRegions).map(([key, region]) => {
                            const isSelected = selectedRegions.includes(key as TargetRegion);
                            return (
                              <button
                                key={key}
                                onClick={() => {
                                  if (isSelected) {
                                    setSelectedRegions(selectedRegions.filter(r => r !== key));
                                  } else {
                                    setSelectedRegions([...selectedRegions, key as TargetRegion]);
                                  }
                                }}
                                className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                                  isSelected
                                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-slate-400"
                                }`}
                              >
                                {region.name}
                              </button>
                            );
                          })}
                        </div>
                        {selectedRegions.length === 0 && (
                          <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                            No region selected — will default to Global
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-xs text-slate-500 mb-2">Select specific countries to target</p>
                        <div className="max-h-48 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg">
                          {Object.entries(availableRegions).map(([regionKey, region]) => (
                            <div key={regionKey} className="border-b border-slate-200 dark:border-slate-700 last:border-0">
                              <div className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400">
                                {region.name}
                              </div>
                              <div className="p-2 flex flex-wrap gap-1">
                                {region.countries.map((country) => {
                                  const isSelected = selectedCountries.includes(country);
                                  return (
                                    <button
                                      key={country}
                                      onClick={() => {
                                        if (isSelected) {
                                          setSelectedCountries(selectedCountries.filter(c => c !== country));
                                        } else {
                                          setSelectedCountries([...selectedCountries, country]);
                                        }
                                      }}
                                      className={`px-2 py-1 text-xs rounded transition-colors ${
                                        isSelected
                                          ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                                      }`}
                                    >
                                      {country}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                        {selectedCountries.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            <span className="text-xs text-slate-500">Selected:</span>
                            {selectedCountries.map(country => (
                              <span
                                key={country}
                                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-full"
                              >
                                {country}
                                <button
                                  onClick={() => setSelectedCountries(selectedCountries.filter(c => c !== country))}
                                  className="hover:opacity-70"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                        {selectedCountries.length === 0 && (
                          <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                            No country selected — will default to Global
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                {/* Error */}
                {error && (
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
                    {error}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <button
                  onClick={handleSubmit}
                  disabled={!solution.trim() || isSubmitting || isStarting}
                  className="w-full px-4 py-2.5 text-sm font-medium bg-slate-900 text-white rounded-lg hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting || isStarting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Starting...
                    </span>
                  ) : mode === "auto" ? (
                    "⚡ Start Auto Pipeline"
                  ) : (
                    "Start Discovery"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Progress Step - Auto Mode
  if (mode === "auto" && orchestrationId) {
    return (
      <div className="h-screen flex flex-col bg-white dark:bg-slate-950">
        {/* Page Header */}
        <div className="flex-shrink-0 border-b border-slate-200 dark:border-slate-800">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 rounded">⚡ Auto Mode</span>
                </div>
                <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Pipeline Running</h1>
              </div>
              <Link href="/campaigns">
                <button className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
                  Back to Campaigns
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-2xl mx-auto">
            {pipelineStatus ? (
              <PipelineProgress status={pipelineStatus} />
            ) : (
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center">
                <div className="flex items-center justify-center mb-4">
                  <svg className="animate-spin h-8 w-8 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <p className="text-slate-500">Starting pipeline...</p>
              </div>
            )}

            <div className="mt-6 flex justify-center gap-3">
              {(pipelineStatus?.status === "completed" || pipelineStatus?.status === "failed") ? (
                <>
                  {pipelineStatus?.campaign_id && (
                    <button onClick={handleViewCampaign} className="px-4 py-2 text-sm font-medium bg-slate-900 text-white rounded-lg hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition-colors">
                      View Campaign
                    </button>
                  )}
                  <button onClick={handleStartNew} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    Start New
                  </button>
                </>
              ) : (
                <p className="text-sm text-slate-500">
                  You can safely leave this page. Check campaigns for progress.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Progress Step - Manual Mode
  if (step === "progress" || step === "complete") {
    const progress = jobProgress?.progress || 0;
    const isComplete = step === "complete";

    return (
      <div className="h-screen flex flex-col bg-white dark:bg-slate-950">
        {/* Page Header */}
        <div className="flex-shrink-0 border-b border-slate-200 dark:border-slate-800">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 rounded">Manual Mode</span>
                </div>
                <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
                  {isComplete ? "Discovery Complete" : "Discovery in Progress"}
                </h1>
              </div>
              <Link href="/campaigns">
                <button className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
                  Back to Campaigns
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-2xl mx-auto">
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-900 dark:text-white">Progress</span>
                  <span className="text-sm text-slate-500">{progress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-slate-900 dark:bg-white rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <p className="text-2xl font-semibold text-slate-900 dark:text-white">
                    {jobProgress?.total_contacts || 0}
                  </p>
                  <p className="text-xs text-slate-500">Total</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <p className="text-2xl font-semibold text-slate-900 dark:text-white">
                    {jobProgress?.processed_contacts || 0}
                  </p>
                  <p className="text-xs text-slate-500">Processed</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <p className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
                    {progress}%
                  </p>
                  <p className="text-xs text-slate-500">Complete</p>
                </div>
              </div>

              {/* Status */}
              {!isComplete && (
                <div className="flex items-center justify-center gap-2 text-slate-500">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-sm capitalize">{jobProgress?.status || "Processing"}...</span>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-center gap-3">
              {isComplete ? (
                <>
                  <button onClick={handleViewCampaign} className="px-4 py-2 text-sm font-medium bg-slate-900 text-white rounded-lg hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition-colors">
                    View Campaign
                  </button>
                  <button onClick={handleStartNew} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    Start New
                  </button>
                </>
              ) : (
                <button onClick={handleStartNew} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  Cancel
                </button>
              )}
            </div>

            {/* Next Steps */}
            {isComplete && (
              <div className="mt-6 p-4 rounded-lg border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-900/20">
                <h4 className="font-medium text-amber-800 dark:text-amber-400 mb-2">
                  Next Steps
                </h4>
                <ol className="text-sm text-amber-700 dark:text-amber-300 space-y-1 list-decimal list-inside">
                  <li>View the campaign to see discovered contacts</li>
                  <li>Click &quot;Research&quot; on contacts to target</li>
                  <li>After research, click &quot;Sequence&quot; to create emails</li>
                  <li>Emails will be sent at scheduled times</li>
                </ol>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
