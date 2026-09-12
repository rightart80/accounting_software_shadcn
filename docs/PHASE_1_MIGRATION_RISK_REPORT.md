# Phase 1 Migration Risk Report (PHASE_1_MIGRATION_RISK_REPORT.md)

## Executive Summary

This report delivers a thorough vulnerability and architectural risk analysis for transitioning the **Morao Artisans Accounting** application from mock seed data to a production database architecture. Migrating a financial management application presents unique challenges: data integrity, PCI-DSS compliance, state synchronization, concurrent modifications, and transaction atomicity.

Each identified risk is scored by **Severity** (Critical, High, Medium, Low) and **Probability** (High, Medium, Low), followed by specific technical mitigation strategies.

---

## 1. Risk Matrix Overview

| Risk ID | Risk Description | Severity | Probability | Impact Area |
| :---: | :--- | :---: | :---: | :--- |
| **RISK-01** | Ephemeral State & Total Data Loss on Refresh | **Critical** | **Definite (100%)** | All Pages & Forms |
| **RISK-02** | PCI-DSS Non-Compliance via Plaintext Card & CVV Generation | **Critical** | **High** | Cards Module (`VirtualCardGenerator`) |
| **RISK-03** | Tight Coupling of TypeScript Types in Mock Data File | **High** | **Definite (100%)** | 52 Component Files |
| **RISK-04** | State Desynchronization Across Global UI (Header vs Page) | **High** | **High** | Notifications & Sidebar |
| **RISK-05** | Performance Degradation from Client-Side Aggregations | **High** | **High** | Transactions, Analytics, Holdings |
| **RISK-06** | Lack of Input Validation (Missing Zod Schemas) | **High** | **Medium** | Add Account, Quick Send, Trade Form |
| **RISK-07** | Absence of Server Error Boundaries & Loading States | **Medium** | **High** | User Experience & Resilience |
| **RISK-08** | Floating-Point Financial Rounding Inaccuracies | **High** | **Medium** | Accounting Balances & Currencies |
| **RISK-09** | Missing Authentication Context & Tenant Isolation | **Critical** | **High** | Multi-Tenant Data Security |
| **RISK-10** | Misconfigured / Duplicated Route Endpoints | **Medium** | **Definite (100%)** | Payable, Receivable, PSI Dashboard |

---

## 2. In-Depth Risk Analysis & Mitigation Blueprints

### RISK-01: Ephemeral State & Total Data Loss on Refresh
- **Current Behavior**:
  Components like `AccountsPageClient`, `CardsPageClient`, `TransfersPageClient`, and `NotificationsPageClient` instantiate local React state using mock constants:
  ```typescript
  const [accounts, setAccounts] = useState<BankAccount[]>(bankAccounts)
  ```
  Mutations append objects to RAM via `setAccounts((prev) => [...prev, newAccount])`.
- **Architectural Consequence**:
  Any browser refresh, page transition, or session restart immediately discards all user-created accounts, transfers, and card changes, silently resetting the application to `seed.ts` defaults.
- **Mitigation Strategy**:
  1. Transition all mutations to Next.js 16 Server Actions (`"use server"`).
  2. Write mutations through Drizzle ORM into PostgreSQL / SQLite.
  3. Revalidate the cache using Next.js 16 `updateTag()` for immediate read-your-writes guarantees.

---

### RISK-02: PCI-DSS Non-Compliance in Virtual Card Generator
- **Current Behavior**:
  In `src/components/cards/virtual-card-generator.tsx`, the component generates random 16-digit Primary Account Numbers (PANs) and 3-digit CVVs:
  ```typescript
  const card: CardData = {
    id: `vc-${Date.now()}`,
    cardNumber: `${randomDigits(4)} ${randomDigits(4)} ${randomDigits(4)} ${last4}`,
    cvv: randomDigits(3),
    ...
  }
  ```
- **Architectural Consequence**:
  Storing raw credit card numbers and CVVs in any database triggers strict **PCI-DSS Level 1 audit requirements** (hardware security modules, expensive audits, extreme legal liability). Storing unencrypted CVVs is illegal under PCI-DSS Rule 3.2.
- **Mitigation Strategy**:
  1. The target `cards` table must **never** contain columns for `card_number` or `cvv`.
  2. Only store `last_4`, `expiry_month`, `expiry_year`, `holder`, and external payment token (`provider_token`).
  3. In development/mock mode, synthesize PANs dynamically in client memory for visual rendering only, and never transmit or persist them.

---

### RISK-03: Tight Coupling of TypeScript Types in Mock Data File
- **Current Behavior**:
  Domain models such as `BankAccount`, `FullTransaction`, `CardData`, `Holding`, and `Notification` are declared directly in `src/data/seed.ts`.
- **Architectural Consequence**:
  Deleting or decoupling `src/data/seed.ts` causes immediate TypeScript compiler failure across 52 files. Developers cannot swap out mock data for a database client without breaking the entire build.
- **Mitigation Strategy**:
  1. Execute **Phase 1: Type Decoupling** before writing any database code.
  2. Extract all domain interfaces into dedicated files under `src/types/` (e.g. `src/types/accounts.ts`, `src/types/transactions.ts`).
  3. Re-point all component imports to `@/types/*`.

---

### RISK-04: Cross-Component State Desynchronization
- **Current Behavior**:
  In `src/components/nav-secondary.tsx`, the unread notification badge is evaluated at module load:
  ```typescript
  const unreadCount = notifications.filter((n) => !n.read).length
  ```
  Meanwhile, in `src/components/notifications/notifications-page-client.tsx`, marking notifications as read only modifies its own local `items` state.
