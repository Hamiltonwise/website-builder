# Website Builder MVP — Implementation Plan

> Master checkpoint document for building the AI-powered website builder.
> Each phase builds on the previous. Check off tasks as completed.

---

## Current State Assessment

### What Exists
- [x] Next.js 15 project (Pages Router, not App Router)
- [x] Prisma connected to PostgreSQL (AWS RDS)
- [x] tRPC setup with React Query
- [x] Tailwind CSS configured
- [x] Basic `Post` model (starter template artifact)
- [x] Database schema namespace: `website_builder`

### What's Missing (Per MVP Spec)
- [ ] App Router (MVP spec requires it for middleware/hostname routing)
- [ ] Core domain models (Project, Page, Template, Job)
- [ ] Service layer (`lib/services/`)
- [ ] Middleware for hostname-based routing
- [ ] n8n webhook endpoints
- [ ] Dashboard UI

### Key Decision: Pages Router vs App Router

The MVP spec explicitly requires **App Router** for:
1. Middleware hostname parsing and rewrites
2. Server components for HTML rendering
3. Route handlers for webhooks

**Recommendation**: Migrate to App Router while preserving tRPC for data fetching.

---

## Environment Variables Required

Add these to `.env`:

```env
# Existing
DATABASE_URL=postgresql://...

# Phase 2: Hostname routing
BASE_DOMAIN=sites.localhost

# Phase 5: n8n webhooks
N8N_WEBHOOK_SECRET=your-secret-here
N8N_BASE_URL=https://your-n8n-instance.com

# n8n workflow webhook URLs
N8N_WEBHOOK_GBP_SCRAPE=https://...
N8N_WEBHOOK_IMAGE_ANALYSIS=https://...
N8N_WEBHOOK_WEBSITE_SCRAPE=https://...
N8N_WEBHOOK_HTML_GENERATION=https://...
```

---

## Phase 1 — Project Foundation & Database Schema

