"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Contact, ContactsResponse } from "@/lib/types";
import { authFetch } from "@/lib/auth";
import { API_URL } from "@/lib/config";

// Icons
const Icons = {
  Users: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Search: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
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
  Download: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  ),
  Mail: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  Building: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  Target: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  ChevronRight: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  ),
  ChevronLeft: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  ),
  ExternalLink: () => (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  ),
  LinkedIn: () => (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
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
  Plus: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
};

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [filterConfidence, setFilterConfidence] = useState<string>("all");

  const fetchContacts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authFetch(
        API_URL + "/api/contacts?limit=50&offset=0&source=apollo_enriched"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch contacts: " + response.status);
      }

      const data: ContactsResponse = await response.json();
      setContacts(data.contacts);
      setTotal(data.total);
    } catch (err) {
      console.error("Failed to fetch contacts:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch contacts");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const getInitials = (firstName: string | null, lastName: string | null) => {
    const first = firstName?.charAt(0) || "";
    const last = lastName?.charAt(0) || "";
    return (first + last).toUpperCase() || "?";
  };

  const getAvatarGradient = (name: string) => {
    const gradients = [
      "from-blue-500 to-violet-500",
      "from-emerald-500 to-teal-500",
      "from-orange-500 to-red-500",
      "from-pink-500 to-rose-500",
      "from-indigo-500 to-purple-500",
      "from-cyan-500 to-blue-500",
    ];
    const index = name.charCodeAt(0) % gradients.length;
    return gradients[index];
  };

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch = !searchQuery || 
      contact.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.title?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesConfidence = filterConfidence === "all" ||
      (filterConfidence === "high" && contact.email_confidence >= 80) ||
      (filterConfidence === "medium" && contact.email_confidence >= 50 && contact.email_confidence < 80) ||
      (filterConfidence === "low" && contact.email_confidence < 50);

    return matchesSearch && matchesConfidence;
  });

  const toggleSelectAll = () => {
    if (selectedContacts.size === filteredContacts.length) {
      setSelectedContacts(new Set());
    } else {
      setSelectedContacts(new Set(filteredContacts.map((c) => c.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedContacts);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedContacts(newSelected);
  };

  const getConfidenceStyle = (confidence: number) => {
    if (confidence >= 80) return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    if (confidence >= 50) return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
  };

  const getMatchStyle = (score: number) => {
    if (score >= 80) return "text-emerald-600 dark:text-emerald-400";
    if (score >= 50) return "text-amber-600 dark:text-amber-400";
    return "text-slate-400";
  };

  const getMatchBg = (score: number) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 50) return "bg-amber-500";
    return "bg-slate-300 dark:bg-slate-600";
  };

  // Stats
  const stats = {
    total,
    withEmail: contacts.filter(c => c.email).length,
    highConfidence: contacts.filter(c => c.email_confidence >= 80).length,
    avgMatch: contacts.length > 0 
      ? Math.round(contacts.reduce((acc, c) => acc + c.persona_match_score, 0) / contacts.length)
      : 0,
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      {/* Page Header */}
      <div className="flex-shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Contacts</h1>
                <span className="px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full">
                  {total} total
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Manage your discovered and enriched contacts
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchContacts}
                disabled={isLoading}
                className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
                title="Refresh"
              >
                <Icons.Refresh />
              </button>
              <button className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
                <Icons.Download />
                Export
              </button>
              <Link href="/discover">
                <button className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm">
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
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Contacts</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.total.toLocaleString()}</p>
                </div>
                <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-blue-600 dark:text-blue-400">
                    <Icons.Users />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-3 text-xs">
                <span className="text-slate-500">Enriched contacts</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">With Email</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.withEmail.toLocaleString()}</p>
                </div>
                <div className="p-2.5 bg-violet-50 dark:bg-violet-900/20 rounded-lg">
                  <div className="text-violet-600 dark:text-violet-400">
                    <Icons.Mail />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-3 text-xs">
                <span className="text-emerald-600 dark:text-emerald-400">
                  {stats.total > 0 ? Math.round((stats.withEmail / stats.total) * 100) : 0}% coverage
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">High Confidence</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.highConfidence.toLocaleString()}</p>
                </div>
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                  <div className="text-emerald-600 dark:text-emerald-400">
                    <Icons.Target />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-3 text-xs">
                <span className="text-slate-500">80%+ email confidence</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Avg. Match Score</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.avgMatch}%</p>
                </div>
                <div className="p-2.5 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <div className="text-amber-600 dark:text-amber-400">
                    <Icons.Building />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-3 text-xs">
                <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${getMatchBg(stats.avgMatch)}`}
                    style={{ width: `${stats.avgMatch}%` }}
                  />
                </div>
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
                  placeholder="Search by name, email, company..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Confidence Filter */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-slate-500">
                  <Icons.Filter />
                </div>
                <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  {[
                    { key: "all", label: "All" },
                    { key: "high", label: "High" },
                    { key: "medium", label: "Medium" },
                    { key: "low", label: "Low" },
                  ].map((item) => (
                    <button
                      key={item.key}
                      onClick={() => setFilterConfidence(item.key)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                        filterConfidence === item.key
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

              {/* Bulk Actions */}
              {selectedContacts.size > 0 && (
                <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-700">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {selectedContacts.size} selected
                  </span>
                  <button className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                    Add to campaign
                  </button>
                </div>
              )}
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
                <span className="text-sm">Loading contacts...</span>
              </div>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center py-20 text-center">
              <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                <div className="text-slate-400">
                  <Icons.Users />
                </div>
              </div>
              <p className="text-slate-900 dark:text-white font-medium mb-1">No contacts found</p>
              <p className="text-sm text-slate-500 mb-5 max-w-sm">
                {searchQuery || filterConfidence !== "all" 
                  ? "Try adjusting your search or filters" 
                  : "Start a discovery to find and enrich contacts"}
              </p>
              {!searchQuery && filterConfidence === "all" && (
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
              {filteredContacts.map((contact) => {
                const fullName = `${contact.first_name || ""} ${contact.last_name || ""}`.trim() || "Unknown";
                
                return (
                  <div
                    key={contact.id}
                    className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer ${
                      selectedContacts.has(contact.id) ? "ring-2 ring-blue-500 border-blue-500" : ""
                    }`}
                    onClick={() => toggleSelect(contact.id)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getAvatarGradient(fullName)} flex items-center justify-center text-white font-medium flex-shrink-0`}>
                        {getInitials(contact.first_name, contact.last_name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                            {fullName}
                          </h3>
                          {contact.linkedin_url && (
                            <a
                              href={contact.linkedin_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:text-blue-600 flex-shrink-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Icons.LinkedIn />
                            </a>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 truncate">{contact.title || "No title"}</p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Icons.Building />
                        <span className="text-slate-700 dark:text-slate-300 truncate">
                          {contact.company_name || "Unknown company"}
                        </span>
                      </div>
                      {contact.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Icons.Mail />
                          <a
                            href={`mailto:${contact.email}`}
                            className="text-blue-600 hover:underline truncate"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {contact.email}
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">Match</span>
                        <span className={`text-sm font-medium ${getMatchStyle(contact.persona_match_score)}`}>
                          {contact.persona_match_score}%
                        </span>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${getConfidenceStyle(contact.email_confidence)}`}>
                        {contact.email_confidence}% confidence
                      </span>
                    </div>
                  </div>
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
                      <th className="w-12 px-5 py-3">
                        <input
                          type="checkbox"
                          checked={selectedContacts.size === filteredContacts.length && filteredContacts.length > 0}
                          onChange={toggleSelectAll}
                          className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                      <th className="text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider px-5 py-3">
                        Contact
                      </th>
                      <th className="text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider px-5 py-3">
                        Title
                      </th>
                      <th className="text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider px-5 py-3">
                        Company
                      </th>
                      <th className="text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider px-5 py-3">
                        Email
                      </th>
                      <th className="text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider px-5 py-3">
                        Match
                      </th>
                      <th className="text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider px-5 py-3">
                        Confidence
                      </th>
                      <th className="w-12 px-5 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredContacts.map((contact) => {
                      const fullName = `${contact.first_name || ""} ${contact.last_name || ""}`.trim() || "Unknown";
                      
                      return (
                        <tr
                          key={contact.id}
                          className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group ${
                            selectedContacts.has(contact.id) ? "bg-blue-50 dark:bg-blue-900/10" : ""
                          }`}
                        >
                          <td className="px-5 py-4">
                            <input
                              type="checkbox"
                              checked={selectedContacts.has(contact.id)}
                              onChange={() => toggleSelect(contact.id)}
                              className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${getAvatarGradient(fullName)} flex items-center justify-center text-white text-sm font-medium flex-shrink-0`}>
                                {getInitials(contact.first_name, contact.last_name)}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-slate-900 dark:text-white truncate max-w-[150px]">
                                    {fullName}
                                  </p>
                                  {contact.linkedin_url && (
                                    <a
                                      href={contact.linkedin_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-500 hover:text-blue-600 flex-shrink-0"
                                    >
                                      <Icons.LinkedIn />
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-sm text-slate-600 dark:text-slate-400 truncate block max-w-[150px]">
                              {contact.title || "—"}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-slate-900 dark:text-white truncate max-w-[150px]">
                                {contact.company_name || "—"}
                              </p>
                              {contact.company_domain && (
                                <p className="text-xs text-slate-500 truncate">{contact.company_domain}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            {contact.email ? (
                              <a
                                href={`mailto:${contact.email}`}
                                className="text-sm text-blue-600 hover:underline truncate block max-w-[180px]"
                              >
                                {contact.email}
                              </a>
                            ) : (
                              <span className="text-sm text-slate-400">—</span>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-12 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${getMatchBg(contact.persona_match_score)}`}
                                  style={{ width: `${contact.persona_match_score}%` }}
                                />
                              </div>
                              <span className={`text-sm font-medium ${getMatchStyle(contact.persona_match_score)}`}>
                                {contact.persona_match_score}%
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full border ${getConfidenceStyle(contact.email_confidence)}`}>
                              {contact.email_confidence}%
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <button className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-all">
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
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">
                    Showing {filteredContacts.length} of {total} contacts
                  </span>
                  <div className="flex items-center gap-2">
                    <button 
                      className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50" 
                      disabled
                    >
                      <Icons.ChevronLeft />
                    </button>
                    <span className="px-3 py-1 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
                      1
                    </span>
                    <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors">
                      <Icons.ChevronRight />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
