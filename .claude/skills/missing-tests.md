---
name: missing-tests
description: Scan source files (API routes, hooks, components, validators) and report which have no corresponding test file in __tests__/. Enforces CLAUDE.md Rule 3.
user-invocable: true
allowed-tools:
  - Workflow
---

# /missing-tests — Test Coverage Audit

Invoke the deterministic workflow:

  Workflow({ scriptPath: ".claude/workflows/missing-tests.js" })

When it returns, display the findings as a markdown table:

| Source | Test attendu | Statut |
|---|---|---|
| ... | ... | ✅ or ❌ MISSING |

Use ✅ for covered files and ❌ MISSING for uncovered ones.

End with a one-line summary: `X/Y fichiers couverts — Z tests manquants`.

If any tests are missing, remind the user: CLAUDE.md Rule 3 requires every feature to have tests.
