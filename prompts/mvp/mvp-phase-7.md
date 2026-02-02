# 🧠 Phase 7 — UX Copy, Guardrails & User Trust Layer

> **Purpose:**
>
> Eliminate user confusion, prevent false assumptions, and clearly communicate system state, limitations, and next steps — without adding complexity or scope.

After this phase:

- Users always know **what’s happening**
- Async behavior feels intentional, not broken
- AI limitations are framed correctly
- MVP feels polished and safe to use

---

## 🧠 Context for the AI Coding Agent

You are working on a system that already supports:

- Project lifecycle + jobs
- Async n8n workflows
- Versioned pages
- Preview + publish logic
- Hostname-based rendering

This phase **must not**:

- Add new workflows
- Change schema semantics
- Add editing tools
- Introduce new state machines

It is **presentation + copy only**.

---

## 🎯 Phase 7 Goals

By the end of this phase:

1. Every async step is clearly explained
2. Users understand what data was used
3. Preview vs published is unambiguous
4. Editing expectations are set honestly
5. Failure states feel safe and recoverable

---

## 🧩 Guardrails to Implement (Authoritative)

### 1️⃣ Async Progress Transparency

Wherever jobs are running, show:

- Which step is active
- Why it may take time

**Example copy**

> “Analyzing photos (this may take a few minutes).
>
> You can safely close this tab — we’ll keep working.”

---

### 2️⃣ Data Source Attribution

On preview screens, add subtle but visible notes:

- **GBP data**
  > “Content is generated from your Google Business Profile.”
- **Website content**
  > “We also used content from your existing website.”

This prevents misplaced blame.

---

### 3️⃣ Preview vs Published Clarity

On preview URLs and dashboard:

> “This is a preview of your site.
>
> Your site goes live when you publish.”

Never imply permanence.

---

### 4️⃣ Editing Expectations (Pre-Emptive)

On generated sites:

> “Editing tools are coming next.
>
> You’ll soon be able to refine text, images, and sections.”

Avoid fake affordances.

---

### 5️⃣ Template Framing

Explicitly label template usage:

> “Template: Professional Local Business
>
> More templates coming soon.”

Turns limitation into roadmap.

---

### 6️⃣ Ownership Moment

When HTML generation completes:

> **“Your website draft is ready.”**

This moment is psychologically important.

---

### 7️⃣ Failure-State Messaging

If any job fails or partially completes:

- Never show raw errors
- Never blame the user
- Always reassure recoverability

**Example**

> “We couldn’t retrieve some website content,
>
> but your site was still generated using your Google Business Profile.”

---

### 8️⃣ Color Scheme Confirmation

When color palette is applied:

> “You chose the _Ocean Blue_ color scheme.
>
> You’ll be able to change this later.”

Reinforces agency.

---

## 🖥️ Where to Apply These Changes

- Project dashboard
- Status stepper
- Preview page chrome (minimal)
- Publish confirmation
- Empty / loading / error states

No new routes required.

---

## 🚫 Explicit Non-Goals (Do NOT Implement)

- No new logic
- No new API endpoints
- No new schema fields
- No analytics
- No A/B testing
- No feature flags

---

## ✅ Acceptance Criteria

Phase 7 is complete when:

- A first-time user can:
  - understand what’s happening
  - trust the system
  - wait without anxiety
- No UI state feels ambiguous
- No feature appears broken when it’s merely incomplete
- MVP feels **intentional**, not hacked together

---

## 🧠 Architectural Guardrail (Final)

> **Clarity beats cleverness.
> Trust beats features.**

This phase ensures users stay long enough to reach your editor.

---

### ✅ End of Phase 7 Prompt
