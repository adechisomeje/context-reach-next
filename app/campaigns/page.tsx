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
import { authFetch } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaigns = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authFetch(API_URL + "/api/campaigns");

      if (!response.ok) {
        throw new Error("Failed to fetch campaigns: " + response.status);
      }

      const data: CampaignsResponse = await response.json();
      setCampaigns(data.campaigns);
      setTotal(data.total);
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

  const getStatusBadge = (status: Campaign["status"]) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "processing":
        return <Badge className="bg-blue-100 text-blue-800">Processing</Badge>;
      case "failed":
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-800">Pending</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Campaigns
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              View and manage your discovery campaigns
            </p>
          </div>
          <Link href="/">
            <Button>+ New Campaign</Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Campaigns</CardDescription>
              <CardTitle className="text-3xl">{total}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>⚡ Auto Mode</CardDescription>
              <CardTitle className="text-3xl text-purple-600">
                {campaigns.filter((c) => c.mode === "auto").length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>🎛️ Manual Mode</CardDescription>
              <CardTitle className="text-3xl text-slate-600">
                {campaigns.filter((c) => c.mode === "manual").length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Completed</CardDescription>
              <CardTitle className="text-3xl">
                {campaigns.filter((c) => c.status === "completed").length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Contacts</CardDescription>
              <CardTitle className="text-3xl">
                {campaigns.reduce((acc, c) => acc + c.total_contacts, 0)}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Enriched Contacts</CardDescription>
              <CardTitle className="text-3xl">
                {campaigns.reduce((acc, c) => acc + c.enriched_contacts, 0)}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Campaigns List */}
        {error ? (
          <Card>
            <CardContent className="p-6">
              <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                {error}
              </div>
            </CardContent>
          </Card>
        ) : isLoading ? (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center py-12">
                <div className="text-slate-500">Loading campaigns...</div>
              </div>
            </CardContent>
          </Card>
        ) : campaigns.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="text-slate-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <p className="text-lg text-slate-600 dark:text-slate-400 mb-2">No campaigns yet</p>
                <p className="text-sm text-slate-500 mb-4">
                  Start a discovery to create your first campaign
                </p>
                <Link href="/">
                  <Button>Start Discovery</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <Link key={campaign.id} href={`/campaigns/${campaign.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white truncate">
                            {campaign.name}
                          </h3>
                          {getStatusBadge(campaign.status)}
                          {/* Mode Badge - only show if mode is explicitly set */}
                          {campaign.mode === "auto" && (
                            <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                              ⚡ Auto
                            </Badge>
                          )}
                          {campaign.mode === "manual" && (
                            <Badge className="bg-slate-100 text-slate-700 border-slate-200">
                              🎛️ Manual
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">
                          {campaign.solution_description}
                        </p>
                        
                        {/* Target Criteria Tags */}
                        {campaign.target_criteria && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {campaign.target_criteria.job_titles.slice(0, 3).map((title) => (
                              <Badge key={title} variant="secondary" className="text-xs">
                                {title}
                              </Badge>
                            ))}
                            {campaign.target_criteria.industries.slice(0, 2).map((industry) => (
                              <Badge key={industry} variant="outline" className="text-xs">
                                {industry}
                              </Badge>
                            ))}
                            {(campaign.target_criteria.job_titles.length > 3 || 
                              campaign.target_criteria.industries.length > 2) && (
                              <Badge variant="secondary" className="text-xs">
                                +more
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Stats Row */}
                        <div className="flex items-center gap-6 text-sm text-slate-500">
                          <span>
                            <strong className="text-slate-700 dark:text-slate-300">
                              {campaign.total_contacts}
                            </strong>{" "}
                            contacts
                          </span>
                          <span>
                            <strong className="text-slate-700 dark:text-slate-300">
                              {campaign.enriched_contacts}
                            </strong>{" "}
                            enriched
                          </span>
                          <span>Created {formatDate(campaign.created_at)}</span>
                        </div>
                      </div>
                      
                      {/* Arrow */}
                      <div className="ml-4 text-slate-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
