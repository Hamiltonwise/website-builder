# 🔌 Phase 5 — n8n Webhook Integration & Async Job Execution

> **Purpose:**
>
> Connect real external workflows (n8n) to your app using secure webhooks, execute async jobs, and persist results deterministically into the project lifecycle.

After this phase:

- Jobs are **triggered for real**
- n8n workflows return real data
- Project state advances automatically
- Users can leave and come back safely

---

## 🧠 Context for the AI Coding Agent

You are extending a system that already has:

- Project lifecycle & status engine
- Job system with persistence
- GBP selection & website confirmation
- Hostname-based preview rendering

### Critical Constraints

- All external work happens **outside** the app
- The app only:
  - triggers jobs
  - receives webhook callbacks
  - validates + persists data
- No UI polling hacks
- No synchronous scraping
- No business logic inside n8n callbacks

---

## 🎯 Phase 5 Goals

By the end of this phase:

1. The app can trigger real n8n workflows
2. n8n can securely POST results back
3. Jobs transition cleanly:

   ```
   pending → running → success | failed

   ```

4. Project status advances only on success
5. Partial failures fall back gracefully

---

## 🧩 External Workflow Contracts (Authoritative)

You will integrate **four workflows** (not all run yet, but endpoints exist).

| Workflow        | Triggered When          | Returns         |
| --------------- | ----------------------- | --------------- |
| GBP Scrape      | after GBP_SELECTED      | GBP data        |
| Image Analysis  | after GBP_SCRAPED       | image metadata  |
| Website Scrape  | after website confirmed | website content |
| HTML Generation | after all inputs ready  | HTML string     |

Each workflow:

- Receives `project_id`
- Returns a payload
- Is idempotent

---

## 🧱 Step 1 — Webhook Endpoint Design

Create webhook routes under:

```
app/api/webhooks/n8n/

```

One route per workflow:

```
/gbp-scrape
/image-analysis
/website-scrape
/html-generation

```

---

### Webhook Requirements (Critical)

Each webhook must:

- Accept `POST` only
- Validate:
  - shared secret
  - `project_id`
  - job type
- Be idempotent
- Update job + project status via services only

---

## 🔐 Step 2 — Webhook Security

Use a shared secret:

```
N8N_WEBHOOK_SECRET=super-secret

```

Each request must include:

```
x-webhook-secret

```

Reject requests without it.

---

## 🧠 Step 3 — Job Triggering Logic

When project status changes, trigger jobs explicitly.

### Example Flow

```
CREATED
→ GBP_SELECTED
→trigger GBP_SCRAPE job

```

Triggering means:

- Create Job (pending)
- POST to n8n webhook URL
- Mark job as running

No background workers yet — use server actions or API routes.

---

## 🧱 Step 4 — Webhook Handling Logic

When n8n calls back:

1. Validate request
2. Load job + project
3. Persist returned data:
   - GBP → `projects.gbp_data`
   - Images → `projects.gbp_data.images[]`
   - Website → `projects.scraped_website_data`
4. Mark job success
5. Advance project status

If error:

- Mark job failed
- Do NOT advance status

---

## 🧪 Step 5 — Fallback Behavior (Mandatory)

If a workflow returns:

- empty data
- partial data
- error payload

Then:

- Persist what exists
- Advance project cautiously
- Never block the pipeline entirely

Example:

- No website content → still proceed to HTML generation using GBP only

---

## 🖥️ Step 6 — UI Updates

Extend the project dashboard to show:

- Active jobs
- Job statuses
- Clear messaging:
  - “Analyzing photos (this may take a few minutes)”
  - “Scraping website content”

No manual controls yet.

---

## 🚫 Explicit Non-Goals (Do NOT Implement)

- No retries UI
- No queues
- No cron
- No workers
- No real-time sockets
- No caching
- No HTML editing
- No publishing

---

## ✅ Acceptance Criteria

Phase 5 is complete when:

- A project can:
  - trigger a real n8n workflow
  - receive webhook data
  - persist results
  - advance status automatically
- Jobs are durable and inspectable
- Reloading the dashboard reflects reality
- System survives refreshes and restarts
- No race conditions or silent failures

---

## 🧠 Architectural Guardrail

> **Your app is the source of truth.
> n8n is a worker, not a brain.**

All decisions happen in your code.

---

### ✅ End of Phase 5 Prompt
