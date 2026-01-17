"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Campaign, CampaignContactsResponse, Contact, ContextResearchResponse } from "@/lib/types";
import { authFetch } from "@/lib/auth";
import { ContextResearchPanel } from "@/components/ContextResearchPanel";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";
const CONTEXT_API_URL = process.env.NEXT_PUBLIC_CONTEXT_API_URL || "http://localhost:8002";

export default function CampaignDetailPage() {
  const params = useParams();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [totalContacts, setTotalContacts] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Context Research state
  const [mode, setMode] = useState<"manual" | "auto">("manual");
  const [researchingContactId, setResearchingContactId] = useState<string | null>(null);
  const [researchError, setResearchError] = useState<string | null>(null);
  const [selectedResearch, setSelectedResearch] = useState<ContextResearchResponse | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [contactResearch, setContactResearch] = useState<Record<string, ContextResearchResponse>>({});

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
      // Fetch campaign details
      const campaignResponse = await authFetch(API_URL + "/api/campaigns/" + campaignId);
      if (!campaignResponse.ok) {
        throw new Error("Failed to fetch campaign: " + campaignResponse.status);
      }
      const campaignData: Campaign = await campaignResponse.json();
      setCampaign(campaignData);

      // Fetch campaign contacts
      const contactsResponse = await authFetch(
        API_URL + "/api/campaigns/" + campaignId + "/contacts?limit=50&offset=0"
      );
      if (!contactsResponse.ok) {
        throw new Error("Failed to fetch contacts: " + contactsResponse.status);
      }
      const contactsData: CampaignContactsResponse = await contactsResponse.json();
      setContacts(contactsData.contacts);
      setTotalContacts(contactsData.total);
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

  // Initiate Context Research for a contact
  const handleResearch = async (contact: Contact) => {
    if (!campaign) return;
    
    setResearchingContactId(contact.id);
    setResearchError(null);

    try {
      const response = await authFetch(CONTEXT_API_URL + "/api/research", {
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
      
      // Store the research result (don't auto-open modal)
      setContactResearch((prev) => ({
        ...prev,
        [contact.id]: data,
      }));
    } catch (err) {
      console.error("Research failed:", err);
      setResearchError(err instanceof Error ? err.message : "Failed to initiate research");
    } finally {
      setResearchingContactId(null);
    }
  };

  // View existing research for a contact
  const handleViewResearch = (contact: Contact) => {
    const research = contactResearch[contact.id];
    if (research) {
      setSelectedResearch(research);
      setSelectedContact(contact);
    }
  };

  const closeResearchPanel = () => {
    setSelectedResearch(null);
    setSelectedContact(null);
  };

  const getInitials = (firstName: string | null, lastName: string | null) => {
    const first = firstName?.charAt(0) || "";
    const last = lastName?.charAt(0) || "";
    return (first + last).toUpperCase() || "?";
  };

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

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 80) {
      return <Badge className="bg-green-100 text-green-800">High ({confidence}%)</Badge>;
    } else if (confidence >= 50) {
      return <Badge className="bg-yellow-100 text-yellow-800">Medium ({confidence}%)</Badge>;
    }
    return <Badge className="bg-red-100 text-red-800">Low ({confidence}%)</Badge>;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-24">
            <div className="text-slate-500">Loading campaign...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {error || "Campaign not found"}
          </div>
          <Link href="/campaigns" className="mt-4 inline-block">
            <Button variant="outline">← Back to Campaigns</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/campaigns"
            className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          >
            ← Back to Campaigns
          </Link>
        </div>

        {/* Campaign Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                  {campaign.name}
                </h1>
                {getStatusBadge(campaign.status)}
              </div>
              <p className="text-slate-600 dark:text-slate-400 max-w-3xl">
                {campaign.solution_description}
              </p>
            </div>
          </div>
        </div>

        {/* Campaign Details Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Stats */}
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Contacts</CardDescription>
              <CardTitle className="text-3xl">{campaign.total_contacts}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Enriched</CardDescription>
              <CardTitle className="text-3xl">{campaign.enriched_contacts}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Enrichment Rate</CardDescription>
              <CardTitle className="text-3xl">
                {campaign.total_contacts > 0
                  ? Math.round((campaign.enriched_contacts / campaign.total_contacts) * 100)
                  : 0}
                %
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Target Criteria */}
        {campaign.target_criteria && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Target Criteria</CardTitle>
              <CardDescription>AI-generated targeting for this campaign</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Job Titles */}
                <div>
                  <span className="text-xs text-slate-500 uppercase tracking-wide">
                    Job Titles
                  </span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {campaign.target_criteria.job_titles.map((title) => (
                      <Badge key={title} variant="secondary">
                        {title}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Industries */}
                <div>
                  <span className="text-xs text-slate-500 uppercase tracking-wide">
                    Industries
                  </span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {campaign.target_criteria.industries.map((industry) => (
                      <Badge key={industry} variant="outline">
                        {industry}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Company Sizes */}
                <div>
                  <span className="text-xs text-slate-500 uppercase tracking-wide">
                    Company Sizes
                  </span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {campaign.target_criteria.company_sizes.map((size) => (
                      <Badge key={size} variant="outline">
                        {size}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Pain Points */}
                {campaign.target_criteria.pain_points && campaign.target_criteria.pain_points.length > 0 && (
                  <div>
                    <span className="text-xs text-slate-500 uppercase tracking-wide">
                      Pain Points
                    </span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {campaign.target_criteria.pain_points.map((point) => (
                        <Badge
                          key={point}
                          variant="secondary"
                          className="bg-amber-100 text-amber-800"
                        >
                          {point}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* AI Reasoning */}
              {campaign.reasoning && (
                <div className="mt-6 pt-6 border-t">
                  <span className="text-xs text-slate-500 uppercase tracking-wide">
                    AI Reasoning
                  </span>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 italic">
                    {campaign.reasoning}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Contacts Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Campaign Contacts</CardTitle>
                <CardDescription>
                  {totalContacts} contacts discovered for this campaign
                </CardDescription>
              </div>
              <Button variant="outline" onClick={fetchCampaignData}>
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {contacts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="text-slate-400 mb-2">
                  <svg
                    className="w-12 h-12 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                  No contacts found yet
                </p>
                <p className="text-sm text-slate-500">
                  {campaign.status === "processing"
                    ? "Discovery is still in progress..."
                    : "No contacts were discovered for this campaign"}
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contact</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Match Score</TableHead>
                      <TableHead>Confidence</TableHead>
                      {mode === "manual" && <TableHead>Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contacts.map((contact) => (
                      <TableRow key={contact.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback className="bg-slate-200 text-slate-600 text-xs">
                                {getInitials(contact.first_name, contact.last_name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {contact.first_name} {contact.last_name}
                              </div>
                              {contact.linkedin_url && (
                                <a
                                  href={contact.linkedin_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:underline"
                                >
                                  LinkedIn
                                </a>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-slate-600 dark:text-slate-400">
                            {contact.title || "—"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {contact.company_name || "—"}
                            </div>
                            {contact.company_domain && (
                              <span className="text-xs text-slate-500">
                                {contact.company_domain}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {contact.email ? (
                            <a
                              href={`mailto:${contact.email}`}
                              className="text-sm text-blue-600 hover:underline"
                            >
                              {contact.email}
                            </a>
                          ) : (
                            <span className="text-sm text-slate-400">
                              Not available
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {contact.persona_match_score}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {getConfidenceBadge(contact.email_confidence)}
                        </TableCell>
                        {mode === "manual" && (
                          <TableCell>
                            {contactResearch[contact.id] ? (
                              <div className="flex items-center gap-2">
                                <Badge className="bg-green-100 text-green-800">
                                  ✓ Researched
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewResearch(contact)}
                                >
                                  View
                                </Button>
                              </div>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleResearch(contact)}
                                disabled={researchingContactId === contact.id}
                              >
                                {researchingContactId === contact.id ? (
                                  <>
                                    <span className="animate-spin mr-1">⏳</span>
                                    Researching...
                                  </>
                                ) : (
                                  <>🔍 Research</>
                                )}
                              </Button>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Research Error */}
        {researchError && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            <div className="flex items-start gap-2">
              <span>❌</span>
              <div>
                <p className="font-medium">Research Failed</p>
                <p>{researchError}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2"
              onClick={() => setResearchError(null)}
            >
              Dismiss
            </Button>
          </div>
        )}
      </div>

      {/* Context Research Panel */}
      {selectedResearch && selectedContact && (
        <ContextResearchPanel
          research={selectedResearch}
          contact={selectedContact}
          onClose={closeResearchPanel}
        />
      )}
    </div>
  );
}
