# 02. Current Data Dictionary & Database Mapping

## Executive Summary

This document specifies the current data models, TypeScript interfaces, and mock data structures existing inside `src/data/seed.ts`. It maps each entity directly to its frontend consumer components, evaluates future relational database representations (PostgreSQL / SQLite via Drizzle ORM), and classifies the migration difficulty for each entity.

---

## 1. Master Entity Mapping Summary

| Entity | Current TypeScript Type | Source Location | Frontend Consumers | Proposed Future Table | Migration Difficulty |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Bank Account** | `BankAccount` | `seed.ts:566-579` | `AccountsPageClient`, `VendorsPageClient`, `AccountSummary`, `AccountCard`, `AddAccount` | `bank_accounts` | **Medium** |
| **Account Card (Summary)**| `AccountCard` | `seed.ts:32-41` | `account-cards.tsx` | Derived / `bank_accounts` | **Low** |
| **Transaction (Compact)**| `Transaction` | `seed.ts:167-175` | `recent-transactions.tsx`, `command-palette.tsx` | View / `transactions` | **Low** |
| **Transaction (Full)** | `FullTransaction` | `seed.ts:192-205`| `TransactionsPageClient`, `TransactionTable`, `TransactionSummary` | `transactions` | **High** |
| **Credit / Debit Card** | `CardData` | `seed.ts:384-400`| `CardsPageClient`, `InteractiveCard`, `CardControls`, `VirtualCardGenerator`, `CardList` | `cards` | **Critical (PCI Risk)** |
| **Contact** | Inferred object | `seed.ts:1-29` | `quick-transfer.tsx`, `quick-send.tsx`, `command-palette.tsx` | `contacts` | **Low** |
| **Transfer Record** | `TransferRecord` | `seed.ts:581-590`| `TransfersPageClient`, `TransferList`, `TransferStats`, `QuickSend` | `transfers` | **Medium** |
| **Budget Category** | `BudgetCategory` | `seed.ts:517-526`| `budget-rings.tsx`, `month-projection.tsx` | `budgets` | **Medium** |
| **Savings Goal** | `SavingsGoal` | `seed.ts:544-554`| `savings-goals.tsx` | `savings_goals` | **Low** |
| **Daily Spending** | `DailySpending` | `seed.ts:562-564`| `spending-calendar.tsx`, `month-projection.tsx` | Derived / `transactions` | **High (Aggregation)** |
| **Stock Holding** | `Holding` | `seed.ts:468-477`| `holdings-table.tsx`, `portfolio-allocation.tsx`, `live-ticker.tsx` | `portfolio_holdings` | **Medium** |
| **Watchlist Item** | `WatchlistItem` | `seed.ts:494-500`| `watchlist.tsx`, `live-ticker.tsx` | `portfolio_watchlist`| **Low** |
| **Portfolio History** | `PortfolioHistoryPoint`| `seed.ts:507-511`| `performance-chart.tsx` | `portfolio_snapshots`| **Medium** |
| **Notification** | `Notification` | `seed.ts:636-651`| `NotificationsPageClient`, `nav-secondary.tsx` | `notifications` | **Medium** |
| **Crypto Coin** | `CryptoCoin` | `seed.ts:742-751`| `CryptoPageClient`, `my-balance.tsx`, `top-coins.tsx`, `my-portfolio.tsx`, `coin-insight.tsx`, `trade-form.tsx`, `market-overview.tsx`, `command-palette.tsx` | `crypto_assets` | **Low / External API** |
| **Crypto Transaction**| `CryptoTransaction` | `seed.ts:771-780`| `my-portfolio.tsx` | `crypto_transactions`| **Medium** |
| **Support Ticket** | `SupportTicket` | `seed.ts:983-993`| `support-page-client.tsx` | `support_tickets` | **Low** |
| **FAQ Item** | `FaqItem` | `seed.ts:938-944`| `support-page-client.tsx` | `faq_items` | **Low** |
| **Analytics (Category)** | `CategoryBreakdown` | `seed.ts:427-434`| `category-donut.tsx` | Derived from `transactions` | **High (Aggregation)** |
| **Analytics (Recurring)**| `RecurringCharge` | `seed.ts:446-455`| `recurring-detector.tsx` | `recurring_rules` / derived | **High (Pattern Match)**|
| **Analytics (Heatmap)** | `SpendingHeatmapDay` | `seed.ts:413-415`| `spending-heatmap.tsx` | Derived from `transactions` | **High (Aggregation)** |
| **Analytics (Month)** | `MonthComparison` | `seed.ts:457-459`| `month-comparison.tsx` | Derived from `transactions` | **Medium (Aggregation)**|
| **Analytics (AI Insights)**| `AiInsight` | `seed.ts:461-466`| `ai-insights.tsx` | `financial_insights` | **Low** |
| **Financial Health** | `HealthFactor` | `seed.ts:899-905`| `health-score.tsx` | Computed service | **Medium** |

