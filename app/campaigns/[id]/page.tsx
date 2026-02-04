"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Campaign, CampaignContactsResponse, Contact, ContextResearchResponse, Message, MessagesResponse } from "@/lib/types";
import { authFetch } from "@/lib/auth";
import { API_URL } from "@/lib/config";
import { ContextResearchPanel } from "@/components/ContextResearchPanel";
import { SequenceCreator } from "@/components/SequenceCreator";
import { ContactSequenceDetail } from "@/components/ContactSequenceDetail";
import { CampaignAnalyticsDashboard } from "@/components/CampaignAnalyticsDashboard";
import { CampaignStatusCard, DailyRunsTable } from "@/components/campaign";
import { useCampaignAnalytics } from "@/hooks/useAnalytics";
import { useCampaignStatus } from "@/hooks/useOrchestration";
import { useRouter } from "next/navigation";

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [totalContacts, setTotalContacts] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteContacts, setDeleteContacts] = useState(true);
  
  // Context Research state
  const [mode, setMode] = useState<"manual" | "auto">("manual");
  const [researchingContactId, setResearchingContactId] = useState<string | null>(null);
  const [researchError, setResearchError] = useState<string | null>(null);
  const [selectedResearch, setSelectedResearch] = useState<ContextResearchResponse | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [contactResearch, setContactResearch] = useState<Record<string, ContextResearchResponse>>({});
  
  // Messages state
  const [contactMessages, setContactMessages] = useState<Record<string, Message[]>>({});
  
  // Sequence status state
  const [contactSequences, setContactSequences] = useState<Record<string, { hasSequence: boolean; status?: string }>>({});
  
  // Email Composer / Sequence state
  const [composingContact, setComposingContact] = useState<Contact | null>(null);
  const [viewingSequenceContact, setViewingSequenceContact] = useState<Contact | null>(null);
  
  // Analytics
  const { analytics, loading: analyticsLoading } = useCampaignAnalytics(campaignId);
  
  // Multi-day campaign status
  const { status: campaignStatus, refresh: refreshCampaignStatus } = useCampaignStatus(
    campaign?.mode === "auto" ? campaignId : null
  );
  const isMultiDayCampaign = campaignStatus && campaignStatus.duration_days > 1;
  
  // Active tab
  const [activeTab, setActiveTab] = useState<"contacts" | "analytics" | "schedule">("contacts");

  // Load mode from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem("contextreach_mode") as "manual" | "auto";
    if (savedMode) {
      setMode(savedMode);
    }
  }, []);

  const fetchCampaignData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const campaignResponse = await authFetch(API_URL + "/api/campaigns/" + campaignId);
      if (!campaignResponse.ok) {
        throw new Error("Failed to fetch campaign: " + campaignResponse.status);
      }
      const campaignData: Campaign = await campaignResponse.json();
      setCampaign(campaignData);

      const contactsResponse = await authFetch(
        API_URL + "/api/campaigns/" + campaignId + "/contacts?limit=50&offset=0&include_intelligence=true"
      );
      if (!contactsResponse.ok) {
        throw new Error("Failed to fetch contacts: " + contactsResponse.status);
      }
      const contactsData: CampaignContactsResponse = await contactsResponse.json();
      setContacts(contactsData.contacts);
      setTotalContacts(contactsData.total);

      // Use the actual campaign.id for sequence lookups (not the URL param which might be discovery_campaign_id)
      const actualCampaignId = campaignData.id;

      // Fetch sequence status for each contact from composition engine
      const sequenceStatuses: Record<string, { hasSequence: boolean; status?: string }> = {};
      const messagesByContact: Record<string, Message[]> = {};
      
      await Promise.all(
        contactsData.contacts.map(async (contact) => {
          try {
            const seqResponse = await authFetch(
              `${API_URL}/api/sequence/${contact.id}?campaign_id=${actualCampaignId}`
            );
            if (seqResponse.ok) {
              const seqData = await seqResponse.json();
              const isPaused = seqData.sequence_state?.is_paused;
              sequenceStatuses[contact.id] = {
                hasSequence: true,
                status: isPaused ? "paused" : "active",
              };
              // Store messages from sequence response
              if (seqData.messages && seqData.messages.length > 0) {
                messagesByContact[contact.id] = seqData.messages;
              }
            } else if (seqResponse.status === 404) {
              sequenceStatuses[contact.id] = { hasSequence: false };
            }
          } catch (seqErr) {
            console.warn(`Could not fetch sequence for contact ${contact.id}:`, seqErr);
            sequenceStatuses[contact.id] = { hasSequence: false };
          }
        })
      );
      
      console.log("Sequence statuses:", Object.values(sequenceStatuses).filter(s => s.hasSequence).length, "contacts have sequences");
      setContactSequences(sequenceStatuses);
      setContactMessages(messagesByContact);
    } catch (err) {
      console.error("Failed to fetch campaign data:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch campaign data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (campaignId) {
      fetchCampaignData();
    }
  }, [campaignId]);

  const handleResearch = async (contact: Contact) => {
    if (!campaign) return;
    setResearchingContactId(contact.id);
    setResearchError(null);

    try {
      const response = await authFetch(API_URL + "/api/research", {
        method: "POST",
        body: JSON.stringify({
          contact_id: contact.id,
          product_value_prop: campaign.product_description || campaign.solution_description,
          research_depth: "standard",
        }),
      });

      if (!response.ok) {
        if (response.status === 402) {
          const errorData = await response.json();
          throw new Error(errorData.detail?.message || "Insufficient credits for context research");
        }
        throw new Error("Failed to initiate research: " + response.status);
      }

      const data: ContextResearchResponse = await response.json();
      setContactResearch((prev) => ({ ...prev, [contact.id]: data }));
    } catch (err) {
      console.error("Research failed:", err);
      setResearchError(err instanceof Error ? err.message : "Failed to initiate research");
    } finally {
      setResearchingContactId(null);
    }
  };

  const handleViewResearch = async (contact: Contact) => {
    const research = contactResearch[contact.id];
    if (research) {
      setSelectedResearch(research);
      setSelectedContact(contact);
      return;
    }

    if (contact.has_research) {
      try {
        const response = await authFetch(`${API_URL}/api/context/${contact.id}`);
        if (response.ok) {
          const data = await response.json();
          const intelligenceData = data.context || data;
          setContactResearch((prev) => ({ ...prev, [contact.id]: intelligenceData }));
          setSelectedResearch(intelligenceData);
          setSelectedContact(contact);
        } else {
          setResearchError("Could not load research data.");
        }
      } catch (err) {
        setResearchError("Error loading research data");
      }
    }
  };

  const closeResearchPanel = () => {
    setSelectedResearch(null);
    setSelectedContact(null);
  };

  const handleDeleteCampaign = async () => {
    setIsDeleting(true);
    try {
      const response = await authFetch(
        `${API_URL}/api/campaigns/${campaignId}?delete_contacts=${deleteContacts}`,
        { method: "DELETE" }
      );
      if (!response.ok) {
        throw new Error("Failed to delete campaign: " + response.status);
      }
      router.push("/campaigns");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete campaign");
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const hasResearch = (contact: Contact): boolean => {
    return contact.has_research === true || !!contactResearch[contact.id];
  };

  const getContactMessageStatus = (contactId: string): { status: string; count: number } | null => {
    const messages = contactMessages[contactId];
    if (!messages || messages.length === 0) return null;
    
    // Priority order: sent/delivered > scheduled > draft > failed/cancelled > any
    const sent = messages.filter(m => m.status === "sent" || m.status === "delivered" || m.status === "replied").length;
    const scheduled = messages.filter(m => m.status === "scheduled").length;
    const draft = messages.filter(m => m.status === "draft").length;
    const failed = messages.filter(m => m.status === "failed" || m.status === "cancelled" || m.status === "bounced").length;
    
    if (sent > 0) return { status: "sent", count: sent };
    if (scheduled > 0) return { status: "scheduled", count: scheduled };
    if (draft > 0) return { status: "draft", count: draft };
    if (failed > 0) return { status: "failed", count: failed };
    
    // If messages exist but don't match above, return total count
    return { status: "pending", count: messages.length };
  };

  const getInitials = (firstName: string | null, lastName: string | null) => {
    const first = firstName?.charAt(0) || "";
    const last = lastName?.charAt(0) || "";
    return (first + last).toUpperCase() || "?";
  };

  const getStatusStyle = (status: Campaign["status"]) => {
    switch (status) {
      case "completed":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "processing":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "failed":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
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

  const getConfidenceStyle = (confidence: number) => {
    if (confidence >= 80) return "text-emerald-600 dark:text-emerald-400";
    if (confidence >= 50) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white dark:bg-slate-950">
        <div className="flex items-center gap-3 text-slate-500">
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading campaign...
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="h-screen flex flex-col bg-white dark:bg-slate-950 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm mb-4">
            {error || "Campaign not found"}
          </div>
          <Link href="/campaigns">
            <button className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              ← Back to Campaigns
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const enrichmentRate = campaign.total_contacts > 0
    ? Math.round((campaign.enriched_contacts / campaign.total_contacts) * 100)
    : 0;

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-slate-950">
      {/* Page Header */}
      <div className="flex-shrink-0 border-b border-slate-200 dark:border-slate-800">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/campaigns" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-semibold text-slate-900 dark:text-white">{campaign.name}</h1>
                  <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${getStatusStyle(campaign.status)}`}>
                    {getStatusLabel(campaign.status)}
                  </span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 truncate max-w-xl">
                  {campaign.solution_description}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="px-6 py-3 flex items-center gap-6 border-t border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Contacts:</span>
            <span className="text-sm font-medium text-slate-900 dark:text-white">{campaign.total_contacts}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Enriched:</span>
            <span className="text-sm font-medium text-slate-900 dark:text-white">{campaign.enriched_contacts}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Rate:</span>
            <span className="text-sm font-medium text-slate-900 dark:text-white">{enrichmentRate}%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Mode:</span>
            <span className="text-sm font-medium text-slate-900 dark:text-white">
              {campaign.mode === "auto" ? "⚡ Auto" : "Manual"}
            </span>
          </div>
          {isMultiDayCampaign && campaignStatus && (
            <>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">📅 Schedule:</span>
                <span className="text-sm font-medium text-slate-900 dark:text-white">
                  Day {campaignStatus.current_day}/{campaignStatus.duration_days}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                  campaignStatus.status === "active" 
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                    : campaignStatus.status === "paused"
                      ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                      : campaignStatus.status === "cancelled"
                        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                }`}>
                  {campaignStatus.status === "active" && "🟢 Active"}
                  {campaignStatus.status === "paused" && "⏸️ Paused"}
                  {campaignStatus.status === "cancelled" && "🛑 Cancelled"}
                  {campaignStatus.status === "completed" && "✅ Completed"}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Tabs */}
        <div className="px-6 py-2 flex items-center gap-4 border-t border-slate-100 dark:border-slate-800/50">
          <button
            onClick={() => setActiveTab("contacts")}
            className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "contacts"
                ? "border-slate-900 dark:border-white text-slate-900 dark:text-white"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            Contacts ({totalContacts})
          </button>
          {isMultiDayCampaign && (
            <button
              onClick={() => setActiveTab("schedule")}
              className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === "schedule"
                  ? "border-slate-900 dark:border-white text-slate-900 dark:text-white"
                  : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              <span>📅</span> Schedule
              {campaignStatus?.status === "active" && (
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              )}
            </button>
          )}
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "analytics"
                ? "border-slate-900 dark:border-white text-slate-900 dark:text-white"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            Analytics
          </button>
          <div className="flex-1" />
          <button
            onClick={fetchCampaignData}
            className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === "analytics" ? (
          <CampaignAnalyticsDashboard analytics={analytics} loading={analyticsLoading} />
        ) : activeTab === "schedule" && isMultiDayCampaign && campaignStatus ? (
          <div className="p-6 max-w-4xl mx-auto space-y-6">
            {/* Campaign Status Card */}
            <CampaignStatusCard 
              campaign={campaignStatus} 
              onUpdate={refreshCampaignStatus}
            />
            
            {/* Daily Runs Table */}
            {campaignStatus.daily_runs && campaignStatus.daily_runs.length > 0 && (
              <DailyRunsTable dailyRuns={campaignStatus.daily_runs} />
            )}
          </div>
        ) : (
          <>
            {/* Target Criteria (collapsible) */}
            {campaign.target_criteria && (
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/30 dark:bg-slate-900/30">
                <div className="flex items-start gap-6 text-sm">
                  <div>
                    <span className="text-slate-500">Job Titles:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {campaign.target_criteria.job_titles.slice(0, 3).map((title) => (
                        <span key={title} className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-xs text-slate-700 dark:text-slate-300">
                          {title}
                        </span>
                      ))}
                      {campaign.target_criteria.job_titles.length > 3 && (
                        <span className="px-2 py-0.5 text-xs text-slate-500">
                          +{campaign.target_criteria.job_titles.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500">Industries:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {campaign.target_criteria.industries.slice(0, 2).map((industry) => (
                        <span key={industry} className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-xs text-slate-700 dark:text-slate-300">
                          {industry}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500">Company Sizes:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {campaign.target_criteria.company_sizes.map((size) => (
                        <span key={size} className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-xs text-slate-700 dark:text-slate-300">
                          {size}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Contacts Table */}
            {contacts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p className="text-slate-900 dark:text-white font-medium mb-1">No contacts yet</p>
                <p className="text-sm text-slate-500">
                  {campaign.status === "processing" ? "Discovery is still in progress..." : "No contacts were discovered"}
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Match</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {contacts.map((contact) => {
                    const msgStatus = getContactMessageStatus(contact.id);
                    const seqStatus = contactSequences[contact.id];
                    const isResearched = hasResearch(contact);

                    return (
                      <tr key={contact.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                                {getInitials(contact.first_name, contact.last_name)}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium text-slate-900 dark:text-white">
                                {contact.first_name} {contact.last_name}
                              </div>
                              {contact.linkedin_url && (
                                <a href={contact.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                                  LinkedIn
                                </a>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-600 dark:text-slate-400">{contact.title || "—"}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-slate-900 dark:text-white">{contact.company_name || "—"}</div>
                            {contact.company_domain && (
                              <span className="text-xs text-slate-500">{contact.company_domain}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {contact.email ? (
                            <div>
                              <a href={`mailto:${contact.email}`} className="text-sm text-blue-600 hover:underline">
                                {contact.email}
                              </a>
                              <div className={`text-xs ${getConfidenceStyle(contact.email_confidence)}`}>
                                {contact.email_confidence}% confidence
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-slate-900 dark:text-white">
                            {contact.persona_match_score}%
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 flex-wrap">
                            {isResearched && (
                              <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                Researched
                              </span>
                            )}
                            {msgStatus?.status === "sent" && (
                              <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                Sent ({msgStatus.count})
                              </span>
                            )}
                            {(msgStatus?.status === "scheduled" || (seqStatus?.hasSequence && msgStatus?.status !== "sent" && msgStatus?.status !== "draft")) && (
                              <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                Scheduled
                              </span>
                            )}
                            {msgStatus?.status === "draft" && (
                              <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                                Composed
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {isResearched ? (
                              <>
                                <button
                                  onClick={() => handleViewResearch(contact)}
                                  className="px-2 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                >
                                  View
                                </button>
                                {(seqStatus?.hasSequence || msgStatus) && (
                                  <button
                                    onClick={() => setViewingSequenceContact(contact)}
                                    className="px-2 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                  >
                                    Details
                                  </button>
                                )}
                                {mode === "manual" && !seqStatus?.hasSequence && !msgStatus && (
                                  <button
                                    onClick={() => setComposingContact(contact)}
                                    className="px-2 py-1 text-xs font-medium bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
                                  >
                                    Sequence
                                  </button>
                                )}
                              </>
                            ) : mode === "manual" ? (
                              <button
                                onClick={() => handleResearch(contact)}
                                disabled={researchingContactId === contact.id}
                                className="px-2 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                              >
                                {researchingContactId === contact.id ? "Researching..." : "Research"}
                              </button>
                            ) : (
                              <span className="text-xs text-slate-400">Pending</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>

      {/* Research Error Toast */}
      {researchError && (
        <div className="fixed bottom-4 right-4 p-4 bg-red-50 dark:bg-red-900/90 border border-red-200 dark:border-red-800 rounded-lg shadow-lg max-w-sm">
          <div className="flex items-start gap-3">
            <span className="text-red-500">✕</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">Research Failed</p>
              <p className="text-sm text-red-700 dark:text-red-300">{researchError}</p>
            </div>
            <button onClick={() => setResearchError(null)} className="text-red-500 hover:text-red-700">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Context Research Panel */}
      {selectedResearch && selectedContact && (
        <ContextResearchPanel
          research={selectedResearch}
          contact={selectedContact}
          campaignId={campaignId}
          onClose={closeResearchPanel}
          onEmailScheduled={fetchCampaignData}
          hasSequence={contactSequences[selectedContact.id]?.hasSequence || !!getContactMessageStatus(selectedContact.id)}
        />
      )}

      {/* Email Composer */}
      {composingContact && (
        <SequenceCreator
          contact={composingContact}
          campaignId={campaignId}
          onClose={() => setComposingContact(null)}
          onSequenceCreated={() => {
            setComposingContact(null);
            fetchCampaignData();
          }}
        />
      )}

      {/* Sequence Detail Modal */}
      {viewingSequenceContact && (
        <ContactSequenceDetail
          contact={viewingSequenceContact}
          campaignId={campaignId}
          onClose={() => setViewingSequenceContact(null)}
          onStartSequence={() => {
            // Close the detail modal and open the sequence creator
            setComposingContact(viewingSequenceContact);
            setViewingSequenceContact(null);
          }}
          onSequenceChange={() => {
            // Refresh campaign data when sequence is paused/resumed/cancelled
            fetchCampaignData();
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Delete Campaign</h3>
                  <p className="text-sm text-slate-500">This action cannot be undone</p>
                </div>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Are you sure you want to delete <span className="font-medium">"{campaign?.name}"</span>?
              </p>

              <label className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg cursor-pointer mb-6">
                <input
                  type="checkbox"
                  checked={deleteContacts}
                  onChange={(e) => setDeleteContacts(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
                />
                <div>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">Also delete all contacts</span>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {totalContacts} contacts will be permanently deleted.
                  </p>
                </div>
              </label>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => { setShowDeleteModal(false); setDeleteContacts(true); }}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCampaign}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete Campaign"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
