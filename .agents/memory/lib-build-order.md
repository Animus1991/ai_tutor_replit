---
name: Lib build order
description: Composite libs must be built before leaf package typechecks; react types needed in openai-react lib
---

## Rule

**Always run `pnpm run typecheck:libs` before leaf package typechecks** (`pnpm --filter @workspace/api-server run typecheck`, etc.).

Missing lib declarations (`dist/*.d.ts`) cause TS6305 errors in packages that import them.

## Specific gotcha: @workspace/integrations-openai-ai-react

This lib uses React hooks but doesn't declare React as a devDependency by default. If you see "Cannot find module 'react'" during `typecheck:libs`:
1. `pnpm --filter @workspace/integrations-openai-ai-react add -D @types/react`
2. Add `"types": ["react"]` to its `tsconfig.json` compilerOptions

**Why:** The OpenAI react lib template ships without `@types/react` since it expects peer deps, but `tsc --build` needs the types explicitly declared.
