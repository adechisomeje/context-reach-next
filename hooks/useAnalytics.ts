"use client";

import { useState, useEffect, useCallback } from "react";
import { authFetch } from "@/lib/auth";
import {
  CampaignAnalytics,
  ContactEventsResponse,
  MessageEventsResponse,
} from "@/lib/types";

const DELIVERY_API_URL = process.env.NEXT_PUBLIC_DELIVERY_API_URL || "http://localhost:8004";

export function useCampaignAnalytics(campaignId: string) {
  const [analytics, setAnalytics] = useState<CampaignAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    if (!campaignId) return;

    try {
      setLoading(true);
      setError(null);

      const res = await authFetch(
        `${DELIVERY_API_URL}/api/analytics/campaign/${campaignId}`
      );

      if (res.status === 404) {
        // No analytics yet
        setAnalytics(null);
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to fetch analytics");
      }

      setAnalytics(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    fetchAnalytics();
    // Poll every 60 seconds for updates
    const interval = setInterval(fetchAnalytics, 60000);
    return () => clearInterval(interval);
  }, [fetchAnalytics]);

  return { analytics, loading, error, refetch: fetchAnalytics };
}

export function useContactEvents(contactId: string) {
  const [events, setEvents] = useState<ContactEventsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    if (!contactId) return;

    try {
      setLoading(true);
      setError(null);

      const res = await authFetch(
        `${DELIVERY_API_URL}/api/events/contact/${contactId}`
      );

      if (res.status === 404) {
        setEvents(null);
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to fetch events");
      }

      setEvents(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [contactId]);

  useEffect(() => {
    fetchEvents();
    // Poll every 30 seconds for updates
    const interval = setInterval(fetchEvents, 30000);
    return () => clearInterval(interval);
  }, [fetchEvents]);

  return { events, loading, error, refetch: fetchEvents };
}

export function useMessageEvents(messageId: string) {
  const [events, setEvents] = useState<MessageEventsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    if (!messageId) return;

    try {
      setLoading(true);
      setError(null);

      const res = await authFetch(
        `${DELIVERY_API_URL}/api/events/message/${messageId}`
      );

      if (res.status === 404) {
        setEvents(null);
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to fetch events");
      }

      setEvents(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [messageId]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return { events, loading, error, refetch: fetchEvents };
}
