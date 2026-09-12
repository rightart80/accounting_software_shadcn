# Multi-Tenant SaaS Accounting Architecture & Implementation Plan

This document details the complete end-to-end architecture to transform this fintech/accounting dashboard into a **Multi-Tenant SaaS Platform** using **Neon Postgres (Serverless)** and **Drizzle ORM**, designed to cleanly support a future **Tauri 2 (Windows / SQLite)** standalone desktop app.

---

## 1. Current State: How Data Flows Right Now (From `seed.ts` to UI)

```
[src/data/seed.ts] (Hardcoded mock data & TS types)
        │
        ▼ (Static import)
[*PageClient Components] (e.g., AccountsPageClient, TransactionsPageClient)
        │
        ▼ (useState(seedData))
[React Local State] (const [accounts, setAccounts])
        │
        ▼ (Props)
[UI Presentation Components] (AccountSummary, AccountCard, TransactionTable)
```

### Step-by-Step Current Flow:
1. **Source of Truth**: All data lives in `src/data/seed.ts`. It exports plain JavaScript arrays and objects (`bankAccounts`, `fullTransactions`, `cardsData`, `accountCards`, `walletBalance`).
2. **Page Loading**: A page component (such as `src/app/(dashboard)/accounts/page.tsx`) renders a client component (`AccountsPageClient`).
3. **State Initialization**: Inside the client component, React creates local state:
   ```typescript
   const [accounts, setAccounts] = useState<BankAccount[]>(bankAccounts)
   ```
4. **Display**: The state is passed down as props to subcomponents:
   - `<AccountSummary accounts={accounts} />` computes aggregate numbers (total balance, cash flow, account counts).
   - `<AccountCard />` renders each card in the grid.
5. **Data Mutations**: When an action occurs (e.g. clicking "Add Account" in `add-account.tsx`):
   - A fake loading delay (`setTimeout 1500ms`) runs.
   - A synthetic object is created in memory (`id: ba-${Date.now()}`).
   - It calls `setAccounts((prev) => [...prev, newAccount])`.
6. **The Limitation**: The change exists **only in browser RAM**. The moment the user refreshes or navigates away, the page re-imports `seed.ts` and all changes vanish. There are no API routes, no server actions, and no persistent store.

---

## 2. Multi-Tenant Target Architecture: Neon Postgres + Drizzle ORM

An accounting firm (master user) can create and manage multiple client organizations. Each organization receives **its own isolated database** on Neon Postgres.

```
                   ┌───────────────────────────────────┐
                   │        Next.js Web / API          │
                   └─────────────────┬─────────────────┘
                                     │
            ┌────────────────────────┴────────────────────────┐
            ▼                                                 ▼
┌───────────────────────┐                         ┌───────────────────────┐
│     Control Plane     │                         │     Tenant Plane      │
│   (Central Neon DB)   │                         │  (Organization DBs)   │
├───────────────────────┤                         ├───────────────────────┤
│ • users               │                         │ Org A: Acme Corp      │ ──> DB_Org_A
│ • organizations       │ ──dynamic connection──> │ Org B: Globex Corp    │ ──> DB_Org_B
│ • tenant_databases    │                         │ Org C: Initech        │ ──> DB_Org_C
└───────────────────────┘                         └───────────────────────┘
```

### Why this architecture solves all business requirements:
- **Zero Cross-Tenant Data Leakage**: Even if a developer writes `SELECT * FROM transactions`, it is physically impossible to leak another client's records because they are completely separate databases.
- **Independent Point-In-Time Restore (PITR)**: If Client B accidentally deletes a batch of journal entries, Neon allows rolling back Client B's database to 10 minutes ago without touching Client A or the master database.
- **Neon Serverless Scale-to-Zero**: Inactive client organizations consume 0 compute resources when not in use.
- **One-Click Client Export**: If a client leaves the accounting firm, their entire database can be exported as a standard PostgreSQL dump or transferred directly.
- **Future SQLite Compatibility for Tauri**: Because Drizzle ORM is used, the exact same tenant schema can run over SQLite when packaged for the desktop app.

---

## 3. Data Structure Specification (Before Database Implementation)

Before creating migrations, we must finalize the schemas. The structure is separated into **Control Plane** and **Tenant Plane**:

### A. Control Plane Schema (Master Database)

| Table | Purpose | Key Fields |
| :--- | :--- | :--- |
| `users` | Master accounts / firm accountants | `id`, `email`, `name`, `avatar_url`, `created_at` |
| `organizations` | Business instances / clients | `id`, `name`, `slug`, `logo_url`, `currency`, `created_at` |
| `organization_members` | Who can access which organization | `user_id`, `organization_id`, `role` (`owner`, `accountant`, `auditor`, `viewer`) |
| `tenant_databases` | Connection metadata for each org | `organization_id`, `neon_project_id`, `connection_string` (encrypted), `status` (`provisioning`, `ready`, `suspended`) |

