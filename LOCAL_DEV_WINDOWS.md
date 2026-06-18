# Τοπική εκτέλεση στο Windows

Οδηγός για το `ai_tutor_replit` (`C:\Users\anast\IdeaProjects\ai_tutor_replit`).

## 1. Προαπαιτούμενα

| Εργαλείο | Έκδοση | Σημειώσεις |
|---|---|---|
| **Node.js** | **24** (LTS) | Το project στοχεύει Node 24. Αποφεύγετε Node 25 αν δείτε σφάλματα rollup. |
| **pnpm** | τελευταία | `npm install -g pnpm` |
| **PostgreSQL** | 16 | Τοπικά ή Docker |
| **Clerk** | — | Λογαριασμός + app keys |
| **OpenAI** | — | API key για τοπικά (`AI_INTEGRATIONS_*`) |

> **Μην χρησιμοποιείτε `npm run dev`** στο root — δεν υπάρχει τέτοιο script. Χρησιμοποιείτε **pnpm**.

## 2. Εγκατάσταση

```powershell
cd C:\Users\anast\IdeaProjects\ai_tutor_replit
pnpm install
```

Αν είχατε αποτυχημένη εγκατάσταση (π.χ. rollup / optional deps):

```powershell
Remove-Item -Recurse -Force node_modules
Get-ChildItem -Recurse -Directory -Filter node_modules | Remove-Item -Recurse -Force
pnpm install
```

## 3. Ρύθμιση περιβάλλοντος

### Τι πρέπει να κάνεις εσύ (δεν γίνεται αυτόματα)

