"use client";

import { useState, useEffect, useCallback } from "react";
import { authFetch } from "@/lib/auth";
import { API_URL } from "@/lib/config";
import {
  SequenceStatusResponse,
  CreateSequenceRequest,
  CreateSequenceResponse,
  SequenceConfig,
  SignaturePayload,
} from "@/lib/types";

export function useSequence(contactId: string, campaignId?: string) {
  const [data, setData] = useState<SequenceStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const fetchSequence = useCallback(async (showLoading: boolean = false) => {
    if (!contactId) return;
    
    try {
      // Only show loading spinner on initial load
      if (showLoading) {
        setLoading(true);
      }
      setError(null);
      
      const url = campaignId
        ? `${API_URL}/api/sequence/${contactId}?campaign_id=${campaignId}`
        : `${API_URL}/api/sequence/${contactId}`;

      const res = await authFetch(url);
      
      if (res.status === 404) {
        // No sequence exists yet
        setData(null);
        return;
      }
      
      if (!res.ok) {
        throw new Error("Failed to fetch sequence");
      }

      setData(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  }, [contactId, campaignId]);

  useEffect(() => {
    // Show loading only on initial fetch
    fetchSequence(true);
    // Poll every 30 seconds for updates (without loading spinner)
    const interval = setInterval(() => fetchSequence(false), 30000);
    return () => clearInterval(interval);
  }, [fetchSequence]);

  const createSequence = async (
    config: SequenceConfig,
    signature?: SignaturePayload
  ): Promise<CreateSequenceResponse | null> => {
    if (!contactId || !campaignId) {
      setError("Contact ID and Campaign ID are required");
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      const request: CreateSequenceRequest = {
        contact_id: contactId,
        campaign_id: campaignId,
        sequence_config: config,
        signature,
      };

      const res = await authFetch(`${API_URL}/api/sequence/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to create sequence");
      }

      const result = await res.json();
      await fetchSequence(); // Refresh the data
      return result;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const pause = async () => {
    try {
      setError(null);
      const res = await authFetch(
        `${API_URL}/api/sequence/${contactId}/pause`,
        { method: "POST" }
      );
      if (!res.ok) throw new Error("Failed to pause sequence");
      await fetchSequence();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    }
  };

  const resume = async () => {
    try {
      setError(null);
      const res = await authFetch(
        `${API_URL}/api/sequence/${contactId}/resume`,
        { method: "POST" }
      );
      if (!res.ok) throw new Error("Failed to resume sequence");
      await fetchSequence();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    }
  };

  const cancel = async () => {
    try {
      setError(null);
      const res = await authFetch(
        `${API_URL}/api/sequence/${contactId}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to cancel sequence");
      await fetchSequence();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    }
  };

  return {
    data,
    loading,
    error,
    refetch: fetchSequence,
    createSequence,
    pause,
    resume,
    cancel,
    hasSequence: !!data?.sequence_state,
  };
}
