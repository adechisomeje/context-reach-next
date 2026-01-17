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
