---
name: drizzle-kit push TTY requirement
description: Why `pnpm --filter @workspace/db run push` fails on column renames and the dev workaround.
---

`drizzle-kit push` prompts interactively to resolve a column rename/conflict ("was this renamed or created?"). This environment has no TTY, so it aborts with `Interactive prompts require a TTY terminal`. The `--force` flag only auto-confirms data-loss, NOT the rename resolution prompt, so it does not help here.

**Workaround (dev only):** when the affected columns hold recomputed or nullable data (nothing real to preserve), apply the DDL directly with SQL — `ALTER TABLE ... DROP COLUMN IF EXISTS ...; ADD COLUMN IF NOT EXISTS ...` — via the `executeSql` code-execution callback. Afterwards the live schema matches the Drizzle schema and `push` is a no-op.

**Why:** push interprets drop-of-old + add-of-differently-named-column as a possible rename and blocks on the interactive prompt.
**How to apply:** any schema change that renames/replaces columns hits this. For dev, reach for direct DDL; for anything needing data preservation, generate migration files + migrate instead of `push`.
