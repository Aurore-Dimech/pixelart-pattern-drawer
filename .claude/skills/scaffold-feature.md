---
description: Scaffold a new feature following pixelart-pattern-app conventions — API route, Zod validator, optional client component, and Jest test. Use when adding a new resource to the app.
---

Ask the user for three things before doing anything:
1. **Feature name** in kebab-case (e.g. `comments`, `drawing-exports`)
2. **Auth required?** — does this feature require a logged-in user?
3. **Client component needed?** — does this feature need a React client component?

Then derive these names:
- `<feature>` = kebab-case name (e.g. `comments`)
- `<Feature>` = PascalCase name (e.g. `Comments`)

---

**Before creating any file**, list the exact paths and describe each change. Wait for user confirmation.

---

Once confirmed, create the following files:

**1. Zod validator** `src/lib/validators/<feature>.ts`
- Export `Create<Feature>Schema` with at minimum a `title` or identifying field
- Follow the pattern in `src/lib/validators/drawing.ts`
- No `any`, strict types only

**2. API route** `src/app/api/<feature>/route.ts`
- Import `{ NextResponse } from "next/server"`
- If auth required: import `auth` from `@/lib/auth` and call it first; return 401 if no session
- Parse and validate request body with `Create<Feature>Schema.safeParse()`; return 400 on failure
- Wrap all responses as `NextResponse.json({ data: ..., error: null })` on success, `{ data: null, error: "..." }` on failure
- Every `catch` must call `console.error("[api/<feature>]", err)` before returning 500

**3. Client component** (only if requested) `src/components/<feature>/<Feature>Client.tsx`
- Add `"use client"` as first line
- Use existing hook pattern: if state needed, create `src/hooks/use<Feature>.ts` following `src/hooks/useDrawingActions.ts`

**4. Jest test** `__tests__/api/<feature>.test.ts`
- Mock `@/lib/prisma` and (if auth required) `@/lib/auth` — follow the pattern in `__tests__/api/drawings.test.ts`
- Cover at minimum: success case (200/201), Zod validation failure (400), auth missing if required (401)

---

After creation, remind the user to run `npm run test` and `npm run lint` to verify the new files pass the project gates.
