# 🧭 Phase 4 — GBP Selector & Website Confirmation Flow

> **Purpose:**
>
> Introduce the first real onboarding interaction: selecting a Google Business Profile (GBP), confirming the detected website, and advancing the project into the scraping pipeline.

After this phase:

- Users can select a GBP profile
- Confirm or change the website URL
- Project status advances deterministically
- No scraping or AI runs yet — only orchestration

---

## 🧠 Context for the AI Coding Agent

You are working on a **Next.js App Router** app with:

- Project + Page schema in place
- Hostname-based preview working
- Job system + status engine implemented
- No real GBP integration yet

### Critical Constraints

- Treat GBP selection as **synchronous UI**
- Treat scraping as **future async jobs**
- Persist everything immediately
- Never guess silently

---

## 🎯 Phase 4 Goals

By the end of this phase:

1. Users can see a list of GBP profiles
2. Users can select one
3. The detected website is shown and editable
4. Project status advances to `GBP_SELECTED`
5. The system is ready to trigger scraping jobs in Phase 5

---

## 🧩 UX Flow (Authoritative)

### Step 1 — Project Dashboard Entry

Route:

```
/dashboard/projects/[id]

```

If project status is `CREATED`, show:

- “Connect your Google Business Profile”

---

### Step 2 — GBP Selector Screen

Show a **mocked list** of GBP profiles.

Each profile includes:

- Business name
- Address
- Primary category
- Website URL (if any)

⚠️ This data is **mocked / stubbed** in this phase.

---

### Step 3 — Website Confirmation

After selecting a GBP profile:

Show:

> “We found this website on your Google Business Profile:
>
> `https://example.com`”

Allow user to:

- Confirm
- Edit URL
- Clear it entirely

Scraping must **not** start until this is confirmed.

---

### Step 4 — Confirmation & Status Advance

On confirmation:

- Persist:
  - `gbp_profile_id`
  - initial GBP metadata (basic JSON)
  - confirmed website URL
- Transition project status:

  ```
  CREATED → GBP_SELECTED

  ```

No other status changes allowed.

---

## 🧱 Data Model Updates (Additive Only)

### Project (extend usage, not schema)

Store in `projects`:

- `gbp_data` → basic profile metadata
- `scraped_website_data` → still null

Do **not** introduce new tables.

---

## 🧠 Service Layer Requirements

### GBP Service (Stub)

Create:

```
lib/services/gbp.service.ts

```

Functions (stubbed):

```tsx
listGbpProfiles(userId);
getGbpProfile(profileId);
```

Return hardcoded mock data for now.

---

### Project Update Logic

All updates must:

- Go through service layer
- Use project-status service
- Reject invalid transitions

No direct DB writes from UI.

---

## 🧪 Validation Rules

- Website URL must be:
  - valid URL
  - optional (nullable)
- GBP selection must:
  - belong to user (mocked assumption ok)
- Status transitions must be enforced

---

## 🖥️ UI Requirements (Minimal but Clear)

- Show progress steps visually:

  ```
  ✓ Project created
  →Select Google Business Profile
  → Scraping & generation

  ```

- Explicit copy:
  > “We’ll build your site using your Google Business Profile
  >
  > and any website content you have.”
- Website confirmation copy:
  > “You can change this now if it’s outdated or incorrect.”

No styling polish required.

---

## 🚫 Explicit Non-Goals (Do NOT Implement)

- No OAuth
- No real GBP API calls
- No scraping
- No jobs triggered yet
- No image logic
- No AI calls
- No retries or background execution

---

## ✅ Acceptance Criteria

Phase 4 is complete when:

- A user can:
  - enter a project
  - select a GBP profile
  - confirm or edit website
- Project status advances correctly
- Data is persisted
- Reloading the page reflects the same state
- No future phase assumptions are hardcoded

---

## 🧠 Architectural Guardrail

> **This phase decides _what_ we will scrape — not _how_ or _when_.**

That separation is critical.

---

### ✅ End of Phase 4 Prompt