| Ρύθμιση | Πού | Πώς |
|---|---|---|
| **Clerk keys** | `.env` + `artifacts/learn/.env` | [dashboard.clerk.com](https://dashboard.clerk.com) → API Keys |
| **Clerk localhost** | Clerk Dashboard | Domains → `http://localhost:20579` |
| **PostgreSQL password** | `.env` → `DATABASE_URL` | Ο κωδικός της **δικής σου** PostgreSQL (όχι απαραίτητα `postgres`) |
| **OpenAI key** | `.env` | [platform.openai.com](https://platform.openai.com) |

> Τα placeholder (`REPLACE_ME`, `pk_test_...`) **δεν δουλεύουν**. Με placeholder keys θα δεις `Publishable key not valid` ή `https://npm/@clerk/...`.

### Backend — `.env` στο root

```powershell
Copy-Item .env.example .env
# Επεξεργαστείτε .env με τα πραγματικά keys σας
```

### Frontend — `artifacts\learn\.env`

```powershell
Copy-Item artifacts\learn\.env.example artifacts\learn\.env
# Βάλτε το ίδιο VITE_CLERK_PUBLISHABLE_KEY με το CLERK_PUBLISHABLE_KEY
```

### PowerShell syntax για env vars

Στο PowerShell **δεν** γράφετε `PORT=20579`. Χρησιμοποιείτε:

```powershell
$env:PORT = "20579"
$env:BASE_PATH = "/"
```

Ή αφήστε τα `.env` αρχεία — τα scripts τα φορτώνουν αυτόματα.

### Clerk

Στο [Clerk Dashboard](https://dashboard.clerk.com) πρόσθετε `http://localhost:20579` στα **Allowed origins**.

## 4. Βάση δεδομένων

### Αν έχετε ήδη PostgreSQL στο port 5432

Μην ξανατρέξετε Docker στο 5432. Χρησιμοποιήστε την υπάρχουσα βάση και ενημερώστε το `DATABASE_URL` στο `.env`.

Δημιουργήστε βάση (αν χρειάζεται):

```sql
CREATE DATABASE aitutor;
```

### Docker (μόνο αν δεν τρέχει κάτι στο 5432)

```powershell
docker run --name ai-tutor-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=aitutor -p 5432:5432 -d postgres:16
```

Εναλλακτικά, αν το 5432 είναι πιασμένο:

```powershell
docker run --name ai-tutor-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=aitutor -p 5433:5432 -d postgres:16
# DATABASE_URL=postgresql://postgres:postgres@localhost:5433/aitutor
```

### Schema

**Νέα βάση** — push από Drizzle schema:

```powershell
pnpm run db:push
```

**Επιπλέον migrations** (χωρίς `psql` — Node script):

```powershell
pnpm run db:migrate
```

## 5. Εκκίνηση

### Όλα μαζί (2 services)

```powershell
pnpm run dev
```

Αυτό ξεκινά:
- **API** στο `http://localhost:8080` (φορτώνει `.env` από root)
- **Frontend** στο `http://localhost:20579` (φορτώνει `artifacts/learn/.env`)

### Ξεχωριστά terminals

**Terminal 1 — API:**

```powershell
pnpm run dev:api
```

**Terminal 2 — Frontend:**

```powershell
pnpm run dev:learn
```

### Health check

- Frontend: http://localhost:20579
- API: http://localhost:8080/api/healthz

Αν βλέπεις `Port 20579 is already in use`:

```powershell
pnpm run dev:kill-ports
pnpm run dev
```

Το Vite proxy στέλνει αυτόματα `/api/*` → `http://localhost:8080`.

## 6. Χρήσιμες εντολές

```powershell
pnpm run typecheck
pnpm --filter @workspace/api-server run test
pnpm --filter @workspace/api-spec run codegen
pnpm run db:push
pnpm run db:migrate
```

## 7. Συχνά προβλήματα

| Πρόβλημα | Λύση |
|---|---|
| `Missing script: "dev"` με npm | Χρησιμοποιήστε **pnpm**, όχι npm |
| `'sh' is not recognized` στο preinstall | Διορθώθηκε — τρέξτε ξανά `pnpm install` |
| `@rollup/rollup-win32-x64-msvc` not found | Η εγκατάσταση δεν ολοκληρώθηκε — διαγράψτε `node_modules` και `pnpm install`. Προτιμήστε Node 24 αντί για 25 |
| Docker: `port 5432 already allocated` | Έχετε ήδη PostgreSQL — χρησιμοποιήστε το ή άλλαξε port σε 5433 |
| `psql` not recognized | Χρησιμοποιήστε `pnpm run db:migrate` αντί για psql |
| `No schema files found` (drizzle push) | Διορθώθηκε στο `drizzle.config.ts` — τρέξτε `pnpm run db:push` |
| `PORT environment variable is required` | Τρέξτε `pnpm run dev:learn` (ορίζει PORT/BASE_PATH) ή βάλτε στο `.env` |
| `VITE_CLERK_PUBLISHABLE_KEY=...` failed | Στο PowerShell: `$env:VITE_... = "..."` ή `.env` αρχείο |
| API 404 από browser | Βεβαιωθείτε ότι τρέχει το API στο 8080 και χρησιμοποιείτε το frontend στο 20579 |
| `export NODE_ENV=...` failed | Διορθώθηκε με `cross-env` — χρησιμοποιήστε `pnpm run dev:api` |
| `Publishable key not valid` / `https://npm/@clerk/...` | Βάλε **πραγματικά** Clerk keys (όχι placeholder) στα `.env` |
| `password authentication failed` | Διόρθωσε `DATABASE_URL` με τον σωστό κωδικό PostgreSQL |
| OpenAI errors | Έλεγξε `AI_INTEGRATIONS_OPENAI_*` στο `.env` |

## 8. Αρχιτεκτονία (τοπικά vs Replit)

| Replit | Τοπικά (Windows) |
|---|---|
| Reverse proxy: `/` → frontend, `/api` → backend | Vite proxy στο `vite.config.ts` |
| Replit secrets / env auto-inject | `.env` αρχεία + `dotenv-cli` |
| `pnpm run dev` per workflow | `pnpm run dev` (root) ή `dev:api` + `dev:learn` |
| Managed PostgreSQL | Τοπικό PostgreSQL ή Docker |