---

### B. Tenant Plane Schema (Per-Organization Accounting Database)

Based on `src/data/seed.ts`, here are the core business tables created inside every organization's database:

#### 1. `bank_accounts`
- `id`: UUID (Primary Key)
- `name`: Account Name (e.g., "Primary Checking", "High-Yield Savings")
- `type`: 'checking' | 'savings' | 'crypto' | 'investment'
- `institution`: Bank name (Chase, Goldman Sachs, etc.)
- `institution_logo`: URL/Path to logo
- `account_number`: Masked number (e.g. '****4589')
- `balance`: Numeric (precision 14, scale 2)
- `currency`: USD, EUR, etc.
- `color`: Tailwind color class
- `created_at`, `updated_at`: Timestamps

#### 2. `transactions`
- `id`: UUID (Primary Key)
- `account_id`: UUID (Foreign Key to `bank_accounts.id`)
- `transaction_code`: String (e.g. 'TX-94821')
- `merchant`: Merchant / Payee name
- `merchant_logo`: URL/Path
- `category`: Category name (Software, Travel, Office, etc.)
- `amount`: Numeric (precision 14, scale 2)
- `type`: 'income' | 'expense'
- `status`: 'completed' | 'pending' | 'failed'
- `date`: Timestamp
- `notes`: Text
- `fee`: Numeric
- `created_at`: Timestamp

#### 3. `cards`
- `id`: UUID (Primary Key)
- `account_id`: UUID (Foreign Key to `bank_accounts.id`)
- `name`: Card label
- `type`: 'virtual' | 'physical'
- `last_4`: 4-digit string
- `expiry`: 'MM/YY'
- `spending_limit`: Numeric
- `spent_this_month`: Numeric
- `status`: 'active' | 'frozen' | 'cancelled'
- `color`: Styling metadata

#### 4. `transfers` & `contacts`
- `contacts`: `id`, `name`, `email`, `avatar_url`, `bank_details`
- `transfers`: `id`, `contact_id`, `from_account_id`, `amount`, `currency`, `status`, `reference`, `scheduled_at`

#### 5. `budgets` & `savings_goals`
- `budgets`: `id`, `category`, `allocated_amount`, `period_start`, `period_end`
- `savings_goals`: `id`, `title`, `target_amount`, `current_amount`, `deadline`

---

## 4. How the Dynamic Connection Works in Code

### Dynamic Neon Connection Resolver (`src/lib/db/tenant.ts`):
```typescript
import { drizzle } from "drizzle-orm/neon-serverless"
import { Pool } from "@neondatabase/serverless"
import * as tenantSchema from "./schemas/tenant"

// Cache connection pools per tenant to prevent exhausting connections
const poolCache = new Map<string, Pool>()

export async function getTenantDb(organizationId: string) {
  // 1. Fetch connection URL from Control Plane for this organization
  const tenantConfig = await getTenantDbConfig(organizationId)

  // 2. Reuse or create connection pool
  let pool = poolCache.get(organizationId)
  if (!pool) {
    pool = new Pool({ connectionString: tenantConfig.connectionString })
    poolCache.set(organizationId, pool)
  }

  // 3. Return Drizzle instance bound to this tenant's schema
  return drizzle(pool, { schema: tenantSchema })
}
```

### Automatic Provisioning on Organization Creation:
When an accountant clicks **"Create New Organization"**:
1. Next.js Server Action calls the **Neon REST API** (`POST https://console.neon.tech/api/v2/projects`).
2. Neon provisions a new database and returns a connection string within seconds.
3. Next.js runs the Drizzle migration on the newly created database (instantiating all accounting tables).
4. Next.js optionally seeds default accounts and categories.
5. The organization appears immediately in the top sidebar dropdown switcher (`DashboardSwitcher` in `src/components/app-sidebar.tsx`).

---

## 5. Implementation Roadmap (Phases)

- **Phase 1: Data Model Alignment**: Confirm with user the exact list of tables & fields needed.
- **Phase 2: Drizzle ORM Setup**: Install `drizzle-orm`, `drizzle-kit`, `@neondatabase/serverless`. Configure `drizzle.config.ts`.
- **Phase 3: Control Plane & Organization Switcher**: Connect the top sidebar switcher to real organization state and add an "Add Organization" flow.
- **Phase 4: Server Actions & Replacing `seed.ts`**: Replace client-side `useState(seedData)` with Server Actions connected to Drizzle.