- **Architectural Consequence**:
  A user reading all notifications on `/notifications` still sees a badge saying "5 unread" in the top sidebar. The header popover continues showing stale unread items.
- **Mitigation Strategy**:
  1. Implement a shared notification store or use Next.js 16 Server Actions with `refresh()` to invalidate and re-render server layouts upon mutation.
  2. Alternatively, manage unread notification badges using a global React Context (`NotificationProvider`) or TanStack Query cache.

---

### RISK-05: Performance Degradation from Client-Side Aggregations
- **Current Behavior**:
  In `TransactionSummary` and `TransactionsPageClient`:
  ```typescript
  const totalIn = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0)
  const totalOut = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + Math.abs(t.amount), 0)
  ```
- **Architectural Consequence**:
  While performant with 50 mock items, this pattern completely collapses with 5,000 to 50,000 real accounting entries. Fetching all rows to the client browser to calculate sums causes massive network payloads, slow hydration, and UI freezing.
- **Mitigation Strategy**:
  1. Offload all aggregations to SQL queries:
     ```sql
     SELECT 
       SUM(CASE WHEN type = 'income' THEN amount_cents ELSE 0 END) AS total_in,
       SUM(CASE WHEN type = 'expense' THEN amount_cents ELSE 0 END) AS total_out
     FROM transactions 
     WHERE account_id = $1;
     ```
  2. Implement server-side pagination with `LIMIT` and `OFFSET` (or cursor-based pagination).

---

### RISK-06: Lack of Input Validation (Missing Zod Schemas)
- **Current Behavior**:
  Forms such as `AddAccount` (`add-account.tsx`), `QuickSend` (`quick-send.tsx`), and `TradeForm` (`trade-form.tsx`) perform superficial checks (e.g. `!institution || !accountType`). They lack format validation, length limits, character sanitization, or number range constraints.
- **Architectural Consequence**:
  Directly wiring these forms to database inserts risks SQL errors, database constraint violations, cross-site scripting (XSS), or injection of malformed data.
- **Mitigation Strategy**:
  1. Introduce strict **Zod schemas** for every mutation in `src/lib/validations/`.
  2. Validate input inside Server Actions before invoking domain services. Return structured field errors for invalid submissions.

---

### RISK-07: Absence of Server Error Boundaries & Loading States
- **Current Behavior**:
  Only 8 out of 15 dashboard routes define `loading.tsx` skeletons. Zero routes define `error.tsx` error boundaries.
- **Architectural Consequence**:
  If a database query times out, a serverless pool exhausts connections, or an unhandled exception occurs, Next.js displays an unstyled 500 crash screen, completely locking the user out of the dashboard.
- **Mitigation Strategy**:
  1. Create `error.tsx` error boundaries in `src/app/(dashboard)/` and sub-routes to gracefully catch database exceptions and provide "Retry" buttons.
  2. Add missing `loading.tsx` skeletons for `/transfers`, `/cards`, `/budgets`, `/settings`, and `/notifications`.

---

### RISK-08: Floating-Point Financial Rounding Inaccuracies
- **Current Behavior**:
  `balance: number`, `amount: number`, and `rate: number` use native JavaScript 64-bit binary floating-point arithmetic (IEEE 754):
  `0.1 + 0.2 === 0.30000000000000004`.
- **Architectural Consequence**:
  In financial accounting, floating-point rounding errors lead to unreconciled ledgers, unbalanced journal entries, and discrepancies in financial statements.
- **Mitigation Strategy**:
  1. Store all monetary amounts in the database as **integer cents** (`bigint`) or fixed-point decimals (`numeric(15, 2)`).
  2. Use specialized currency libraries (such as `dinero.js` or `decimal.js`) for arithmetic before converting to user-facing display strings.

---

### RISK-09: Missing Authentication Context & Tenant Isolation
- **Current Behavior**:
  `/sign-in` and `/sign-up` simulate authentication using `setTimeout()` and redirect directly to `/dashboard`. There is no session token, cookie, JWT, or database identity.
- **Architectural Consequence**:
  Without real user and organization authentication, database queries cannot filter data by user or tenant. Any user could potentially view or overwrite all organizational records.
- **Mitigation Strategy**:
  1. Integrate a production authentication system (Auth.js / Supabase Auth / Clerk / Lucia).
  2. Extract `userId` and `organizationId` from secure server session cookies (`cookies()`) on every request.
  3. Restrict Drizzle queries strictly by `where(eq(table.organizationId, sessionOrgId))` or use dedicated per-tenant Neon database pools.

---

### RISK-10: Misconfigured / Duplicated Route Endpoints
- **Current Behavior**:
  - `/payable` and `/receivable` currently render `<CryptoPageClient />`.
  - `/crypto` redirects to `/payable`.
  - `src/app/psi_dashboard/` duplicates 13 routes from `(dashboard)` but renders identical finance client components rather than inventory management views.
- **Architectural Consequence**:
  Confusing user experience, broken accounting domain semantics, and redundant codebase maintenance overhead.
- **Mitigation Strategy**:
  1. Correct `/crypto` routing to serve crypto views.
  2. Build genuine Accounts Payable (AP) and Accounts Receivable (AR) invoice management schemas and components.
  3. Consolidate `psi_dashboard` or cleanly segregate its domain models.