### 1.1 Prisma Schema Updates
- [ ] Create `ProjectStatus` enum
- [ ] Create `PageStatus` enum
- [ ] Create `JobType` enum
- [ ] Create `JobStatus` enum
- [ ] Create `Project` model
- [ ] Create `Page` model
- [ ] Create `Template` model
- [ ] Create `Job` model (Phase 3 prep)
- [ ] Add indexes for hostname lookup, page queries
- [ ] Remove or keep `Post` model (can remove - it's starter artifact)

### 1.2 Folder Structure Setup
- [ ] Create `lib/` directory
- [ ] Create `lib/db.ts` — Prisma client singleton
- [ ] Create `lib/services/` directory

### 1.3 Service Layer
- [ ] `lib/services/project.service.ts`
  - [ ] `createProject(userId, hostname?)`
  - [ ] `getProjectById(id)`
  - [ ] `getProjectByHostname(hostname)`
  - [ ] `updateProject(id, data)`
- [ ] `lib/services/page.service.ts`
  - [ ] `createPageVersion(projectId, path, htmlContent)`
  - [ ] `getPublishedPage(projectId, path)`
  - [ ] `getDraftPage(projectId, path)`
  - [ ] `getAllPageVersions(projectId, path)`
- [ ] `lib/services/template.service.ts`
  - [ ] `getActiveTemplate()`
  - [ ] `getTemplateById(id)`

### 1.4 Migration & Validation
- [ ] Run `prisma migrate dev`
- [ ] Verify `npm run dev` boots without errors
- [ ] Test creating a project via service
- [ ] Test creating a page via service

### 1.5 Seed Script
- [ ] Update `prisma/seed.ts`
  - [ ] Create one template with placeholder HTML
  - [ ] Create one test project
  - [ ] Create one draft page for test project

---

## Phase 2 — Hostname Routing & Preview Rendering

### 2.1 App Router Migration (Required)
- [ ] Create `app/` directory
- [ ] Create `app/layout.tsx` — root layout
- [ ] Create `app/page.tsx` — landing page (can be minimal)
- [ ] Migrate or keep Pages Router for dashboard (hybrid approach ok)
- [ ] Update `next.config.ts` if needed

### 2.2 Middleware Setup
- [ ] Create `middleware.ts` in project root
- [ ] Parse `Host` header
- [ ] Detect subdomain pattern: `{hostname}.{BASE_DOMAIN}`
- [ ] Rewrite matching requests to `/__sites/[hostname]/[...path]`
- [ ] Ignore: `localhost`, `www`, non-matching domains
- [ ] Configure matcher to exclude `_next`, `api`, static assets

### 2.3 Internal Site Rendering Route
- [ ] Create `app/__sites/[hostname]/page.tsx`
- [ ] Lookup project by `generated_hostname`
- [ ] Load published page (fallback to draft)
- [ ] Return raw HTML response with `Content-Type: text/html`
- [ ] Handle 404 for missing project/page

### 2.4 Environment Config
- [ ] Add `BASE_DOMAIN=sites.localhost` to `.env`
- [ ] Update `lib/env.ts` or create new env validation

### 2.5 Local DNS Setup (Documentation)
- [ ] Document `/etc/hosts` entry or dnsmasq setup for `*.sites.localhost`
- [ ] Alternative: Use `nip.io` or similar for local wildcard testing

### 2.6 Validation
- [ ] Seed a project with hostname `test.sites.localhost`
- [ ] Seed a draft page with simple HTML
- [ ] Visit `test.sites.localhost:7777` → see HTML
- [ ] Visit `unknown.sites.localhost:7777` → see 404

---

## Phase 3 — Job System & Project Status Engine

### 3.1 Job Model (Already in Phase 1 Schema)
- [ ] Verify `Job` model has all fields:
  - `id`, `projectId`, `type`, `status`, `attempts`
  - `payload`, `error`, `startedAt`, `finishedAt`
  - `createdAt`, `updatedAt`

### 3.2 Job Service
- [ ] Create `lib/services/job.service.ts`
  - [ ] `createJob(projectId, type, payload?)`
  - [ ] `startJob(jobId)`
  - [ ] `completeJob(jobId, result?)`
  - [ ] `failJob(jobId, error)`
  - [ ] `getActiveJobs(projectId)`
  - [ ] `getJobsByProject(projectId)`

### 3.3 Project Status Service
- [ ] Create `lib/services/project-status.service.ts`
  - [ ] Define valid transitions map
  - [ ] `advanceStatus(projectId, toStatus)` — validates transition
  - [ ] `canTransition(fromStatus, toStatus)` — helper
  - [ ] Reject invalid transitions with clear errors

### 3.4 Status Transition Rules
```
CREATED → GBP_SELECTED ✓
GBP_SELECTED → GBP_SCRAPED ✓
GBP_SCRAPED → IMAGES_ANALYZED ✓
IMAGES_ANALYZED → WEBSITE_SCRAPED ✓
WEBSITE_SCRAPED → HTML_GENERATED ✓
HTML_GENERATED → READY ✓

Any skip = REJECTED
```

### 3.5 Dashboard UI (Minimal)
- [ ] Create `/dashboard` route
- [ ] Create `/dashboard/projects` — list user's projects
- [ ] Create `/dashboard/projects/[id]` — project detail
  - [ ] Show project hostname
  - [ ] Show current status
  - [ ] Show status stepper (visual progress)
  - [ ] Show active jobs
  - [ ] Refresh button

### 3.6 Validation
- [ ] Create a project, verify status is `CREATED`
- [ ] Simulate job completion, verify status advances
- [ ] Attempt invalid transition, verify rejection
- [ ] Dashboard reflects DB state after refresh

---

## Phase 4 — GBP Selector & Website Confirmation Flow

### 4.1 GBP Service (Stubbed)
- [ ] Create `lib/services/gbp.service.ts`
  - [ ] `listGbpProfiles(userId)` — returns mock data
  - [ ] `getGbpProfile(profileId)` — returns mock data

### 4.2 Mock GBP Data
```typescript
const mockProfiles = [
  {
    id: 'gbp-1',
    businessName: 'Dental Cure Clinic',
    address: '123 Main St, City, ST 12345',
    category: 'Dentist',
    websiteUrl: 'https://dentalcure.example.com',
    phone: '(555) 123-4567'
  },
  // ... 2-3 more
]
```

### 4.3 GBP Selection UI
- [ ] On `/dashboard/projects/[id]` when status is `CREATED`:
  - [ ] Show "Connect your Google Business Profile" prompt
  - [ ] Display list of mock GBP profiles
  - [ ] Each shows: name, address, category, website (if any)
  - [ ] "Select" button on each

### 4.4 Website Confirmation UI
- [ ] After GBP selection, show confirmation screen:
  - [ ] Display detected website URL
  - [ ] Allow edit (text input)
  - [ ] Allow clear (set to null)
  - [ ] "Confirm" button
- [ ] Clear messaging about what happens next

### 4.5 Confirmation Handler
- [ ] On confirm:
  - [ ] Save `gbp_data` JSON to project
  - [ ] Save confirmed `website_url` to project (new field or in gbp_data)
  - [ ] Advance status: `CREATED → GBP_SELECTED`

### 4.6 Validation
- [ ] User can select GBP profile
- [ ] User can edit/clear website URL
- [ ] Status advances to `GBP_SELECTED`
- [ ] Page reload shows same state
- [ ] Cannot re-select GBP after confirmation (status guards)

---

## Phase 5 — n8n Webhook Integration

### 5.1 Webhook Route Structure
- [ ] Create `app/api/webhooks/n8n/gbp-scrape/route.ts`
- [ ] Create `app/api/webhooks/n8n/image-analysis/route.ts`
- [ ] Create `app/api/webhooks/n8n/website-scrape/route.ts`
- [ ] Create `app/api/webhooks/n8n/html-generation/route.ts`

### 5.2 Webhook Security
- [ ] Each route validates `x-webhook-secret` header
- [ ] Reject with 401 if missing/invalid
- [ ] Add `N8N_WEBHOOK_SECRET` to env validation

### 5.3 Webhook Handler Pattern
```typescript
// Each webhook follows this pattern:
1. Validate secret
2. Parse body: { projectId, jobId, success, data?, error? }
3. Load job, verify it exists and is running
4. If success:
   - Persist data to project (gbp_data, scraped_website_data, etc.)
   - Mark job complete
   - Advance project status
5. If error:
   - Mark job failed with error message
   - Do NOT advance status
6. Return 200 OK
```

### 5.4 Job Triggering Service
- [ ] Create `lib/services/workflow-trigger.service.ts`
  - [ ] `triggerGbpScrape(projectId)`
  - [ ] `triggerImageAnalysis(projectId)`
  - [ ] `triggerWebsiteScrape(projectId)`
  - [ ] `triggerHtmlGeneration(projectId)`
- [ ] Each function:
  - [ ] Creates job (pending)
  - [ ] POSTs to n8n webhook URL with `{ projectId, jobId, callbackUrl }`
  - [ ] Marks job as running
  - [ ] Returns job ID

### 5.5 Status-Based Auto-Triggering
- [ ] When status advances to `GBP_SELECTED` → trigger `GBP_SCRAPE`
- [ ] When `GBP_SCRAPE` completes → trigger `IMAGE_ANALYSIS`
- [ ] When `IMAGE_ANALYSIS` completes → trigger `WEBSITE_SCRAPE` (if URL exists)
- [ ] When all inputs ready → trigger `HTML_GENERATION`

### 5.6 Fallback Behavior
- [ ] No website URL → skip `WEBSITE_SCRAPE`, proceed to HTML generation
- [ ] Partial data → still generate HTML with available data
- [ ] Job failure → log, don't advance, allow retry (future)

### 5.7 Dashboard Updates
- [ ] Show job status on project detail page
- [ ] Show progress messages:
  - "Fetching your Google Business Profile data..."
  - "Analyzing photos..."
  - "Scraping website content..."
  - "Generating your website..."

### 5.8 Validation
- [ ] Trigger GBP scrape after selection
- [ ] n8n calls back → data persisted → status advances
- [ ] Chain continues automatically
- [ ] Page reload shows correct state
- [ ] Simulate failure → job marked failed, status stuck

---

## Phase 6 — Versioned Pages & Publishing Logic

### 6.1 Page Creation on HTML Generation
- [ ] When `HTML_GENERATION` webhook succeeds:
  - [ ] Get latest page version for project + path "/"
  - [ ] Create new page: `version = last + 1`, `status = draft`
  - [ ] Mark any existing draft as `inactive`

### 6.2 Publish Service
- [ ] Create `lib/services/publish.service.ts`
  - [ ] `publishPage(projectId, path)`
    - [ ] Find current draft
    - [ ] Mark current published (if any) as inactive
    - [ ] Promote draft → published
    - [ ] Advance project status: `HTML_GENERATED → READY`

### 6.3 Revert Service
- [ ] Create `lib/services/revert.service.ts`
  - [ ] `revertToVersion(projectId, path, version)`
    - [ ] Load target version (must be inactive)
    - [ ] Mark current draft as inactive
    - [ ] Clone target as new draft (new version number)

### 6.4 Dashboard Controls
- [ ] On project detail page:
  - [ ] Show version list (version, status, timestamp)
  - [ ] "Publish" button (visible if draft exists, status = HTML_GENERATED)
  - [ ] "Revert to this version" button on inactive versions

### 6.5 Rendering Logic Verification
- [ ] Confirm preview route prefers `published`, falls back to `draft`
- [ ] Confirm `inactive` pages never render
- [ ] Add code comments documenting this behavior

### 6.6 Validation
- [ ] HTML generation creates new draft
- [ ] Publish promotes draft → published
- [ ] Revert creates new draft from old version
- [ ] No duplicate drafts or published pages
- [ ] Full version history preserved

---

## Phase 7 — UX Copy & Guardrails

### 7.1 Async Progress Messaging
- [ ] Job running states show:
  - "Fetching your business profile (this may take a moment)..."
  - "Analyzing photos (you can safely close this tab)..."
  - "Building your website..."

### 7.2 Data Attribution
- [ ] Preview page shows subtle note:
  - "Content generated from your Google Business Profile"
  - If website scraped: "...and your existing website"

### 7.3 Preview vs Published Clarity
- [ ] Dashboard shows clear labels: "Draft" / "Published"
- [ ] Preview URLs show banner: "This is a preview of your site"

### 7.4 Editing Expectations
- [ ] After generation, show:
  - "Editing tools coming soon. You'll be able to refine text and images."

### 7.5 Template Labeling
- [ ] Show: "Template: Professional Local Business"
- [ ] "More templates coming soon"

### 7.6 Completion Moment
- [ ] When HTML generation completes:
  - "Your website draft is ready!"
  - Clear CTA to preview

### 7.7 Failure Messaging
- [ ] Job failures show friendly messages:
  - "We couldn't fetch some data, but your site was still generated."
- [ ] Never show raw errors
- [ ] Never blame user

### 7.8 Color Scheme (If Implemented)
- [ ] Confirmation: "You chose Ocean Blue. You can change this later."

### 7.9 Validation
- [ ] First-time user understands flow
- [ ] No state feels ambiguous
- [ ] Incomplete features feel intentional, not broken

---

## Testing Checklist (Per Phase)

### Phase 1
- [ ] `prisma migrate dev` succeeds
- [ ] Create/read projects, pages, templates via services

### Phase 2
- [ ] `test.sites.localhost:7777` renders HTML from DB
- [ ] Unknown hostname returns 404

### Phase 3
- [ ] Jobs track state correctly
- [ ] Invalid status transitions rejected
- [ ] Dashboard reflects DB state

### Phase 4
- [ ] GBP selection flow works
- [ ] Website confirmation persists data
- [ ] Status advances correctly

### Phase 5
- [ ] Webhooks receive and process callbacks
- [ ] Jobs chain automatically
- [ ] Failures handled gracefully

### Phase 6
- [ ] Versioning creates proper history
- [ ] Publish/revert work correctly
- [ ] No duplicate active versions

### Phase 7
- [ ] UX copy is clear and helpful
- [ ] No raw errors shown to users

---

## n8n Workflow Contracts

### Request Format (App → n8n)
```json
{
  "projectId": "uuid",
  "jobId": "uuid",
  "callbackUrl": "https://your-app.com/api/webhooks/n8n/{type}"
}
```

### Response Format (n8n → App via callback)
```json
{
  "projectId": "uuid",
  "jobId": "uuid",
  "success": true,
  "data": { /* workflow-specific payload */ },
  "error": null
}
```

### Workflow-Specific Data

**GBP Scrape:**
```json
{
  "businessName": "...",
  "address": "...",
  "phone": "...",
  "categories": ["..."],
  "description": "...",
  "reviews": [...],
  "photos": [{ "url": "...", "type": "..." }]
}
```

**Image Analysis:**
```json
{
  "images": [
    {
      "url": "...",
      "description": "...",
      "classification": "hero" | "staff" | "generic",
      "suitable": true
    }
  ],
  "placeholders": [{ "url": "...", "source": "pexels" }]
}
```

**Website Scrape:**
```json
{
  "headings": ["..."],
  "ctas": ["..."],
  "services": ["..."],
  "sections": [{ "title": "...", "content": "..." }]
}
```

**HTML Generation:**
```json
{
  "html": "<!DOCTYPE html>..."
}
```

---

## File Structure (Target State)

```
website-builder/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── __sites/
│   │   └── [hostname]/
│   │       └── page.tsx
│   ├── dashboard/
│   │   ├── page.tsx
│   │   └── projects/
│   │       ├── page.tsx
│   │       └── [id]/
│   │           └── page.tsx
│   └── api/
│       └── webhooks/
│           └── n8n/
│               ├── gbp-scrape/route.ts
│               ├── image-analysis/route.ts
│               ├── website-scrape/route.ts
│               └── html-generation/route.ts
├── lib/
│   ├── db.ts
│   ├── env.ts
│   └── services/
│       ├── project.service.ts
│       ├── page.service.ts
│       ├── template.service.ts
│       ├── job.service.ts
│       ├── project-status.service.ts
│       ├── gbp.service.ts
│       ├── publish.service.ts
│       ├── revert.service.ts
│       └── workflow-trigger.service.ts
├── middleware.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
└── src/
    └── (legacy pages router - can keep for reference or remove)
```

---

## Progress Tracking

| Phase | Status | Notes |
|-------|--------|-------|
| Phase 1 | ⬜ Not Started | |
| Phase 2 | ⬜ Not Started | |
| Phase 3 | ⬜ Not Started | |
| Phase 4 | ⬜ Not Started | |
| Phase 5 | ⬜ Not Started | |
| Phase 6 | ⬜ Not Started | |
| Phase 7 | ⬜ Not Started | |

Legend: ⬜ Not Started | 🟡 In Progress | ✅ Complete

---

*Last updated: 2026-02-03*
