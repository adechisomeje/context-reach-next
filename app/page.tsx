"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Campaign, CampaignsResponse } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

export default function DashboardPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"manual" | "auto">("manual");

  // Load mode from localStorage on mount
  useEffect(() => {
    const savedMode = localStorage.getItem("contextreach_mode") as "manual" | "auto";
    if (savedMode) {
      setMode(savedMode);
    }
  }, []);

  // Save mode to localStorage when it changes
  const handleModeChange = (newMode: "manual" | "auto") => {
    setMode(newMode);
    localStorage.setItem("contextreach_mode", newMode);
  };

  const fetchCampaigns = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/campaigns`);
      if (!response.ok) {
        throw new Error(`Failed to fetch campaigns: ${response.status}`);
      }
      const data: CampaignsResponse = await response.json();
      setCampaigns(data.campaigns);
    } catch (err) {
      console.error("Failed to fetch campaigns:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch campaigns");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const getStatusIcon = (status: Campaign["status"]) => {
    switch (status) {
      case "completed":
        return "✅";
      case "processing":
        return "🔄";
      case "failed":
        return "❌";
      default:
        return "⏳";
    }
  };

  const getStatusText = (status: Campaign["status"]) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "processing":
        return "Processing";
      case "failed":
        return "Failed";
      default:
        return "Pending";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
              Dashboard
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Manage your discovery campaigns
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Mode:</span>
              <div className="flex rounded-md border border-slate-200">
                <button
                  onClick={() => handleModeChange("manual")}
                  className={`px-3 py-1 text-sm ${mode === "manual" ? "bg-slate-900 text-white" : "bg-white text-slate-600"} rounded-l-md`}
                >
                  Manual
                </button>
                <button
                  onClick={() => handleModeChange("auto")}
                  className={`px-3 py-1 text-sm ${mode === "auto" ? "bg-slate-900 text-white" : "bg-white text-slate-600"} rounded-r-md`}
                >
                  Auto
                </button>
              </div>
            </div>
            <Link href="/discover">
              <Button>+ New Discovery</Button>
            </Link>
          </div>
        </div>

        {/* Campaigns Section */}
        <Card>
          <CardHeader>
            <CardTitle>Your Campaigns</CardTitle>
            <CardDescription>
              {campaigns.length} campaign{campaigns.length !== 1 ? "s" : ""} total
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                {error}
              </div>
            ) : isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-slate-500">Loading campaigns...</div>
              </div>
            ) : campaigns.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="text-slate-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">
                  No campaigns yet
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  Start your first discovery to find ideal prospects
                </p>
                <Link href="/discover">
                  <Button>+ New Discovery</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {campaigns.map((campaign) => (
                  <Link
                    key={campaign.id}
                    href={`/campaigns/${campaign.id}`}
                    className="block"
                  >
                    <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors">
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-900 dark:text-white mb-1">
                          {campaign.name}
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {campaign.target_criteria?.job_titles?.slice(0, 3).map((title) => (
                            <Badge key={title} variant="secondary" className="text-xs">
                              {title}
                            </Badge>
                          ))}
                          {(campaign.target_criteria?.job_titles?.length ?? 0) > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{(campaign.target_criteria?.job_titles?.length ?? 0) - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span>{getStatusIcon(campaign.status)}</span>
                          <span className="text-sm text-slate-600 dark:text-slate-400">
                            {getStatusText(campaign.status)}
                          </span>
                        </div>
                        {campaign.status === "completed" && (
                          <Badge variant="secondary">
                            {campaign.total_contacts} contacts
                          </Badge>
                        )}
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
