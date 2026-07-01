---
description: Audit all API routes for CLAUDE.md compliance — Rule 2 (error logging) and Rule 5 (no sensitive data exposure). Use before any PR or after adding/modifying a route.
---

Read every file matching `src/app/api/**/route.ts` recursively.

For each file, check the following four rules and flag any violation:

**Rule 2 — Every `catch` must log**
Every `catch` block must call `console.error`. A bare `catch` or one that only returns a response without logging is a violation.
Exception: a `catch` that immediately returns a 400 for JSON parse failure is acceptable.

**Rule 2 — Zod validation before use**
Every `POST`, `PUT`, and `PATCH` handler must parse the request body with a Zod schema before using the data. A handler that calls `req.json()` and uses the result directly without `.safeParse()` or `.parse()` is a violation.

**Rule 5 — Session check before DB access**
Every handler that calls `prisma.` must first call `auth()` or `getServerSession()` and verify the session is non-null. A DB call before any session check is a violation.

**Rule 5 — No sensitive fields in responses**
`select` clauses in Prisma queries must never include `password` or `hashedPassword`. For public author data, only `name` (not `email`) may be exposed. Flag any violation.

---

Report your findings as a markdown table with columns: **File** | **Rule** | **Violation**.

If no violations are found, write: `✅ All API routes comply with CLAUDE.md rules.`

End with a one-line summary: total routes audited, total violations found.
