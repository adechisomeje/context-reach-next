"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Campaign, CampaignsResponse } from "@/lib/types";
import { authFetch } from "@/lib/auth";
import { API_URL } from "@/lib/config";

// Icons as components for cleaner code
const Icons = {
  Campaign: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  ),
  Users: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Check: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Lightning: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  Search: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  Mail: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  TrendUp: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  Clock: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  ChevronRight: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  ),
  Plus: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  Refresh: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  Settings: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
};

export function Dashboard() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
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

  const getStatusStyle = (status: Campaign["status"]) => {
    switch (status) {
      case "completed":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "processing":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      case "failed":
        return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
      default:
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    }
  };

  const getStatusDot = (status: Campaign["status"]) => {
    switch (status) {
      case "completed":
        return "bg-emerald-500";
      case "processing":
        return "bg-blue-500 animate-pulse";
      case "failed":
        return "bg-red-500";
      default:
        return "bg-amber-500";
    }
  };

  const getStatusLabel = (status: Campaign["status"]) => {
    switch (status) {
      case "completed": return "Completed";
      case "processing": return "Processing";
      case "failed": return "Failed";
      default: return "Pending";
    }
  };

  // Calculate stats
  const stats = {
    totalCampaigns: campaigns.length,
    totalContacts: campaigns.reduce((acc, c) => acc + c.total_contacts, 0),
    enrichedContacts: campaigns.reduce((acc, c) => acc + c.enriched_contacts, 0),
    activeCampaigns: campaigns.filter((c) => c.status === "processing").length,
    completedCampaigns: campaigns.filter((c) => c.status === "completed").length,
    pendingCampaigns: campaigns.filter((c) => c.status === "pending").length,
  };

  const enrichmentRate = stats.totalContacts > 0 
    ? Math.round((stats.enrichedContacts / stats.totalContacts) * 100) 
    : 0;

  const recentCampaigns = campaigns.slice(0, 6);

  // Format relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-slate-950">
      {/* Page Header */}
      <div className="flex-shrink-0 bg-white dark:bg-slate-900 border-b border-orange-100 dark:border-orange-900/30">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Dashboard</h1>
                <span className="px-2 py-0.5 text-xs font-medium bg-orange-50 text-[#ff7032] dark:bg-orange-900/30 dark:text-[#ff8c5a] rounded-full">
                  CRM
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Welcome back! Here's your sales pipeline overview.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={fetchCampaigns}
                className="p-2 text-slate-500 hover:text-[#ff7032] dark:hover:text-[#ff8c5a] hover:bg-orange-50 dark:hover:bg-orange-950/30 rounded-lg transition-colors"
                title="Refresh"
              >
                <Icons.Refresh />
              </button>
              <Link href="/discover">
                <button className="px-4 py-2 text-sm font-medium bg-[#ff7032] text-white rounded-lg hover:bg-[#e5652d] transition-colors flex items-center gap-2 shadow-sm">
                  <Icons.Plus />
                  New Discovery
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6 max-w-[1600px] mx-auto">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Total Campaigns */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-orange-100 dark:border-orange-900/30 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Campaigns</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.totalCampaigns}</p>
                </div>
                <div className="p-2.5 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="text-[#ff7032] dark:text-[#ff8c5a]">
                    <Icons.Campaign />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-3 text-xs">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <Icons.TrendUp />
                  {stats.activeCampaigns} active
                </span>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span className="text-slate-500">{stats.completedCampaigns} completed</span>
              </div>
            </div>

            {/* Total Contacts */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-orange-100 dark:border-orange-900/30 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Contacts</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.totalContacts.toLocaleString()}</p>
                </div>
                <div className="p-2.5 bg-[#ffc3a6]/30 dark:bg-orange-900/20 rounded-lg">
                  <div className="text-[#ff8c5a] dark:text-[#ffa77f]">
                    <Icons.Users />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-3 text-xs">
                <span className="text-slate-500">Across all campaigns</span>
              </div>
            </div>

            {/* Enriched Contacts */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-orange-100 dark:border-orange-900/30 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Enriched</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.enrichedContacts.toLocaleString()}</p>
                </div>
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                  <div className="text-emerald-600 dark:text-emerald-400">
                    <Icons.Check />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-3 text-xs">
                <div className="flex-1 h-1.5 bg-orange-50 dark:bg-orange-900/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#ff7032] rounded-full transition-all duration-500" 
                    style={{ width: `${enrichmentRate}%` }}
                  />
                </div>
                <span className="text-slate-600 dark:text-slate-400 font-medium">{enrichmentRate}%</span>
              </div>
            </div>

            {/* Active Processing */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-orange-100 dark:border-orange-900/30 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Now</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.activeCampaigns}</p>
                </div>
                <div className="p-2.5 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <div className="text-amber-600 dark:text-amber-400">
                    <Icons.Lightning />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-3 text-xs">
                {stats.activeCampaigns > 0 ? (
                  <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                    Processing...
                  </span>
                ) : (
                  <span className="text-slate-500">No active campaigns</span>
                )}
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Recent Campaigns Table - Takes 2 columns */}
            <div className="xl:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-slate-900 dark:text-white">Recent Campaigns</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Your latest outreach campaigns</p>
                </div>
                <Link href="/campaigns" className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium flex items-center gap-1">
                  View all
                  <Icons.ChevronRight />
                </Link>
              </div>

              {error ? (
                <div className="p-5">
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                    {error}
                  </div>
                </div>
              ) : isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="flex flex-col items-center gap-3 text-slate-500">
                    <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-sm">Loading campaigns...</span>
                  </div>
                </div>
              ) : recentCampaigns.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center px-5">
                  <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                    <div className="text-slate-400">
                      <Icons.Campaign />
                    </div>
                  </div>
                  <p className="text-slate-900 dark:text-white font-medium mb-1">No campaigns yet</p>
                  <p className="text-sm text-slate-500 mb-5 max-w-sm">Start a discovery to find leads that match your ideal customer profile</p>
                  <Link href="/discover">
                    <button className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                      <Icons.Plus />
                      Start Discovery
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800">
                        <th className="text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider px-5 py-3">Campaign</th>
                        <th className="text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider px-5 py-3">Status</th>
                        <th className="text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider px-5 py-3">Contacts</th>
                        <th className="text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider px-5 py-3">Enrichment</th>
                        <th className="text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider px-5 py-3">Created</th>
                        <th className="px-5 py-3"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {recentCampaigns.map((campaign) => {
                        const rate = campaign.total_contacts > 0
                          ? Math.round((campaign.enriched_contacts / campaign.total_contacts) * 100)
                          : 0;

                        return (
                          <tr key={campaign.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-sm font-medium">
                                  {campaign.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium text-slate-900 dark:text-white truncate max-w-[200px]">{campaign.name}</p>
                                  <p className="text-xs text-slate-500 truncate max-w-[200px]">{campaign.solution_description}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusStyle(campaign.status)}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(campaign.status)}`} />
                                {getStatusLabel(campaign.status)}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <span className="text-sm text-slate-900 dark:text-white font-medium">{campaign.total_contacts.toLocaleString()}</span>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-emerald-500 rounded-full" 
                                    style={{ width: `${rate}%` }}
                                  />
                                </div>
                                <span className="text-xs text-slate-600 dark:text-slate-400">{rate}%</span>
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-1.5 text-slate-500">
                                <Icons.Clock />
                                <span className="text-sm">{formatRelativeTime(campaign.created_at)}</span>
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <Link href={`/campaigns/${campaign.id}`}>
                                <button className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-all">
                                  <Icons.ChevronRight />
                                </button>
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Link href="/discover" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform">
                      <Icons.Search />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 dark:text-white text-sm">New Discovery</p>
                      <p className="text-xs text-slate-500">Find leads matching your ICP</p>
                    </div>
                    <Icons.ChevronRight />
                  </Link>

                  <Link href="/contacts" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
                    <div className="w-10 h-10 rounded-lg bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center text-violet-600 dark:text-violet-400 group-hover:scale-105 transition-transform">
                      <Icons.Users />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 dark:text-white text-sm">View Contacts</p>
                      <p className="text-xs text-slate-500">Browse all your contacts</p>
                    </div>
                    <Icons.ChevronRight />
                  </Link>

                  <Link href="/campaigns" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                      <Icons.Mail />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 dark:text-white text-sm">Campaigns</p>
                      <p className="text-xs text-slate-500">Manage your outreach</p>
                    </div>
                    <Icons.ChevronRight />
                  </Link>

                  <Link href="/settings" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 group-hover:scale-105 transition-transform">
                      <Icons.Settings />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 dark:text-white text-sm">Settings</p>
                      <p className="text-xs text-slate-500">Configure your account</p>
                    </div>
                    <Icons.ChevronRight />
                  </Link>
                </div>
              </div>

              {/* Pipeline Overview */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Pipeline Overview</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="text-slate-600 dark:text-slate-400">Discovered</span>
                      <span className="font-medium text-slate-900 dark:text-white">{stats.totalContacts.toLocaleString()}</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: '100%' }} />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="text-slate-600 dark:text-slate-400">Enriched</span>
                      <span className="font-medium text-slate-900 dark:text-white">{stats.enrichedContacts.toLocaleString()}</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-violet-500 rounded-full transition-all duration-500" 
                        style={{ width: `${enrichmentRate}%` }} 
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Conversion Rate</span>
                      <span className="text-lg font-bold text-slate-900 dark:text-white">{enrichmentRate}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity Feed */}
              {recentCampaigns.length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Recent Activity</h3>
                  <div className="space-y-4">
                    {recentCampaigns.slice(0, 4).map((campaign, index) => (
                      <div key={campaign.id} className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${getStatusDot(campaign.status)}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-900 dark:text-white truncate">
                            <span className="font-medium">{campaign.name}</span>
                          </p>
                          <p className="text-xs text-slate-500">
                            {campaign.status === "completed" && "Campaign completed"}
                            {campaign.status === "processing" && "Currently processing"}
                            {campaign.status === "pending" && "Queued for processing"}
                            {campaign.status === "failed" && "Campaign failed"}
                            {" • "}
                            {formatRelativeTime(campaign.updated_at)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
