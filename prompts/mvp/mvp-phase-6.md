# 📄 Phase 6 — Versioned Pages, Publishing Logic & Safe Reverts

> **Purpose:**
>
> Introduce a robust, deterministic content lifecycle for generated HTML using versioned pages, explicit draft/published states, and safe revert semantics.

After this phase:

- Every generated site has a **draft**
- Publishing is explicit and reversible
- No content is ever silently lost
- Rendering logic remains unchanged

---

## 🧠 Context for the AI Coding Agent

You are extending a system that already has:

- Projects with lifecycle states
- Async jobs via n8n
- HTML generation workflow returning plain HTML
- Hostname-based preview rendering
- `pages` table with versioning fields

### Critical Constraints

- Do NOT introduce UI editors
- Do NOT mutate HTML in place
- Do NOT change routing or middleware
- Treat HTML as immutable snapshots

---

## 🎯 Phase 6 Goals

By the end of this phase:

1. HTML generation creates **new page versions**
2. Only one `draft` and one `published` page exist per path
3. Publishing is explicit and safe
4. Reverting restores previous versions cleanly
5. Preview logic remains stable

---

## 🧩 Canonical Page Rules (Authoritative)

For each `(project_id, path)`:

- Exactly **one** `draft`
- Exactly **one** `published` (optional)
- All others are `inactive`
- Versions are monotonically increasing integers

No exceptions.

---

## 🧱 Step 1 — Page Creation on HTML Generation

When the **HTML Generation job** succeeds:

1. Load the latest page version for:

   ```
   project_id +path'/'

   ```

2. Create a **new Page**:
   - `version = last_version + 1`
   - `status = draft`
   - `html_content = generated HTML`
3. Mark any existing `draft` page as `inactive`

⚠️ Do NOT touch published pages here.

---

## 🧠 Step 2 — Publishing Logic

Create a publishing service:

```
lib/services/publish.service.ts

```

### `publishPage(projectId, path)`

Responsibilities:

1. Find the current `draft`
2. Mark current `published` (if any) as `inactive`
3. Promote `draft` → `published`
4. Enforce uniqueness guarantees
5. Advance project status:

   ```
   HTML_GENERATED → READY

   ```

Publishing is **explicit** — never automatic.

---

## 🔁 Step 3 — Revert Logic

Create:

```
lib/services/revert.service.ts

```

### `revertToVersion(projectId, path, version)`

Responsibilities:

1. Locate target page version
2. Mark current `draft` as `inactive`
3. Clone target page:
   - new version number
   - status = `draft`
4. Do NOT modify published page
5. Preserve full history

This is effectively a **rebase**, not a rollback.

---

## 🖥️ Step 4 — Dashboard Controls (Minimal)

On:

```
/dashboard/projects/[id]

```

Add **minimal controls**:

- Show list of versions:
  - version number
  - status
  - timestamp
- Buttons:
  - “Publish” (only if draft exists)
  - “Revert to this version” (inactive only)

No editing UI.

---

## 🧪 Step 5 — Rendering Logic (No Changes, Just Confirm)

Rendering rules remain:

- Prefer `published`
- Fallback to `draft`
- Never render `inactive`

Confirm this behavior explicitly in code comments.

---

## 🚫 Explicit Non-Goals (Do NOT Implement)

- No HTML diffing
- No autosave
- No inline editing
- No preview branches
- No multi-page navigation yet
- No caching

---

## ✅ Acceptance Criteria

Phase 6 is complete when:

- Each HTML generation creates a new draft
- Publishing works deterministically
- Reverting restores content safely
- No duplicate drafts or published pages exist
- Preview URLs reflect published content first
- Full version history is preserved
- No schema rewrites were required

---

## 🧠 Architectural Guardrail

> **HTML is immutable.
> Control comes from versioning, not mutation.**

This principle enables safe AI editing later.

---

### ✅ End of Phase 6 Prompt
