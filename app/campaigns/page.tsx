"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Campaign, CampaignsResponse } from "@/lib/types";
import { authFetch } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

// Icons
const Icons = {
  Plus: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  Search: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
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
  Lightning: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  Check: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
  Filter: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
  ),
  Refresh: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  MoreVertical: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
    </svg>
  ),
  Grid: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  List: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  ),
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

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
    return formatDate(dateString);
  };

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

  // Filter campaigns
  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch = !searchQuery || 
      campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.solution_description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || campaign.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Stats
  const stats = {
    total,
    active: campaigns.filter((c) => c.status === "processing").length,
    completed: campaigns.filter((c) => c.status === "completed").length,
    pending: campaigns.filter((c) => c.status === "pending").length,
    contacts: campaigns.reduce((acc, c) => acc + c.total_contacts, 0),
    enriched: campaigns.reduce((acc, c) => acc + c.enriched_contacts, 0),
  };

  const enrichmentRate = stats.contacts > 0 
    ? Math.round((stats.enriched / stats.contacts) * 100) 
    : 0;

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      {/* Page Header */}
      <div className="flex-shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Campaigns</h1>
                <span className="px-2 py-0.5 text-xs font-medium bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 rounded-full">
                  {total} total
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Manage and track your outreach campaigns
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={fetchCampaigns}
                className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="Refresh"
              >
                <Icons.Refresh />
              </button>
              <Link href="/discover">
                <button className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm">
                  <Icons.Plus />
                  New Campaign
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
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Campaigns</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.total}</p>
                </div>
                <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-blue-600 dark:text-blue-400">
                    <Icons.Campaign />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-3 text-xs">
                <span className="text-emerald-600 dark:text-emerald-400">{stats.completed} completed</span>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span className="text-slate-500">{stats.pending} pending</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Now</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.active}</p>
                </div>
                <div className="p-2.5 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <div className="text-amber-600 dark:text-amber-400">
                    <Icons.Lightning />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-3 text-xs">
                {stats.active > 0 ? (
                  <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                    Processing...
                  </span>
                ) : (
                  <span className="text-slate-500">No active campaigns</span>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Contacts</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.contacts.toLocaleString()}</p>
                </div>
                <div className="p-2.5 bg-violet-50 dark:bg-violet-900/20 rounded-lg">
                  <div className="text-violet-600 dark:text-violet-400">
                    <Icons.Users />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-3 text-xs">
                <span className="text-slate-500">Across all campaigns</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Enriched</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.enriched.toLocaleString()}</p>
                </div>
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                  <div className="text-emerald-600 dark:text-emerald-400">
                    <Icons.Check />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-3 text-xs">
                <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                    style={{ width: `${enrichmentRate}%` }}
                  />
                </div>
                <span className="text-slate-600 dark:text-slate-400 font-medium">{enrichmentRate}%</span>
              </div>
            </div>
          </div>

          {/* Toolbar */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 mb-6">
            <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {/* Search */}
              <div className="relative flex-1 w-full sm:max-w-md">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Icons.Search />
                </div>
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-slate-500">
                  <Icons.Filter />
                </div>
                <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  {[
                    { key: "all", label: "All" },
                    { key: "processing", label: "Active" },
                    { key: "completed", label: "Completed" },
                    { key: "pending", label: "Pending" },
                  ].map((item) => (
                    <button
                      key={item.key}
                      onClick={() => setFilterStatus(item.key)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                        filterStatus === item.key
                          ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg ml-auto">
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-1.5 rounded-md transition-colors ${
                    viewMode === "table"
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                  title="Table view"
                >
                  <Icons.List />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-md transition-colors ${
                    viewMode === "grid"
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                  title="Grid view"
                >
                  <Icons.Grid />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          {error ? (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                {error}
              </div>
            </div>
          ) : isLoading ? (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center py-24">
              <div className="flex flex-col items-center gap-3 text-slate-500">
                <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-sm">Loading campaigns...</span>
              </div>
            </div>
          ) : filteredCampaigns.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center py-20 text-center">
              <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                <div className="text-slate-400">
                  <Icons.Campaign />
                </div>
              </div>
              <p className="text-slate-900 dark:text-white font-medium mb-1">
                {searchQuery || filterStatus !== "all" ? "No campaigns match your filters" : "No campaigns yet"}
              </p>
              <p className="text-sm text-slate-500 mb-5 max-w-sm">
                {searchQuery || filterStatus !== "all" ? "Try adjusting your search or filters" : "Start a discovery to create your first outreach campaign"}
              </p>
              {!searchQuery && filterStatus === "all" && (
                <Link href="/discover">
                  <button className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                    <Icons.Plus />
                    Start Discovery
                  </button>
                </Link>
              )}
            </div>
          ) : viewMode === "grid" ? (
            /* Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredCampaigns.map((campaign) => {
                const rate = campaign.total_contacts > 0
                  ? Math.round((campaign.enriched_contacts / campaign.total_contacts) * 100)
                  : 0;

                return (
                  <Link key={campaign.id} href={`/campaigns/${campaign.id}`}>
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700 transition-all group cursor-pointer">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-sm font-medium">
                          {campaign.name.charAt(0).toUpperCase()}
                        </div>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusStyle(campaign.status)}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(campaign.status)}`} />
                          {getStatusLabel(campaign.status)}
                        </span>
                      </div>
                      
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-1 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {campaign.name}
                      </h3>
                      <p className="text-sm text-slate-500 mb-4 line-clamp-2">
                        {campaign.solution_description}
                      </p>

                      <div className="flex items-center justify-between text-sm mb-3">
                        <span className="text-slate-500">Contacts</span>
                        <span className="font-medium text-slate-900 dark:text-white">{campaign.total_contacts.toLocaleString()}</span>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-1.5">
                          <span className="text-slate-500">Enrichment</span>
                          <span className="font-medium text-slate-900 dark:text-white">{rate}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500 rounded-full transition-all" 
                            style={{ width: `${rate}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                          <Icons.Clock />
                          {formatRelativeTime(campaign.created_at)}
                        </div>
                        <span className="text-xs text-slate-500">
                          {campaign.mode === "auto" ? "⚡ Auto" : "🎛️ Manual"}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            /* Table View */
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                      <th className="text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider px-5 py-3">
                        Campaign
                      </th>
                      <th className="text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider px-5 py-3">
                        Status
                      </th>
                      <th className="text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider px-5 py-3">
                        Mode
                      </th>
                      <th className="text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider px-5 py-3">
                        Contacts
                      </th>
                      <th className="text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider px-5 py-3">
                        Enrichment
                      </th>
                      <th className="text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider px-5 py-3">
                        Created
                      </th>
                      <th className="w-12 px-5 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredCampaigns.map((campaign) => {
                      const rate = campaign.total_contacts > 0
                        ? Math.round((campaign.enriched_contacts / campaign.total_contacts) * 100)
                        : 0;

                      return (
                        <tr
                          key={campaign.id}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                          onClick={() => window.location.href = `/campaigns/${campaign.id}`}
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                                {campaign.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-slate-900 dark:text-white truncate max-w-[200px] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                  {campaign.name}
                                </p>
                                <p className="text-xs text-slate-500 truncate max-w-[200px]">
                                  {campaign.solution_description}
                                </p>
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
                            <span className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              {campaign.mode === "auto" ? "⚡ Auto" : "🎛️ Manual"}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-sm font-medium text-slate-900 dark:text-white">
                              {campaign.total_contacts.toLocaleString()}
                            </span>
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
                            <button 
                              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-all"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Icons.ChevronRight />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                  <span>Showing {filteredCampaigns.length} of {total} campaigns</span>
                  <span>{stats.contacts.toLocaleString()} total contacts</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
