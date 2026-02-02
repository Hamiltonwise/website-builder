# 🔄 Phase 3 — Job System & Project Status Engine

> **Purpose:**
>
> Introduce a durable, resumable job system and explicit project lifecycle management so that all long-running workflows (GBP scrape, website scrape, image analysis, HTML generation) can run asynchronously and safely.

After this phase:

- Users can leave and return at any time
- The system always knows **what step a project is in**
- Future workflows only “plug into” this engine

---

## 🧠 Context for the AI Coding Agent

You are extending a **Next.js App Router** app with:

- Prisma + Postgres
- `projects`, `pages`, `templates` tables already defined
- Hostname-based preview rendering already working

### Key Constraints

- Jobs must be **persisted in the database**
- Project status is the **source of truth**
- UI reflects status, not background execution
- No scraping or AI logic yet — only orchestration

---

## 🎯 Phase 3 Goals

By the end of this phase:

1. Long-running work is represented as **jobs**
2. Jobs are resumable and idempotent
3. Project lifecycle is explicit and enforced
4. UI can show **exactly where a project is**
5. Future workflows can update state via webhooks

---

## 🧩 Core Concepts Introduced

### 1️⃣ Project Status (Already Exists — Now Enforced)

Statuses (already defined in Phase 1):

```
CREATED
GBP_SELECTED
GBP_SCRAPED
IMAGES_ANALYZED
WEBSITE_SCRAPED
HTML_GENERATED
READY

```

Rules:

- Status must move **forward only**
- No skipping steps
- No silent transitions

---

### 2️⃣ Job

A Job represents a **single async unit of work**.

Examples:

- `GBP_SCRAPE`
- `IMAGE_ANALYSIS`
- `WEBSITE_SCRAPE`
- `HTML_GENERATION`

Jobs are:

- Durable
- Idempotent
- Linked to a project

---

## 🗄️ Step 1 — Add `Job` Model to Prisma

Extend the schema with a new table.

### Job Fields

- `id` (UUID)
- `project_id` (FK)
- `type` (string enum)
- `status` (`pending | running | success | failed`)
- `attempts` (int)
- `payload` (JSON, nullable)
- `error` (TEXT, nullable)
- `started_at`
- `finished_at`
- timestamps

### Indexes

- `project_id`
- `type`
- `status`

---

## 🧠 Step 2 — Job Rules (Must Be Enforced)

- Only **one active job of a given type per project**
- Retrying a job increments `attempts`
- Jobs must be **idempotent**
- Failed jobs do **not** advance project status

---

## 🧱 Step 3 — Service Layer: Job Engine

Create:

```
lib/services/job.service.ts

```

### Required Functions

```tsx
createJob(projectId,type, payload?)
startJob(jobId)
completeJob(jobId)
failJob(jobId, error)
getActiveJobs(projectId)

```

All state transitions must go through this service.

---

## 🧭 Step 4 — Project Status Transition Logic

Create a **single authority** for status changes.

```
lib/services/project-status.service.ts

```

### Responsibilities

- Validate allowed transitions
- Update `projects.status`
- Reject invalid transitions
- Log transitions (console for now)

Example rule:

```
CREATED → GBP_SELECTED ✅
CREATED → HTML_GENERATED ❌

```

No direct status updates outside this service.

---

## 🖥️ Step 5 — Minimal Status UI

Create a **very minimal dashboard view**:

```
/dashboard/projects/[id]

```

### UI Requirements

- Display:
  - Project hostname
  - Current status
- Show a **step list** with visual indicators:
  - completed
  - current
  - pending
- No buttons yet (except “refresh”)

This UI is **read-only**.

---

## 🧪 Step 6 — Simulate Jobs (No External Calls)

For now:

- Simulate job execution with:
  - `setTimeout`
  - server actions
  - manual triggers
- Advance project status only when jobs succeed

This validates the engine without real workflows.

---

## 🚫 Explicit Non-Goals (Do NOT Implement)

- No n8n
- No webhooks
- No retries UI
- No queues (BullMQ, etc.)
- No background workers
- No auth enforcement
- No notifications

---

## ✅ Acceptance Criteria

Phase 3 is complete when:

- Jobs can be created and tracked in DB
- Project status transitions are validated
- Invalid transitions are rejected
- UI always reflects DB state
- You can:
  - start a fake job
  - complete it
  - see status advance
- App remains fully functional from Phases 1 & 2

---

## 🧠 Architectural Guardrail

> **Workflows do not “do things” — they only advance state.**
>
> State drives UX, not execution timing.

This is what makes the system resilient.

---

### ✅ End of Phase 3 Prompt
