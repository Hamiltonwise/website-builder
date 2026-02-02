# 🧱 Phase 1 — Project Foundation & Database Schema

> **Purpose:**
>
> Establish the core data model and backend foundation for the autonomous website builder.
>
> This phase creates the canonical tables and types that _all future phases depend on_.

---

## 🧠 Context for the AI Coding Agent

You are working on a **Next.js App Router** project using:

- Next.js (App Router)
- TypeScript
- Prisma
- Postgres
- Tailwind (already set up in starter)

This is a **single-repo full-stack app** (no separate backend).

The product is an AI-powered website builder where:

- Each “website” is modeled as a **project**
- Pages are versioned HTML documents
- Sites are served later via hostname-based routing
- Long-running work is handled asynchronously via jobs (added in later phases)

⚠️ **Important constraints**

- Do NOT build UI beyond placeholders
- Do NOT implement scraping, AI, or workflows yet
- Do NOT assume multi-page routing yet (only `/`)
- Focus on **clean schema + future-proofing**

---

## 🎯 Phase 1 Goals

By the end of this phase, the system must:

1. Have a working Prisma schema
2. Have migrations applied successfully
3. Boot a Next.js app without errors
4. Support creating and reading `projects`, `pages`, and `templates`
5. Be ready for hostname-based rendering in later phases

---

## 🧩 Core Domain Models (Authoritative)

### 1️⃣ `Project`

Represents a single website being built.

**Key ideas**

- Created early in onboarding
- Owns all workflows, pages, and metadata
- Identified later via generated hostname

**Required fields**

- `id` (UUID)
- `user_id` (string for now; auth wired later)
- `generated_hostname` (string, unique)
- `status` (enum, string-based)
- `gbp_data` (JSON, nullable)
- `scraped_website_data` (JSON, nullable)
- timestamps

---

### 2️⃣ `Template`

Stores HTML templates used for generation.

**Key ideas**

- Only one active template for MVP
- Designed to scale later

**Required fields**

- `id`
- `name`
- `html_template` (TEXT)
- `is_active` (boolean)
- timestamps

---

### 3️⃣ `Page`

Represents a **versioned HTML document** for a project.

**Key ideas**

- Versioned
- Only one draft + one published per path
- Others are inactive
- Currently only supports `/` path

**Required fields**

- `id`
- `project_id` (FK)
- `path` (string, default `/`)
- `version` (integer)
- `status` (`draft | published | inactive`)
- `html_content` (TEXT)
- timestamps

---

## 🗄️ Prisma Schema Requirements

### Enums

Create enums for:

```tsx
ProjectStatus = [
  CREATED,
  GBP_SELECTED,
  GBP_SCRAPED,
  IMAGES_ANALYZED,
  WEBSITE_SCRAPED,
  HTML_GENERATED,
  READY,
];

PageStatus = [draft, published, inactive];
```

Enums should be implemented as Prisma enums.

---

### Relationships

- `Project` → many `Page`
- `Template` is standalone
- Deleting a `Project` should cascade to `Page`

---

### Indexing

Add indexes for:

- `Project.generated_hostname` (unique)
- `Page.project_id`
- `Page.project_id + path`
- `Page.status`

---

## 🧱 Folder Structure to Create / Confirm

```
lib/
  db.ts// Prisma client
  services/
    project.service.ts
    page.service.ts
template.service.ts
prisma/
  schema.prisma

```

---

## 🧠 Service Layer Rules

Create **service functions**, not raw DB access everywhere.

Examples (signatures only, logic minimal):

```tsx
createProject(...)
getProjectByHostname(...)
createPageVersion(...)
getPublishedPage(...)
getDraftPage(...)

```

These services will be reused in later phases.

---

## 🚫 Explicit Non-Goals (Do NOT Implement)

- No hostname routing yet
- No middleware
- No n8n
- No AI logic
- No GBP logic
- No auth enforcement
- No UI beyond placeholder pages

---

## ✅ Acceptance Criteria (Very Important)

This phase is complete when:

- `npx prisma migrate dev` succeeds
- `npm run dev` boots the app
- You can:
  - create a project in DB
  - create pages linked to a project
  - query pages by status
- No TODOs remain in schema or services
- Code is clean, readable, and future-proof

---

## 🧪 Optional (Nice-to-Have)

- Seed script that:
  - creates one template
  - creates one project
  - creates one draft page

This helps validate the schema.

---

## 🧠 Architectural North Star (Read Carefully)

> Every future phase will **assume this schema exists**
>
> and will **extend it, never rewrite it**.

Design for clarity over cleverness.

---

### ✅ End of Phase 1 Prompt
