# 🌐 Phase 2 — Hostname Routing & Preview Rendering

> **Purpose:**
>
> Enable hostname-based routing and server-side rendering of HTML pages stored in the database, using wildcard subdomains in local development.

After this phase, visiting:

```
anything.sites.localhost:3000

```

will correctly:

- resolve the project by hostname
- load the correct HTML page from the database
- render it as a preview site

---

## 🧠 Context for the AI Coding Agent

You are working in a **Next.js App Router** application with:

- Prisma + Postgres already set up
- `projects`, `pages`, `templates` tables already created
- Service-layer functions available (from Phase 1)

### Important Assumptions (Do NOT change)

- Local subdomain simulation uses:
  - `.sites.localhost`
- No custom domains yet
- Only **homepage (`/`)** is supported
- Only **preview rendering** (no publish flow yet)
- HTML is served **directly from the database**

---

## 🎯 Phase 2 Goals

By the end of this phase:

1. Requests to wildcard subdomains resolve correctly
2. The server determines the project via hostname
3. The homepage HTML is fetched from DB
4. The HTML is returned as a **raw HTML response**
5. Missing projects/pages return a clean 404

---

## 🧩 High-Level Architecture

### Request Flow

```
Browser
→ test.sites.localhost:3000
→ Next.js Middleware
→ rewritetointernal route
→server component / routehandler
→ DB lookup (project + page)
→ HTML response

```

---

## 🧱 Step 1 — Environment Configuration

Add the following env var:

```
BASE_DOMAIN=sites.localhost

```

This will later change per environment (staging / prod).

---

## 🧭 Step 2 — Middleware: Hostname Parsing & Rewrite

Create or update:

```
middleware.ts

```

### Responsibilities

- Read the `Host` header
- Strip the port
- Detect subdomain based on `BASE_DOMAIN`
- Rewrite requests to an internal route:
  ```
  /__sites/[hostname]/[...path]

  ```

### Rules

- Ignore requests to:
  - `localhost`
  - `www`
- Only rewrite when hostname ends with `BASE_DOMAIN`
- Preserve path (`/` only for now)

---

### Example Rewrite

```
dental-cure-2302.sites.localhost/
→ /__sites/dental-cure-2302.sites.localhost/

```

---

## 🧱 Step 3 — Internal Catch-All Route

Create:

```
app/__sites/[hostname]/page.tsx

```

This route is **never user-facing**.

### Responsibilities

1. Receive `hostname` param
2. Look up `Project` by `generated_hostname`
3. Load the correct `Page`
   - Prefer `published`
   - Fallback to `draft`
4. Return HTML

---

## 🧠 Rendering Rules (Critical)

- Do **not** wrap HTML in additional layout chrome
- Do **not** inject React UI
- Do **not** iframe
- Return HTML as the **actual response body**

### Use:

- `new Response(html, { headers })`
- Set `Content-Type: text/html`

This makes the site behave like a real website.

---

## 🧱 Step 4 — DB Lookup Logic

Use service-layer functions only.

Required logic:

```tsx
project = getProjectByHostname(hostname);

page = getPublishedPage(project.id, '/');
ORgetDraftPage(project.id, '/');
```

### Error Handling

- No project → 404
- No page → 404
- Never throw raw errors to the browser

---

## 🧪 Step 5 — Temporary Placeholder Data

Until workflows exist:

- Seed at least one project:
  - `generated_hostname = test.sites.localhost`
- Seed one page:
  - `path = "/"`,
  - `status = draft`
  - simple HTML content

This allows immediate validation.

---

## 🚫 Explicit Non-Goals (Do NOT Implement)

- No publishing logic
- No authentication
- No page editing
- No multiple paths
- No caching
- No SEO
- No assets pipeline

---

## ✅ Acceptance Criteria

Phase 2 is complete when:

- Visiting
  ```
  test.sites.localhost:3000

  ```
  renders HTML from the DB
- Visiting an unknown hostname returns 404
- Middleware logic is:
  - env-driven
  - readable
  - future-proof
- No Phase 1 schema changes were required

---

## 🧠 Architectural Guardrail

> **Routing logic must not care how HTML was created.**
>
> It only knows how to _find and serve it_.

This guarantees future AI workflows can plug in cleanly.

---

### ✅ End of Phase 2 Prompt