---

## 2. Detailed Entity Specifications

### 2.1 Account Entities

#### `BankAccount`
- **Location**: `src/data/seed.ts:566-579`
- **Current TypeScript Interface**:
  ```typescript
  export type BankAccount = {
    id: string
    name: string
    type:
      | "Bank Accounts"
      | "Cash"
      | "brokerage"
      | "E Wallet"
      | "Crypto Exchange"
      | "Crypto Wallet"
      | "Investment"
    bankType?: "checking" | "savings"
    institution: string
    institutionLogo: string
    accountNumber: string
    balance: number
    currency: string
    change: number
    changePercent: number
    lastActivity: string
    color: string
  }
  ```
- **Field Analysis**:
  - `id`: String identifier (e.g., `"ba-1"`, `"ba-2"`). Needs UUID/cuid in database.
  - `name`: Human-readable label (e.g., `"Chase Sapphire Checking"`).
  - `type`: High-level asset category. Note casing inconsistency (`"Bank Accounts"` vs `"brokerage"` vs `"E Wallet"`).
  - `bankType`: Sub-classification for traditional bank accounts (`"checking" | "savings"`).
  - `institution`: Entity issuing the account (e.g., `"Chase"`, `"Robinhood"`).
  - `institutionLogo`: Path string to local asset (`"/logos/chase.png"`).
  - `accountNumber`: Masked string (`"****4589"`).
  - `balance`: Floating point representation. **Critical database risk**: Must be stored as `numeric(15, 2)` or integer cents to avoid IEEE 754 precision issues.
  - `currency`: Symbol string (`"$"`). Should migrate to ISO 4217 code (`"USD"`).
  - `change`, `changePercent`: Rolling periodic metrics. In DB, these should be dynamically computed or cached in rollups.
  - `lastActivity`: Relative string (`"2 hours ago"`). Must become a `timestamp with time zone`.
  - `color`: Tailwind color class string (e.g. `"bg-blue-500"`).
- **Used by**:
  - `src/components/accounts/accounts-page-client.tsx`
  - `src/components/accounts/account-summary.tsx`
  - `src/components/accounts/account-grid.tsx`
  - `src/components/accounts/add-account.tsx`
  - `src/components/vendors/vendors-page-client.tsx`
- **Proposed Future Schema**:
  ```typescript
  // PostgreSQL / SQLite Drizzle definition
  export const bankAccounts = pgTable("bank_accounts", {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id").notNull().references(() => organizations.id),
    name: varchar("name", { length: 120 }).notNull(),
    type: varchar("type", { length: 50 }).notNull(),
    bankType: varchar("bank_type", { length: 30 }),
    institution: varchar("institution", { length: 100 }).notNull(),
    institutionLogo: text("institution_logo"),
    accountNumberMasked: varchar("account_number_masked", { length: 20 }).notNull(),
    balanceCents: bigint("balance_cents", { mode: "number" }).notNull().default(0),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    color: varchar("color", { length: 50 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  })
  ```
- **Migration Difficulty**: **Medium**. Discrepancy between `add-account.tsx` types (`"checking" | "savings"`) and `BankAccount["type"]` must be normalized.

---

### 2.2 Transaction Entities

