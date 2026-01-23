# ContextReach Frontend Guide

## Overview

A Next.js frontend for the ContextReach outreach platform with a **pipeline workflow** (Part A → B → C → D → E).

**Mode Toggle**: Manual (step-by-step) vs Auto (runs all parts automatically)

---

## Auto Mode vs Manual Mode

| Mode | What You Do | What Happens Automatically |
|------|-------------|---------------------------|
| **Auto Mode** | 1 API call → wait | Discovery → Research → Composition → Scheduling → Sending |
| **Manual Mode** | Trigger each step | You control when each phase runs |

### Auto Mode
One click starts the entire pipeline:
1. Discovers contacts matching your solution
2. Researches each contact for buying signals  
3. Creates personalized email sequences
4. Schedules emails with human-like timing
5. Sends emails at scheduled times

```typescript
// Auto Mode API
POST /api/orchestration/auto-start
{
  "solution_description": "...",
  "max_contacts": 10,
  "enrich_credits": 10,
  "sequence_config": {
    "max_steps": 3,
    "stop_on_reply": true,
    "timing_strategy": "human_like"
  }
}

// Poll for progress
GET /api/orchestration/pipeline/{orchestration_id}
```

### Manual Mode
Control each step yourself:
1. **Discovery**: Find and enrich contacts
2. **Research**: Click "Research" on each contact
3. **Sequence**: Click "Sequence" to create emails
4. **Monitor**: View status in campaign details

```typescript
// Manual Mode APIs
POST /api/analyze-solution              // Step 1: Discovery
POST /api/orchestration/manual/research-all/{campaignId}  // Step 2: Research all
POST /api/orchestration/manual/compose-all/{campaignId}   // Step 3: Compose all
GET /api/orchestration/manual/job/{jobId}                 // Check job status
```

---

## Architecture

### Backend Services
| Service | Port | Purpose |
|---------|------|---------|
| Part A: Discovery Engine | 8001 | Find and enrich contacts |
| Part B: Context Engine | 8002 | Research contacts, find buying signals |
| Part C: Compose Engine | 8003 | Create email sequences |
| Part D: Delivery Engine | 8004 | Send emails, track events, analytics |

### Environment Variables
```bash
NEXT_PUBLIC_API_URL=http://localhost:8001
NEXT_PUBLIC_CONTEXT_API_URL=http://localhost:8002
NEXT_PUBLIC_COMPOSE_API_URL=http://localhost:8003
NEXT_PUBLIC_DELIVERY_API_URL=http://localhost:8004
```

---

## Part A: Discovery Engine

### What Part A Does
1. User describes their solution
2. AI generates targeting criteria (job titles, industries)
3. Apollo.io finds matching contacts
4. Contacts are enriched with emails
5. Results saved to database

### User Input Required
```
┌────────────────────────────────────────────────┐
│ Solution Description (textarea)                │
│ "biometric identity platform for securing..."  │
├────────────────────────────────────────────────┤
│ Max Contacts: [10]  │  Enrich Credits: [5]    │
├────────────────────────────────────────────────┤
│ [🔍 Start Discovery]                           │
└────────────────────────────────────────────────┘
```

### API Endpoint
```
POST http://localhost:8001/api/analyze-solution
{
  "solution_description": "...",
  "max_contacts": 10,
  "enrich_credits": 5,
  "auto_discover": true
}
```

### What to Show User
1. **Progress** - Job status polling (0-100%)
2. **Results** - Table of discovered contacts
3. **Next Step** - "Proceed to Part B" button (in Manual mode)

---

## Part B: Context Research

### What Part B Does
1. Takes a contact from Part A
2. Researches their company for buying signals
3. Identifies pain points, news, hiring signals
4. Returns context for email personalization

### API Endpoint
```
POST http://localhost:8002/api/research
{
  "contact_id": "uuid",
  "product_value_prop": "Your solution description"
}
```

---

## Part C: Email Sequences

### Key Concept: Multi-Step Sequences
Part C creates a sequence of up to 4 emails per contact:
- **Step 1**: Introduction
- **Step 2**: Value proposition  
- **Step 3**: Question/engagement
- **Step 4**: Breakup (final attempt)

