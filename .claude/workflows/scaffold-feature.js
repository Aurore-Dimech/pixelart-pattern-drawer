export const meta = {
  name: 'scaffold-feature',
  description: 'Generate validator, API route, optional client component, and Jest test for a new feature',
  phases: [
    { title: 'Read patterns', detail: 'load existing files as templates' },
    { title: 'Generate', detail: 'create feature files in parallel' },
  ],
}

const { feature, authRequired, clientComponent } = args

const Feature = feature
  .split('-')
  .map(s => s.charAt(0).toUpperCase() + s.slice(1))
  .join('')

phase('Read patterns')

const [validatorPattern, routePattern, testPattern] = await parallel([
  () => agent(
    'Read the file src/lib/validators/drawing.ts and return its full content verbatim.',
    { label: 'read-validator-pattern' }
  ),
  () => agent(
    'Read the file src/app/api/drawings/route.ts and return its full content verbatim.',
    { label: 'read-route-pattern' }
  ),
  () => agent(
    'Read the file __tests__/api/drawings.test.ts and return its full content verbatim.',
    { label: 'read-test-pattern' }
  ),
])

phase('Generate')

const generateTasks = [
  () => agent(
    `Create the file src/lib/validators/${feature}.ts.

Use this existing validator as a pattern:
---
${validatorPattern}
---

Requirements:
- Export \`Create${Feature}Schema\` as a Zod object schema
- Include at minimum a \`title\` field (z.string(), min 1, max 100)
- No \`any\` types — strict TypeScript only
- Export the inferred type: \`export type Create${Feature} = z.infer<typeof Create${Feature}Schema>\`

Write the file using the Write tool.`,
    { label: 'generate-validator' }
  ),

  () => agent(
    `Create the file src/app/api/${feature}/route.ts.

Use this existing API route as a pattern:
---
${routePattern}
---

Requirements:
- Import \`{ NextResponse } from "next/server"\`
- Import \`{ Create${Feature}Schema } from "@/lib/validators/${feature}"\`
${authRequired
  ? `- Import \`auth\` from \`@/lib/auth\` — call it at the top of each handler; return 401 if no session`
  : `- No auth required for this route`}
- Implement a POST handler that:
  - Parses and validates the body with \`Create${Feature}Schema.safeParse()\`
  - Returns 400 with \`{ data: null, error: "Données invalides" }\` on failure
  - Returns 201 with \`{ data: result, error: null }\` on success (placeholder: \`{ id: "placeholder", ...body }\`)
  - Every catch block must call \`console.error("[api/${feature}]", err)\` before returning 500

Write the file using the Write tool.`,
    { label: 'generate-route' }
  ),

  () => agent(
    `Create the file __tests__/api/${feature}.test.ts.

Use this existing test as a pattern:
---
${testPattern}
---

Requirements:
- Mock \`@/lib/prisma\` following the same jest.mock pattern
${authRequired
  ? `- Mock \`@/lib/auth\` — return a valid session for authenticated tests, return null for the 401 test`
  : `- No auth mock needed`}
- Import the POST handler from \`@/app/api/${feature}/route\`
- Cover at minimum:
  1. Success case: valid body → 201 with \`{ data: ..., error: null }\`
  2. Validation failure: missing required field → 400 with \`{ data: null, error: ... }\`
  ${authRequired ? `3. Auth missing: no session → 401` : ''}

Write the file using the Write tool.`,
    { label: 'generate-test' }
  ),
]

if (clientComponent) {
  generateTasks.push(
    () => agent(
      `Create the file src/hooks/use${Feature}.ts.

Read src/hooks/useDrawingActions.ts first, then create use${Feature}.ts with:
- A hook that manages a \`loading\` boolean state
- An async \`create${Feature}\` function that POSTs to \`/api/${feature}\`
- Strict TypeScript, no \`any\`

Write the file using the Write tool.`,
      { label: 'generate-hook' }
    ),
    () => agent(
      `Create the file src/components/${feature}/${Feature}Client.tsx.

Requirements:
- First line: \`"use client"\`
- Import \`use${Feature}\` from \`@/hooks/use${Feature}\`
- Render a minimal form with a title input and a submit button
- On submit, call \`create${Feature}\` from the hook
- Show a disabled/loading state while the request is in progress
- Strict TypeScript

Write the file using the Write tool.`,
      { label: 'generate-component' }
    )
  )
}

await parallel(generateTasks)

return {
  feature,
  Feature,
  authRequired,
  clientComponent,
  filesCreated: [
    `src/lib/validators/${feature}.ts`,
    `src/app/api/${feature}/route.ts`,
    `__tests__/api/${feature}.test.ts`,
    ...(clientComponent ? [`src/hooks/use${Feature}.ts`, `src/components/${feature}/${Feature}Client.tsx`] : []),
  ],
}
