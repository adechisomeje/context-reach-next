export interface TargetCriteria {
  job_titles: string[];
  industries: string[];
  company_sizes: string[];
  pain_points?: string[];
  keywords?: string[];
}

export interface DiscoveryResponse {
  product_description: string;
  target_criteria: TargetCriteria;
  reasoning: string;
  job_id: string;
  campaign_id: string;
  status: "analysis_complete" | "discovery_started";
}

export interface JobStatusResponse {
  job_id: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  total_contacts: number;
  processed_contacts: number;
  created_at: string;
  updated_at: string;
  error: string | null;
}

export interface Contact {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  company_name: string | null;
  company_domain: string | null;
  title: string | null;
  linkedin_url: string | null;
  persona_match_score: number;
  email_confidence: number;
  source: string;
  discovery_campaign_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContactsResponse {
  contacts: Contact[];
  total: number;
  limit: number;
  offset: number;
}

// Campaign Types
export interface Campaign {
  id: string;
  name: string;
  solution_description: string;
  product_description: string | null;
  target_criteria: TargetCriteria | null;
  reasoning: string | null;
  status: "pending" | "processing" | "completed" | "failed";
  total_contacts: number;
  enriched_contacts: number;
  created_at: string;
  updated_at: string;
}

export interface CampaignsResponse {
  campaigns: Campaign[];
  total: number;
  limit: number;
  offset: number;
}

export interface CampaignContactsResponse {
  campaign_id: string;
  campaign_name: string;
  solution_description: string;
  target_criteria: TargetCriteria | null;
  contacts: Contact[];
  total: number;
  limit: number;
  offset: number;
}

// Context Research Types (Part B)
export interface BuyingSignal {
  type: string;
  title: string;
  summary: string;
  source: string;
  date: string;
  strength: "strong" | "medium" | "weak";
}

export interface CompanyContext {
  buying_signals: BuyingSignal[];
  industry_context: BuyingSignal[];
  regulatory_events: BuyingSignal[];
  company_news: BuyingSignal[];
  hiring_signals: BuyingSignal[];
  signal_strength: "strong" | "medium" | "weak";
  recommended_hook: string;
  product_category: string;
  news: BuyingSignal[];
  peer_activity: BuyingSignal[];
}

export interface MessagingBrief {
  recommended_angles: string[];
  tone_guidance: string;
  urgency_level: "low" | "medium" | "high";
  personalization_hooks: string[];
  opening_hook: string;
}

export interface ContextResearchResponse {
  intelligence_id: string;
  contact_id: string;
  company_context: CompanyContext;
  messaging_brief: MessagingBrief;
  relevance_score: number;
  ttl: string;
  signal_strength: "strong" | "medium" | "weak";
  recommended_hook: string;
}

export interface ContextResearchRequest {
  contact_id: string;
  product_value_prop: string;
  research_depth?: "standard" | "deep";
}