The sequence automatically stops when:
- Contact replies
- Contact bounces
- Breakup email is sent
- User pauses/cancels the sequence

### Create a Sequence
```typescript
POST http://localhost:8003/api/sequence/create
{
  "contact_id": "uuid",
  "campaign_id": "uuid",
  "sequence_config": {
    "max_steps": 3,
    "stop_on_reply": true,
    "timing_strategy": "human_like" // or "aggressive" | "patient"
  },
  "signature": {
    "first_name": "John",
    "last_name": "Doe",
    "title": "Sales",
    "company": "Acme Inc",
    "closing": "best_regards"
  }
}
```

### Get Sequence Status
```typescript
GET http://localhost:8003/api/sequence/{contactId}?campaign_id={campaignId}

// Returns:
{
  "contact_id": "...",
  "sequence_state": {
    "current_step": 2,
    "last_sent_at": "2026-01-22T14:32:15.000Z",
    "next_send_window": "2026-01-25T10:15:00.000Z",
    "is_paused": false,
    "reply_detected": false
  },
  "messages": [
    {
      "step": 1,
      "message_id": "...",
      "intent": "introduction",
      "subject": "Quick question about...",
      "status": "sent",
      "scheduled_send_at": "...",
      "sent_at": "..."
    }
  ]
}
```

### Sequence Controls
```typescript
// Pause
POST http://localhost:8003/api/sequence/{contactId}/pause

// Resume
POST http://localhost:8003/api/sequence/{contactId}/resume

// Cancel (deletes all pending emails)
DELETE http://localhost:8003/api/sequence/{contactId}
```

---

## Part D: Analytics & Events

### Campaign Analytics
```typescript
GET http://localhost:8004/api/analytics/campaign/{campaignId}

// Returns:
{
  "campaign_id": "...",
  "total_sent": 150,
  "delivered": 145,
  "bounced": 5,
  "opened": 89,
  "clicked": 23,
  "replied": 18,
  "reply_rate": 12.4,
  "positive_replies": 12,
  "negative_replies": 4,
  "neutral_replies": 2,
  "deliverability_rate": 96.7,
  "average_time_to_reply": "2 days 4 hours"
}
```

### Contact Events
```typescript
GET http://localhost:8004/api/events/contact/{contactId}

// Returns all events: sent, delivered, opened, clicked, bounced, replied
```

---

## Project Structure

```
frontend/
├── app/
│   ├── page.tsx                 # Dashboard with pipeline view
│   ├── layout.tsx               # Nav + settings toggle
│   └── settings/page.tsx        # Mode toggle (Manual/Auto)
├── components/
│   ├── pipeline/
│   │   ├── PipelineStatus.tsx   # Shows A→B→C→D→E progress
│   │   └── StepCard.tsx         # Individual step card
│   ├── discovery/
│   │   ├── DiscoveryForm.tsx    # Solution input form
│   │   ├── JobProgress.tsx      # Progress bar + status
│   │   └── ContactsTable.tsx    # Results table
│   ├── sequences/
│   │   ├── SequenceCreator.tsx  # Create email sequences
│   │   ├── EmailSequenceTimeline.tsx # Visual timeline of sequence steps
│   │   └── ContactSequenceDetail.tsx # Full sequence status with controls
│   └── ui/                      # shadcn components
├── lib/
│   ├── api.ts                   # API client
│   └── types.ts                 # TypeScript types
└── hooks/
    ├── useDiscoveryJob.ts       # Polling hook
    ├── useSequence.ts           # Manage sequence state
    └── useCampaignAnalytics.ts   # Fetch campaign-wide analytics
```

---

## Key Components

### 1. Pipeline Status (Top of Dashboard)

```
[A: Discovery] → [B: Research] → [C: Compose] → [D: Deliver] → [E: Integrate]
    ✅ Done        ⏳ Waiting      ○ Pending      ○ Pending      ○ Pending
```

### 2. Discovery Form

```tsx
// components/discovery/DiscoveryForm.tsx
interface FormData {
  solutionDescription: string;
  maxContacts: number;
  enrichCredits: number;
}
```

### 3. Job Progress (Polling)

