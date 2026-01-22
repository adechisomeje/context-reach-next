"use client";

import { useState, useEffect, useCallback } from "react";
import { authFetch } from "@/lib/auth";
import {
  SequenceStatusResponse,
  CreateSequenceRequest,
  CreateSequenceResponse,
  SequenceConfig,
  SignaturePayload,
} from "@/lib/types";

const COMPOSE_API_URL = process.env.NEXT_PUBLIC_COMPOSE_API_URL || "http://localhost:8003";

export function useSequence(contactId: string, campaignId?: string) {
  const [data, setData] = useState<SequenceStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSequence = useCallback(async () => {
    if (!contactId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const url = campaignId
        ? `${COMPOSE_API_URL}/api/sequence/${contactId}?campaign_id=${campaignId}`
        : `${COMPOSE_API_URL}/api/sequence/${contactId}`;

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
    }
  }, [contactId, campaignId]);

  useEffect(() => {
    fetchSequence();
    // Poll every 30 seconds for updates
    const interval = setInterval(fetchSequence, 30000);
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

      const res = await authFetch(`${COMPOSE_API_URL}/api/sequence/create`, {
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
        `${COMPOSE_API_URL}/api/sequence/${contactId}/pause`,
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
        `${COMPOSE_API_URL}/api/sequence/${contactId}/resume`,
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
        `${COMPOSE_API_URL}/api/sequence/${contactId}`,
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
