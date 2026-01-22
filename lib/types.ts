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
  // Intelligence fields (when include_intelligence=true)
  has_research?: boolean;
  intelligence_id?: string | null;
  relevance_score?: number | null;
  is_fresh?: boolean;
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

// Email Signature Types
export type ClosingStyle = "best_regards" | "thanks" | "cheers" | "sincerely" | "warm_regards";

export interface EmailSignature {
  id: string;
  user_id: string;
  name: string;
  first_name: string;
  last_name: string | null;
  title: string | null;
  company: string | null;
  closing: ClosingStyle;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateSignatureRequest {
  name: string;
  first_name: string;
  last_name?: string;
  title?: string;
  company?: string;
  closing?: ClosingStyle;
  is_default?: boolean;
}

export interface UpdateSignatureRequest {
  name?: string;
  first_name?: string;
  last_name?: string;
  title?: string;
  company?: string;
  closing?: ClosingStyle;
  is_default?: boolean;
}

// Composition Engine Types (Part C)
export type EmailTone = "casual" | "professional" | "excited";
export type EmailLength = "short" | "medium" | "long";
export type EmailIntent = "introduction" | "value_prop" | "question" | "breakup";

export interface ComposeOverrides {
  tone?: EmailTone;
  length?: EmailLength;
}

export interface SignaturePayload {
  first_name: string;
  last_name?: string | null;
  title?: string | null;
  company?: string | null;
  closing: ClosingStyle;
}

export interface ComposeRequest {
  contact_id: string;
  campaign_id: string;
  sequence_step?: number;
  overrides?: ComposeOverrides;
  signature?: SignaturePayload;
}

export interface HumanLikeTiming {
  min_delay: string;
  max_delay: string;
  send_window: string;
}

export interface ComposeResponse {
  message_id: string;
  subject: string;
  body: string;
  intent: EmailIntent;
  scheduled_send_at: string;
  human_like_timing: HumanLikeTiming;
}

export interface PreviewResponse {
  subject: string;
  body: string;
  intent: EmailIntent;
  preview: boolean;
}

export interface SequenceMessage {
  step: number;
  message_id: string;
  scheduled_send_at: string;
  status: "scheduled" | "sent" | "cancelled";
}

export interface SequenceResponse {
  sequence_id: string;
  contact_id: string;
  campaign_id: string;
  total_steps: number;
  current_step: number;
  status: "active" | "paused" | "completed" | "cancelled";
  messages: SequenceMessage[];
}

export interface StartSequenceRequest {
  contact_id: string;
  campaign_id: string;
  total_steps: number;
  signature?: SignaturePayload;
}

// Message Types (from Composition Engine)
export type MessageStatus = "draft" | "scheduled" | "sent" | "delivered" | "bounced" | "replied" | "failed" | "cancelled";

export interface Message {
  id: string;
  contact_id: string;
  campaign_id: string;
  sequence_step: number;
  subject: string;
  body: string;
  intent: EmailIntent;
  status: MessageStatus;
  scheduled_send_at: string;
  sent_at: string | null;
  created_at: string;
}

export interface MessagesResponse {
  messages: Message[];
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
}

// Intelligence Status (from Discovery Engine)
export interface ContactIntelligence {
  contact_id: string;
  has_research: boolean;
  intelligence_id: string | null;
  relevance_score: number | null;
  is_fresh: boolean;
  created_at: string | null;
  ttl: string | null;
  refreshed_at: string | null;
}

// Sequence Types (Part C - Multi-step sequences)
export type TimingStrategy = "human_like" | "aggressive" | "patient";

export interface SequenceConfig {
  max_steps: number;
  stop_on_reply: boolean;
  timing_strategy: TimingStrategy;
}

export interface CreateSequenceRequest {
  contact_id: string;
  campaign_id: string;
  sequence_config: SequenceConfig;
  signature?: SignaturePayload;
}

export interface SequenceStep {
  step: number;
  message_id: string;
  intent: EmailIntent;
  subject: string;
  scheduled_send_at: string;
  sent_at?: string | null;
  status: MessageStatus;
}

export interface CreateSequenceResponse {
  sequence_id: string;
  contact_id: string;
  campaign_id: string;
  status: "scheduled" | "active" | "paused" | "completed" | "cancelled";
  steps: SequenceStep[];
}

export interface SequenceState {
  current_step: number;
  last_sent_at: string | null;
  next_send_window: string | null;
  is_paused: boolean;
  reply_detected: boolean;
}

export interface SequenceStatusResponse {
  contact_id: string;
  campaign_id?: string;
  sequence_state: SequenceState | null;
  is_locked: boolean;
  lock_reason: string | null;
  messages: SequenceStep[];
}

// Event Types (Part D - Delivery tracking)
export type EventType = "sent" | "delivered" | "opened" | "clicked" | "bounced" | "replied" | "unsubscribed";

export interface EmailEvent {
  id: string;
  message_id: string;
  contact_id: string;
  type: EventType;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface ContactEventsResponse {
  contact_id: string;
  events: EmailEvent[];
}

export interface MessageEventsResponse {
  message_id: string;
  events: EmailEvent[];
}

// Analytics Types (Part D)
export interface CampaignAnalytics {
  campaign_id: string;
  total_sent: number;
  delivered: number;
  bounced: number;
  opened: number;
  clicked: number;
  replied: number;
  reply_rate: number;
  positive_replies: number;
  negative_replies: number;
  neutral_replies: number;
  deliverability_rate: number;
  open_rate: number;
  click_rate: number;
  average_time_to_reply: string | null;
}