```tsx
// hooks/useDiscoveryJob.ts
// Poll GET /api/discover/{jobId} every 2 seconds until complete
```

### 4. Contacts Table

| Name | Title | Company | Email | Status |
|------|-------|---------|-------|--------|
| Jon Debonis | Head of Security | Notable | jon@... | ✅ Enriched |

### 5. "Proceed to Part B" Button

Only shows when:
- Discovery is complete
- Mode is Manual
- At least 1 contact found

### 6. Sequence Creator

```tsx
// components/sequences/SequenceCreator.tsx
interface SequenceData {
  contactId: string;
  campaignId: string;
  maxSteps: number;
  stopOnReply: boolean;
  timingStrategy: "human_like" | "aggressive" | "patient";
  signature: {
    firstName: string;
    lastName: string;
    title: string;
    company: string;
    closing: string;
  };
}
```

### 7. Email Sequence Timeline

```tsx
// components/sequences/EmailSequenceTimeline.tsx
type SequenceStatus = 
  | "draft" 
  | "scheduled" 
  | "sent" 
  | "delivered" 
  | "bounced" 
  | "replied" 
  | "failed" 
  | "cancelled";
```

---

## Setup Commands

```bash
# Create Next.js app
npx create-next-app@latest frontend --typescript --tailwind --app

cd frontend

# Add UI components
npx shadcn@latest init
npx shadcn@latest add button input textarea card badge progress table

# Environment
echo "NEXT_PUBLIC_API_URL=http://localhost:8001" > .env.local

# Run
npm run dev
```

---

## API Integration

```typescript
// lib/api.ts
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

export const api = {
  // Start discovery
  analyzeSolution: (data: DiscoveryRequest) =>
    fetch(`${API}/api/analyze-solution`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(r => r.json()),

  // Poll job status
  getJobStatus: (jobId: string) =>
    fetch(`${API}/api/discover/${jobId}`).then(r => r.json()),

  // Get contacts
  getContacts: () =>
    fetch(`${API}/api/contacts`).then(r => r.json()),

  // Research contact
  researchContact: (data: ResearchRequest) =>
    fetch(`${API}/api/research`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(r => r.json()),

  // Create email sequence
  createSequence: (data: SequenceRequest) =>
    fetch(`${API}/api/sequence/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(r => r.json()),

  // Get sequence status
  getSequenceStatus: (contactId: string, campaignId: string) =>
    fetch(`${API}/api/sequence/${contactId}?campaign_id=${campaignId}`).then(r => r.json()),

  // Pause sequence
  pauseSequence: (contactId: string) =>
    fetch(`${API}/api/sequence/${contactId}/pause`, { method: 'POST' }).then(r => r.json()),

  // Resume sequence
  resumeSequence: (contactId: string) =>
    fetch(`${API}/api/sequence/${contactId}/resume`, { method: 'POST' }).then(r => r.json()),

  // Cancel sequence
  cancelSequence: (contactId: string) =>
    fetch(`${API}/api/sequence/${contactId}`, { method: 'DELETE' }).then(r => r.json()),

  // Get campaign analytics
  getCampaignAnalytics: (campaignId: string) =>
    fetch(`${API}/api/analytics/campaign/${campaignId}`).then(r => r.json()),

  // Get contact events
  getContactEvents: (contactId: string) =>
    fetch(`${API}/api/events/contact/${contactId}`).then(r => r.json()),
};
```

---

## User Flow (Manual Mode)

```
1. User lands on Dashboard
2. Pipeline shows: [A: Ready] → [B: Locked] → ...
3. User fills Discovery Form → clicks "Start Discovery"
4. Progress bar shows job status
5. On complete: Contacts table appears
6. User reviews contacts
7. User clicks "Proceed to Part B →"
8. Pipeline updates: [A: ✅] → [B: Ready] → ...
```

---

## What's Next

After Part A frontend works:
- **Part B**: Research contacts (show research results)
- **Part C**: Compose emails (show generated drafts)
- **Part D**: Delivery status (show send progress)
- **Part E**: CRM sync status

Each part follows same pattern:
1. Show current data
2. Trigger action
3. Show progress
4. Display results
5. "Proceed to next" button
