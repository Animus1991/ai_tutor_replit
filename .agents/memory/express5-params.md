---
name: Express 5 param types
description: Express 5 types req.params as string|string[], requiring explicit casts
---

## Rule

In Express 5, `req.params.id` is typed as `string | string[]`, not plain `string`.

**Always use bracket notation and cast:**
```ts
const id = parseInt(req.params["id"] as string);
```

**Why:** Express 5 tightened its types. The `as string` cast is safe because route params are always single strings (never arrays) in practice.

**How to apply:** Every route handler that reads from `req.params` needs this pattern. Check all `parseInt(req.params.X)` calls.