#### `FullTransaction` & `Transaction`
- **Location**: `src/data/seed.ts:167-175`, `192-205`
- **Current TypeScript Interfaces**:
  ```typescript
  export type Transaction = {
    id: string
    merchant: string
    category: string
    date: string
    amount: number
    status: "completed" | "pending" | "declined"
    avatar: string
  }

  export type FullTransaction = {
    id: string
    merchant: string
    category: string
    date: string
    amount: number
    status: "completed" | "pending" | "declined"
    avatar: string
    transactionId: string
    type: "income" | "expense"
    account: string
    notes?: string
    fee?: number
  }
  ```
- **Field Analysis**:
  - `id`: Internal key (`"ft-1"`).
  - `transactionId`: External human-readable code (`"TXN-784321"`).
  - `merchant`: Counterparty name (`"Stripe Payout"`, `"AWS Cloud Services"`).
  - `category`: Financial category (`"Income"`, `"Infrastructure"`, `"Software"`).
  - `date`: Human-readable date string (`"Feb 24, 2025"`). Must be stored as `timestamp with time zone`.
  - `amount`: Number value. Negative indicates expense in some places, positive in others. Must be standardized with a strict signed `bigint` (cents) and explicit `type` column.
  - `status`: Enum (`'completed' | 'pending' | 'declined'`).
  - `avatar`: URL / initials fallback string.
  - `type`: Explicit flow direction (`'income' | 'expense'`).
  - `account`: String representation of account name (e.g. `"Chase Checking ...4589"`). Must become a proper foreign key `accountId -> bank_accounts.id`.
  - `fee`: Optional transaction surcharge.
  - `notes`: Optional memo.
- **Used by**:
  - `src/components/transactions/transactions-page-client.tsx`
  - `src/components/transactions/transaction-table.tsx`
  - `src/components/transactions/transaction-summary.tsx`
  - `src/components/transactions/transaction-filters.tsx`
  - `src/components/dashboard/recent-transactions.tsx`
  - `src/components/command-palette.tsx`
- **Proposed Future Schema**:
  ```typescript
  export const transactions = pgTable("transactions", {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id").notNull().references(() => organizations.id),
    accountId: uuid("account_id").notNull().references(() => bankAccounts.id, { onDelete: "cascade" }),
    referenceCode: varchar("reference_code", { length: 50 }).notNull().unique(),
    merchant: varchar("merchant", { length: 150 }).notNull(),
    merchantLogo: text("merchant_logo"),
    category: varchar("category", { length: 80 }).notNull(),
    amountCents: bigint("amount_cents", { mode: "number" }).notNull(),
    feeCents: bigint("fee_cents", { mode: "number" }).notNull().default(0),
    type: varchar("type", { length: 20 }).notNull(), // 'income' | 'expense' | 'transfer'
    status: varchar("status", { length: 20 }).notNull().default("completed"),
    notes: text("notes"),
    transactedAt: timestamp("transacted_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  })
  ```
- **Migration Difficulty**: **High**. Requires:
  1. Parsing and converting flat account string names back to foreign keys.
  2. Parsing formatted date strings (`"Feb 24, 2025"`) into ISO timestamps.
  3. Re-architecting summary statistics (`TransactionSummary`) from client-side array filters to server-side SQL aggregate queries (`SUM`, `COUNT`, `MAX`).

---

### 2.3 Card Entities

#### `CardData`
- **Location**: `src/data/seed.ts:384-400`
- **Current TypeScript Interface**:
  ```typescript
  export type CardData = {
    id: string
    name: string
    type: "physical" | "virtual"
    last4: string
    cardNumber: string
    holder: string
    expiry: string
    cvv: string
    network: "visa" | "mastercard"
    frozen: boolean
    dailyLimit: number
    monthlySpend: number
    monthlyLimit: number
    color: string
  }
  ```
- **Critical Risk Analysis (PCI-DSS Compliance)**:
  - `cardNumber`: Contains full 16-digit card strings (`"4532 8921 4455 8921"`).
  - `cvv`: Contains raw 3-digit security codes (`"342"`).
  - Storing plaintext PANs and CVVs in any database is a severe PCI-DSS violation.
