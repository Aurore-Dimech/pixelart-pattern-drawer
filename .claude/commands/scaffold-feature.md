Ask the user for three things before doing anything:
1. **Feature name** in kebab-case (e.g. `comments`, `drawing-exports`)
2. **Auth required?** — does this feature require a logged-in user?
3. **Client component needed?** — does this feature need a React client component?

Derive `<Feature>` as the PascalCase version (e.g. `comments` → `Comments`, `drawing-exports` → `DrawingExports`).

List the exact files that will be created and wait for user confirmation:
- `src/lib/validators/<feature>.ts`
- `src/app/api/<feature>/route.ts`
- `__tests__/api/<feature>.test.ts`
- (if client component) `src/hooks/use<Feature>.ts`
- (if client component) `src/components/<feature>/<Feature>Client.tsx`

Once confirmed, invoke the workflow:

  Workflow({ scriptPath: ".claude/workflows/scaffold-feature.js", args: { feature, authRequired, clientComponent } })

When it returns, remind the user to run `npm run test` and `npm run lint` to verify the new files pass the project gates.
