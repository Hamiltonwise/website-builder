# 📄 Website Builder MVP — Phases Summary (Canonical)

> This document is the **starting reference** for all detailed prompts and implementation phases.

---

## 🎯 Product Goal

Build a fully autonomous AI-powered website builder that:

- Uses **Google Business Profile (GBP)** as the primary source of truth
- Scrapes existing website data when available
- Generates a **single-page website** using a predefined template
- Serves the site via **hostname-based routing**
- Supports **versioned drafts and publishing**
- Operates via **resumable, job-based workflows**

---

## 🧱 Core Technical Stack

- **Next.js (App Router)**
- **Postgres**
- **Prisma**
- **Server-side HTML rendering**
- **n8n workflows** (scraping, AI generation)
- **Local dev wildcard subdomains** via `.sites.localhost`

---

## 🧩 Core Domain Concepts

### **Project**

The main unit of work and ownership.

A project:

- Is created immediately after onboarding
- Has a generated placeholder hostname
  (`dental-cure-2302.sites.getalloro.com`)
- Progresses through a **job-based lifecycle**
- Owns all data, pages, and workflows

---

### **Page**

A versioned HTML document belonging to a project.

- Currently only supports `/` (homepage)
- Has versions with states:
  - `draft`
  - `published`
  - `inactive`
- Supports:
  - revert
  - publish (rebase semantics)

---

### **Template**

- Stores HTML with placeholders / slots
- Only one active template in MVP
- Designed to scale later

---

## 🔄 Job-Based Workflow Architecture

All long-running work is handled asynchronously and resumable.

### Workflows

1. **GBP Profile Selector**
   - Lists user’s GBP profiles
   - Returns:
     - profile metadata
     - detected website URL (editable)
2. **GBP Scraping Workflow (n8n)**
   - Fetches:
     - business info
     - categories
     - reviews
     - photos
   - Returns structured JSON
3. **Image Analysis Workflow (n8n)**
   - Processes GBP images
   - Describes each image
   - Classifies suitability:
     - hero
     - staff/doctor
     - generic
   - Fetches placeholder images (Pexels) if needed
4. **Website Scraping Workflow (n8n)**
   - Scrapes confirmed website
   - Extracts headings, CTAs, sections, services
5. **HTML Generation Workflow (n8n)**
   - Inputs:
     - template
     - GBP data
     - website data
     - image metadata
     - selected color palette
   - Outputs:
     - plain HTML string

---

## 🧭 Project Lifecycle (Status-Driven)

Projects move through explicit states, e.g.:

```
CREATED
→ GBP_SELECTED
→ GBP_SCRAPED
→ IMAGES_ANALYZED
→ WEBSITE_SCRAPED
→ HTML_GENERATED
→ READY

```

- Users can leave and return at any time
- UI always reflects the **current state**
- No silent background work

---

## 🎨 Personalization (MVP Scope)

- User selects a **predefined color palette**
- Applied during HTML generation
- No freeform design controls yet

---

## 🌐 Rendering & Preview

- Sites are served by hostname
- Example:
  ```
  dental-cure-2302.sites.localhost:3000

  ```
- Server:
  - resolves hostname → project
  - loads published or draft page
  - serves raw HTML

Preview copy clearly states:

> “This is a preview link.”

---

## 🛡️ UX Safeguards (Intentional)

- Website URL confirmation before scraping
- Clear messaging about:
  - data source accuracy
  - async processing
  - editing coming later
- Always generate _something_ (fallbacks)
- No surprise overwrites or auto-reverts

---

## 🧠 Editing & Future-Proofing

- Editing comes later via AI editor agent
- Changes are:
  - subtle
  - user-initiated
  - reversible via versioning
- Schema already supports:
  - multi-page sites
  - multiple templates
  - custom domains (post-MVP)

---

## 🏁 MVP Non-Goals (Explicitly Excluded)

- Custom domains
- Visual drag-and-drop editor
- Autosave
- Advanced SEO tools
- Template marketplace

---

# 🧠 How We’ll Generate Detailed Prompts (Next)

From here, we’ll proceed **phase by phase**, each with:

- A **single, focused AI scaffold prompt**
- Clear inputs / outputs
- No cross-phase ambiguity
- Designed for execution by an AI coding agent

### Proposed Prompt Order

1. **Phase 1 — Project & DB Schema**
2. **Phase 2 — Hostname Routing & Preview Rendering**
3. **Phase 3 — Job System & Status Engine**
4. **Phase 4 — GBP Selector + Confirmation Flow**
5. **Phase 5 — n8n Webhook Integration**
6. **Phase 6 — Versioned Pages & Publishing Logic**
7. **Phase 7 — UX Copy & Guardrails**

Each prompt will:

- Assume the previous phase exists
- Be copy-paste runnable
- Avoid “magic leaps”