- **Future Database Strategy**:
  - The database table must **never** include `card_number` or `cvv`.
  - Only `last_4`, `expiry_month`, `expiry_year`, `cardholder_name`, and external provider tokens (e.g. Stripe `card_xxx` token) may be persisted.
- **Proposed Future Schema**:
  ```typescript
  export const cards = pgTable("cards", {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id").notNull().references(() => organizations.id),
    accountId: uuid("account_id").references(() => bankAccounts.id),
    providerToken: varchar("provider_token", { length: 255 }),
    name: varchar("name", { length: 100 }).notNull(),
    type: varchar("type", { length: 20 }).notNull(), // 'physical' | 'virtual'
    network: varchar("network", { length: 30 }).notNull(),
    last4: varchar("last_4", { length: 4 }).notNull(),
    holder: varchar("holder", { length: 120 }).notNull(),
    expiryMonth: smallint("expiry_month").notNull(),
    expiryYear: smallint("expiry_year").notNull(),
    isFrozen: boolean("is_frozen").notNull().default(false),
    dailyLimitCents: bigint("daily_limit_cents", { mode: "number" }).notNull(),
    monthlyLimitCents: bigint("monthly_limit_cents", { mode: "number" }).notNull(),
    colorScheme: varchar("color_scheme", { length: 80 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  })
  ```
- **Migration Difficulty**: **Critical**. Requires refactoring the virtual card generator to omit client-side CVV/PAN generation or mock them strictly in UI memory without persisting sensitive fields.

---

### 2.4 Contact & Transfer Entities

#### `Contact` (Inferred) & `TransferRecord`
- **Location**: `src/data/seed.ts:1-29`, `581-590`
- **Current TypeScript Interface**:
  ```typescript
  export type TransferRecord = {
    id: string
    type: "sent" | "received" | "scheduled"
    contactName: string
    contactAvatar: string
    amount: number
    date: string
    status: "completed" | "pending" | "failed"
    note?: string
  }
  ```
- **Field Analysis**:
  - `contacts` currently has no dedicated TypeScript type; it is an inferred object literal array with `{ id, name, email, avatar, phone, recentAmount }`.
  - `TransferRecord` stores `contactName` and `contactAvatar` as denormalized flat strings instead of referencing `contactId`.
  - There is no field indicating which bank account was debited/credited (`fromAccountId` / `toAccountId`).
- **Proposed Future Schemas**:
  ```typescript
  export const contacts = pgTable("contacts", {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id").notNull().references(() => organizations.id),
    name: varchar("name", { length: 150 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 50 }),
    avatarUrl: text("avatar_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  })

  export const transfers = pgTable("transfers", {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id").notNull().references(() => organizations.id),
    fromAccountId: uuid("from_account_id").references(() => bankAccounts.id),
    contactId: uuid("contact_id").notNull().references(() => contacts.id),
    amountCents: bigint("amount_cents", { mode: "number" }).notNull(),
    type: varchar("type", { length: 20 }).notNull(), // 'sent' | 'received' | 'scheduled'
    status: varchar("status", { length: 20 }).notNull().default("completed"),
    note: text("note"),
    scheduledFor: timestamp("scheduled_for", { withTimezone: true }),
    executedAt: timestamp("executed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  })
  ```
- **Migration Difficulty**: **Medium**. Requires creating the `contacts` table, seeding it, and linking transfer records via foreign keys.

---

### 2.5 Budget & Savings Entities

#### `BudgetCategory` & `SavingsGoal`
- **Location**: `src/data/seed.ts:517-526`, `544-554`
- **Current TypeScript Interfaces**:
  ```typescript
  export type BudgetCategory = {
    id: string
    category: string
    spent: number
    budget: number
    iconName: string
    color: string
  }

  export type SavingsGoal = {
    id: string
    name: string
    targetAmount: number
    currentAmount: number
    monthlyContribution: number
    deadline: string
    iconName: string
    color: string
  }
  ```
- **Field Analysis**:
  - `spent` inside `BudgetCategory` is hardcoded in seed data. In a real system, `spent` must be calculated dynamically via SQL `SUM(amount)` over the active month for that category.
  - `budget` represents the allocated monthly limit.
  - `SavingsGoal.deadline` is stored as `"Sep 2025"`. Needs `date` or `timestamp`.
