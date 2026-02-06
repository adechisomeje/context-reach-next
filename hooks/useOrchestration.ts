"use client";

import { useState, useEffect, useCallback } from "react";
import { authFetch } from "@/lib/auth";
import { API_URL } from "@/lib/config";
import {
  PipelineStatusResponse,
  AutoStartRequest,
  AutoStartResponse,
  ManualJobResponse,
  ManualJobStatusResponse,
  TimingStrategy,
  SequenceConfig,
  TargetRegion,
  SequenceCTA,
  DurationConfig,
  CampaignStatusResponse,
  CampaignAction,
} from "@/lib/types";

// Hook for Auto Mode pipeline status
export function usePipelineStatus(orchestrationId: string | null) {
  const [status, setStatus] = useState<PipelineStatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orchestrationId) {
      setStatus(null);
      return;
    }

    let isCancelled = false;
    let timeoutId: NodeJS.Timeout;

    const poll = async () => {
      if (isCancelled) return;

      try {
        setLoading(true);
        const response = await authFetch(
          `${API_URL}/api/orchestration/pipeline/${orchestrationId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch pipeline status");
        }

        const data: PipelineStatusResponse = await response.json();
        if (!isCancelled) {
          setStatus(data);
          setError(null);

          // Continue polling if not completed or failed
          if (data.status !== "completed" && data.status !== "failed") {
            timeoutId = setTimeout(poll, 3000);
          }
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    poll();

    return () => {
      isCancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [orchestrationId]);

  return { status, loading, error };
}

// Hook for Manual Mode job status
export function useManualJobStatus(jobId: string | null) {
  const [status, setStatus] = useState<ManualJobStatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) {
      setStatus(null);
      return;
    }

    let isCancelled = false;
    let timeoutId: NodeJS.Timeout;

    const poll = async () => {
      if (isCancelled) return;

      try {
        setLoading(true);
        const response = await authFetch(
          `${API_URL}/api/orchestration/manual/job/${jobId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch job status");
        }

        const data: ManualJobStatusResponse = await response.json();
        if (!isCancelled) {
          setStatus(data);
          setError(null);

          // Continue polling if in progress
          if (data.status === "in_progress" || data.status === "pending") {
            timeoutId = setTimeout(poll, 2000);
          }
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    poll();

    return () => {
      isCancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [jobId]);

  return { status, loading, error };
}

// Main orchestration hook with all actions
export function useOrchestration() {
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Start Auto Mode pipeline
  const startAutoMode = useCallback(
    async (
      solutionDescription: string,
      maxContacts: number,
      sequenceConfig?: Partial<SequenceConfig>,
      targetRegions?: TargetRegion[],
      targetCountries?: string[],
      cta?: SequenceCTA,
      durationConfig?: DurationConfig,
      targetListId?: string // Use target list instead of Apollo discovery
    ): Promise<AutoStartResponse | null> => {
      setIsStarting(true);
      setError(null);

      try {
        const request: AutoStartRequest = {
          solution_description: solutionDescription,
          max_contacts: maxContacts,
          enrich_credits: maxContacts,
          ...(targetRegions && targetRegions.length > 0 && { target_regions: targetRegions }),
          ...(targetCountries && targetCountries.length > 0 && { target_countries: targetCountries }),
          ...(targetListId && { target_list_id: targetListId }),
          sequence_config: {
            max_steps: sequenceConfig?.max_steps ?? 3,
            stop_on_reply: sequenceConfig?.stop_on_reply ?? true,
            timing_strategy: sequenceConfig?.timing_strategy ?? "human_like",
            ...(cta && { cta }),
          },
          ...(durationConfig && { duration_config: durationConfig }),
        };

        const response = await authFetch(
          `${API_URL}/api/orchestration/auto-start`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(request),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          // Handle insufficient credits (402)
          if (response.status === 402) {
            throw new Error(errorData.detail || "Insufficient credits");
          }
          throw new Error(errorData.detail || "Failed to start auto mode");
        }

        return await response.json();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        return null;
      } finally {
        setIsStarting(false);
      }
    },
    []
  );

  // Manual Mode: Research all contacts in a campaign
  const researchAll = useCallback(
    async (campaignId: string): Promise<ManualJobResponse | null> => {
      setIsStarting(true);
      setError(null);

      try {
        const response = await authFetch(
          `${API_URL}/api/orchestration/manual/research-all/${campaignId}`,
          { method: "POST" }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || "Failed to start research");
        }

        return await response.json();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        return null;
      } finally {
        setIsStarting(false);
      }
    },
    []
  );

  // Manual Mode: Compose all sequences for a campaign
  const composeAll = useCallback(
    async (
      campaignId: string,
      sequenceConfig?: Partial<SequenceConfig>
    ): Promise<ManualJobResponse | null> => {
      setIsStarting(true);
      setError(null);

      try {
        const response = await authFetch(
          `${API_URL}/api/orchestration/manual/compose-all/${campaignId}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sequence_config: {
                max_steps: sequenceConfig?.max_steps ?? 3,
                stop_on_reply: sequenceConfig?.stop_on_reply ?? true,
                timing_strategy: sequenceConfig?.timing_strategy ?? "human_like",
              },
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || "Failed to start composition");
        }

        return await response.json();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        return null;
      } finally {
        setIsStarting(false);
      }
    },
    []
  );

  return {
    startAutoMode,
    researchAll,
    composeAll,
    isStarting,
    error,
    clearError: () => setError(null),
  };
}

// Hook for multi-day campaign status
export function useCampaignStatus(campaignId: string | null) {
  const [status, setStatus] = useState<CampaignStatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!campaignId) return;
    
    try {
      setLoading(true);
      const response = await authFetch(
        `${API_URL}/api/orchestration/campaign/${campaignId}/status`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch campaign status");
      }

      const data: CampaignStatusResponse = await response.json();
      setStatus(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    if (!campaignId) {
      setStatus(null);
      return;
    }

    refresh();

    // Poll every 30 seconds for active campaigns
    const interval = setInterval(() => {
      if (status?.status === 'active' || status?.status === 'paused') {
        refresh();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [campaignId, refresh, status?.status]);

  return { status, loading, error, refresh };
}

// Hook for campaign actions (pause, resume, cancel)
export function useCampaignActions() {
  const [loading, setLoading] = useState<CampaignAction | null>(null);
  const [error, setError] = useState<string | null>(null);

  const performAction = useCallback(
    async (campaignId: string, action: CampaignAction): Promise<CampaignStatusResponse | null> => {
      setLoading(action);
      setError(null);

      try {
        const response = await authFetch(
          `${API_URL}/api/orchestration/campaign/${campaignId}/${action}`,
          { method: "POST" }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || `Failed to ${action} campaign`);
        }

        return await response.json();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        return null;
      } finally {
        setLoading(null);
      }
    },
    []
  );

  const pauseCampaign = useCallback(
    (campaignId: string) => performAction(campaignId, "pause"),
    [performAction]
  );

  const resumeCampaign = useCallback(
    (campaignId: string) => performAction(campaignId, "resume"),
    [performAction]
  );

  const cancelCampaign = useCallback(
    (campaignId: string) => performAction(campaignId, "cancel"),
    [performAction]
  );

  return {
    pauseCampaign,
    resumeCampaign,
    cancelCampaign,
    loading,
    error,
    clearError: () => setError(null),
  };
}
