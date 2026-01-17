# ContextReach Frontend Guide

## Overview

A Next.js frontend for the ContextReach outreach platform with a **pipeline workflow** (Part A → B → C → D → E).

**Mode Toggle**: Manual (step-by-step) vs Auto (runs all parts automatically)

---

## Part A: Discovery Engine (Current Focus)

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
│   └── ui/                      # shadcn components
├── lib/
│   ├── api.ts                   # API client
│   └── types.ts                 # TypeScript types
└── hooks/
    └── useDiscoveryJob.ts       # Polling hook
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