- **Proposed Future Schemas**:
  ```typescript
  export const budgets = pgTable("budgets", {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id").notNull().references(() => organizations.id),
    category: varchar("category", { length: 80 }).notNull(),
    budgetAmountCents: bigint("budget_amount_cents", { mode: "number" }).notNull(),
    iconName: varchar("icon_name", { length: 50 }).notNull(),
    color: varchar("color", { length: 50 }).notNull(),
    periodMonth: smallint("period_month").notNull(),
    periodYear: integer("period_year").notNull(),
  })

  export const savingsGoals = pgTable("savings_goals", {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id").notNull().references(() => organizations.id),
    name: varchar("name", { length: 150 }).notNull(),
    targetAmountCents: bigint("target_amount_cents", { mode: "number" }).notNull(),
    currentAmountCents: bigint("current_amount_cents", { mode: "number" }).notNull().default(0),
    monthlyContributionCents: bigint("monthly_contribution_cents", { mode: "number" }).notNull().default(0),
    deadline: date("deadline").notNull(),
    iconName: varchar("icon_name", { length: 50 }).notNull(),
    color: varchar("color", { length: 50 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  })
  ```
- **Migration Difficulty**: **Medium**.

---

### 2.6 Investment & Portfolio Entities

#### `Holding`, `WatchlistItem`, `PortfolioHistoryPoint`
- **Location**: `src/data/seed.ts:468-477`, `494-500`, `507-511`
- **Current TypeScript Interfaces**:
  ```typescript
  export type Holding = {
    id: string
    symbol: string
    name: string
    shares: number
    avgPrice: number
    currentPrice: number
    change24h: number
    allocation: number
    sparkline: number[]
    sector: string
    quantity: number
    avgBuyPrice: number
  }

  export type WatchlistItem = {
    id: string
    symbol: string
    name: string
    currentPrice: number
    dayChange: number
    sparkline: number[]
  }
  ```
- **Analysis**:
  - `Holding` contains duplicate fields: `shares` and `quantity` both represent position size; `avgPrice` and `avgBuyPrice` both represent purchase price.
  - `currentPrice` and `sparkline` are market prices that fluctuate continuously. Storing live market prices in a relational DB leads to stale reads; real market data should be retrieved via financial APIs (e.g. Polygon, AlphaVantage) or periodic background ingestion jobs.
- **Migration Difficulty**: **Medium**.

---

### 2.7 Notification & Support Entities

#### `Notification` & `SupportTicket`
- **Location**: `src/data/seed.ts:636-651`, `983-993`
- **Current TypeScript Interfaces**:
  ```typescript
  export type Notification = {
    id: string
    title: string
    description: string
    time: string
    read: boolean
    type: "transaction" | "security" | "system" | "promotion" | "request"
    icon: string
    actionable?: {
      accept: string
      decline: string
      from?: string
      fromAvatar?: string
    }
  }

  export type SupportTicket = {
    id: string
    subject: string
    status: "open" | "in-progress" | "resolved"
    priority: "high" | "medium" | "low"
    category: string
    created: string
    lastUpdate: string
    messages: number
  }
  ```
- **Proposed Future Schemas**:
  ```typescript
  export const notifications = pgTable("notifications", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id),
    title: varchar("title", { length: 200 }).notNull(),
    description: text("description").notNull(),
    isRead: boolean("is_read").notNull().default(false),
    type: varchar("type", { length: 50 }).notNull(),
    icon: varchar("icon", { length: 50 }).notNull(),
    actionPayload: jsonb("action_payload"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  })

  export const supportTickets = pgTable("support_tickets", {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id").notNull().references(() => organizations.id),
    userId: uuid("user_id").notNull().references(() => users.id),
    subject: varchar("subject", { length: 255 }).notNull(),
    status: varchar("status", { length: 30 }).notNull().default("open"),
    priority: varchar("priority", { length: 20 }).notNull().default("medium"),
    category: varchar("category", { length: 80 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  })
  ```
- **Migration Difficulty**: **Low**. Clean mapping directly to standard CRUD tables.
