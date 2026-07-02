export const meta = {
  name: 'missing-tests',
  description: 'Find source files without a corresponding test file in __tests__/',
  phases: [
    { title: 'Scan', detail: 'check test coverage per source category in parallel' },
    { title: 'Aggregate', detail: 'merge findings and compute summary' },
  ],
}

const FINDING_SCHEMA = {
  type: 'object',
  properties: {
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          sourceFile: { type: 'string' },
          testFile: { type: 'string' },
          covered: { type: 'boolean' },
        },
        required: ['sourceFile', 'testFile', 'covered'],
      },
    },
  },
  required: ['findings'],
}

// All four agents use the same detection strategy: grep for the source file's
// identifier in any test file. This avoids false positives from bundled test files
// (e.g. favorites/[drawingId] tested inside favorites.test.ts).

phase('Scan')

const results = await parallel([
  () => agent(
    `Find all API route files: find src/app/api -name "route.ts" | sort
     Skip any path containing "[...nextauth]".

     For each file, build a grep pattern from its path:
     - Strip the "src/app/" prefix and "/route.ts" suffix
     - Escape square brackets: replace [ with \\[ and ] with \\]
     Example: src/app/api/drawings/[id]/publish/route.ts → "api/drawings/\\[id\\]/publish/route"

     Run: grep -rl "<pattern>" __tests__/ 2>/dev/null | head -1

     If output is non-empty, covered = true and testFile = the returned path.
     If empty, covered = false and testFile = "no test found".

     Return findings: sourceFile (relative path from project root), testFile, covered.`,
    { label: 'api-routes', schema: FINDING_SCHEMA }
  ),

  () => agent(
    `Find all hook files: find src/hooks -name "*.ts" | sort

     For each file src/hooks/<name>.ts, search for the filename in any test:
       grep -rl "<name>" __tests__/ 2>/dev/null | head -1

     If output is non-empty, covered = true and testFile = the returned path.
     If empty, covered = false and testFile = "no test found".

     Return findings: sourceFile (relative path), testFile, covered.`,
    { label: 'hooks', schema: FINDING_SCHEMA }
  ),

  () => agent(
    `Find all component files: find src/components -name "*.tsx" | sort

     For each file, extract the basename without extension (e.g. Toast from src/components/ui/Toast.tsx).
     Search for it in any test:
       grep -rl "<basename>" __tests__/ 2>/dev/null | head -1

     If output is non-empty, covered = true and testFile = the returned path.
     If empty, covered = false and testFile = "no test found".

     Return findings: sourceFile (relative path), testFile, covered.`,
    { label: 'components', schema: FINDING_SCHEMA }
  ),

  () => agent(
    `Find all validator files: find src/lib/validators -name "*.ts" | sort

     For each file src/lib/validators/<name>.ts, search for "validators/<name>" in any test
     (the prefix avoids false positives from common words like "drawing"):
       grep -rl "validators/<name>" __tests__/ 2>/dev/null | head -1

     If output is non-empty, covered = true and testFile = the returned path.
     If empty, covered = false and testFile = "no test found".

     Return findings: sourceFile (relative path), testFile, covered.`,
    { label: 'validators', schema: FINDING_SCHEMA }
  ),
])

phase('Aggregate')

const all = results.filter(Boolean).flatMap(r => r.findings)
const missing = all.filter(f => !f.covered)
const covered = all.filter(f => f.covered)

return {
  total: all.length,
  covered: covered.length,
  missing: missing.length,
  findings: all,
}
