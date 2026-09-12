# 03. End-to-End Data Flow Mapping

## Executive Summary

This document traces the data lifecycle for every page in the application. It highlights the current anti-pattern where data originates from static JavaScript arrays in `src/data/seed.ts`, gets copied into ephemeral React `useState` hooks inside client components, and vanishes upon page refresh. It contrasts this with the target architecture using **Next.js 16 Server Components**, **Server Actions**, and **Drizzle ORM**.

---

## 1. Architectural Flow Comparison

### 1.1 Current Architecture (Static Mock Store)

```
┌────────────────────────────────────────────────────────┐
│                   src/data/seed.ts                     │
│  (1,107 lines of static JS arrays & TypeScript types)  │
└──────────────────────────┬─────────────────────────────┘
                           │ (Static ESM Import)
                           ▼
┌────────────────────────────────────────────────────────┐
│             Page Component (Server Component)          │
│   (Thin pass-through wrapper, zero data fetching)      │
└──────────────────────────┬─────────────────────────────┘
                           │ (Direct JSX Render)
                           ▼
┌────────────────────────────────────────────────────────┐
│          *PageClient Component ("use client")          │
│   - Initializes local state: useState(seedArray)       │
│   - Computes stats in render loop: useMemo(reduce)     │
│   - Simulates async mutations: setTimeout()            │
└──────────────────────────┬─────────────────────────────┘
                           │ (Prop Drilling)
                           ▼
┌────────────────────────────────────────────────────────┐
│               Presentational UI Subcomponents          │
│  (Tables, cards, charts, summaries, modals, inputs)   │
└────────────────────────────────────────────────────────┘
```

### 1.2 Target Architecture (Database-Backed with Next.js 16)

```
┌────────────────────────────────────────────────────────┐
│            PostgreSQL (Neon) / SQLite (Tauri)          │
└──────────────────────────▲─────────────────────────────┘
                           │ Drizzle ORM Queries / Prepared Statements
                           ▼
┌────────────────────────────────────────────────────────┐
│                 Data Access & Service Layer            │
│  - src/lib/db/schema.ts                                │
│  - src/lib/services/accounts.service.ts                │
│  - src/lib/services/transactions.service.ts            │
└──────────────────────────▲─────────────────────────────┘
                           │ Direct async function calls
         ┌─────────────────┴─────────────────┐
         │                                   │
         ▼                                   ▼
┌──────────────────────────────┐   ┌──────────────────────────────┐
│  Server Actions (Mutations)  │   │  Page RSC (Data Fetching)    │
│  - "use server"              │   │  - Async Server Component    │
│  - Input validation (Zod)    │   │  - Fetches pre-computed data │
│  - Runs DB transactions      │   │  - Passes typed props down   │
│  - updateTag() & refresh()   │   │                              │
└──────────────▲───────────────┘   └──────────────┬───────────────┘
               │ (Form Action / RPC)              │ (Hydrated Props)
               └─────────────────┬────────────────┘
                                 │
                                 ▼
┌────────────────────────────────────────────────────────┐
│               Interactive Client Components            │
│  - Displays initial server data                        │
│  - Optimistic UI updates (React 19 useOptimistic)      │
│  - Handles user interactions & dialog states           │
└────────────────────────────────────────────────────────┘
```

---

## 2. Page-by-Page Data Flow Audit

### 2.1 `/dashboard` — Main Financial Overview

```
src/app/(dashboard)/dashboard/page.tsx (Server Component)
 │
 └── <DashboardCustomizer /> (Client Component)
       │
       ├── State Management:
       │     - useState for widget order (persisted in localStorage: "vault-dashboard-order")
       │     - @dnd-kit drag-and-drop sortable context
       │
       ├── Subcomponent: <FinancialOverview />
       │     - Data Source: financialOverview directly from @/data/seed
       │     - State: useState("30d") for time period filter
       │
       ├── Subcomponent: <AccountCards />
       │     - Data Source: accountCards, walletBalance from @/data/seed
       │     - State: Pure presentational display
       │
       ├── Subcomponent: <QuickTransfer />
       │     - Data Source: contacts from @/data/seed
       │     - State: useState for selectedContact, amount, transfer status
       │
       ├── Subcomponent: <SpendingLimit />
       │     - Data Source: spendingLimit from @/data/seed
       │     - State: Server Component, static render
       │
       ├── Subcomponent: <MoneyMovement />
       │     - Data Source: moneyMovementByPeriod from @/data/seed
       │     - State: useState("30d") period filter
       │
       ├── Subcomponent: <HealthScore />
       │     - Data Source: financialHealthScore from @/data/seed
       │     - State: useState for active factor drawer
       │
       └── Subcomponent: <RecentTransactions />
             - Data Source: recentTransactions from @/data/seed
             - State: Server Component, static render
```

### 2.2 `/accounts` — Bank & Cash Accounts

```
src/app/(dashboard)/accounts/page.tsx (Server Component)
 │
 └── <AccountsPageClient /> (Client Component)
       │
       ├── Data Source: bankAccounts imported from @/data/seed
       │
       ├── State Management:
       │     - const [accounts, setAccounts] = useState<BankAccount[]>(bankAccounts)
       │     - const [selectedType, setSelectedType] = useState<AccountType>("all")
       │     - const [selectedBankType, setSelectedBankType] = useState<AccountBankType>("all")
       │     - useMemo() filters accounts by type and bankType
       │
       ├── Subcomponent: <AccountSummary accounts={accounts} />
       │     - State: Pure calculation via accounts.reduce() (total balance, net change)
       │
       ├── Subcomponent: <AccountCard account={account} />
       │     - State: Visual presentation of balance, activity, and sparklines
       │
       └── Subcomponent: <AddAccount onAdd={handleAddAccount} />
             - State: useState("idle" | "form" | "loading" | "success")
             - Mutation: Synthetic setTimeout(1500ms), generates `ba-${Date.now()}`,
               calls parent onAdd(), updates accounts in RAM only.
```

### 2.3 `/transactions` — Transaction Ledger

```
src/app/(dashboard)/transactions/page.tsx (Server Component)
 │
 └── <TransactionsPageClient /> (Client Component)
       │
       ├── Data Source: fullTransactions imported from @/data/seed
       │
       ├── State Management:
       │     - const [search, setSearch] = useState("")
       │     - const [categoryFilter, setCategoryFilter] = useState("all")
       │     - const [statusFilter, setStatusFilter] = useState("all")
       │     - const [typeFilter, setTypeFilter] = useState("all")
       │     - const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
       │     - const [expandedId, setExpandedId] = useState<string | null>(null)
       │     - Client-side filtering via useMemo over fullTransactions array
       │
       ├── Subcomponent: <TransactionSummary transactions={filteredData} />
       │     - State: Client-side reduce() calculating totalIn, totalOut, largest, count
       │
       ├── Subcomponent: <TransactionFilters />
       │     - State: Controlled search inputs, select dropdowns
       │
       ├── Subcomponent: <TransactionTable />
       │     - State: Table selection checkboxes, accordion expansion
       │
       └── Subcomponent: <TransactionActions />
             - Mutation: Client-side CSV generation via Blob / ObjectURL
```

### 2.4 `/transfers` — Money Transfers & Contacts

```
src/app/(dashboard)/transfers/page.tsx (Server Component)
 │
 └── <TransfersPageClient /> (Client Component)
       │
       ├── Data Source: transferRecords from @/data/seed
       │
       ├── State Management:
       │     - const [activeTab, setActiveTab] = useState<TabKey>("all")
       │     - const [transfers, setTransfers] = useState<TransferRecord[]>(transferRecords)
       │     - Cancellation: handleCancel(id) filters out transfer from RAM
       │
       ├── Subcomponent: <TransferStats transfers={transfers} />
       │     - State: Pure aggregation via reduce()
       │
       ├── Subcomponent: <TransferList transfers={filtered} onCancel={handleCancel} />
       │     - State: Renders transfer history items
       │
       └── Subcomponent: <QuickSend onSend={...} />
             - Data Source: contacts from @/data/seed
             - State: Contact selection, amount, note, animation states
             - Mutation: Synthetic setTimeout(1500ms), prepends `tr-${Date.now()}` to transfers state
```

### 2.5 `/cards` — Credit & Debit Cards

```
src/app/(dashboard)/cards/page.tsx (Server Component)
 │
 └── <CardsPageClient /> (Client Component)
       │
       ├── Data Source: cardsData from @/data/seed
       │
       ├── State Management:
       │     - const [cards, setCards] = useState<CardData[]>(cardsData)
       │     - const [activeCardId, setActiveCardId] = useState<string>(cardsData[0].id)
       │     - const [frozenMap, setFrozenMap] = useState<Record<string, boolean>>({...})
       │     - const [dailyLimits, setDailyLimits] = useState<Record<string, number>>({...})
       │
       ├── Subcomponent: <InteractiveCard card={activeCard} frozen={...} />
       │     - State: Interactive flip / details toggle
       │
       ├── Subcomponent: <CardControls card={activeCard} onToggleFreeze={...} />
       │     - Mutation: Updates frozenMap and dailyLimits in client state
       │
       ├── Subcomponent: <VirtualCardGenerator onCardCreated={...} />
       │     - State: Generates random card numbers, CVVs, expiry dates via Math.random()
       │     - Mutation: Synthesizes CardData object, appends to cards in RAM
       │
       └── Subcomponent: <CardList cards={cards} onSelect={setActiveCardId} />
             - State: List selector
```

### 2.6 `/investments` — Stocks, Portfolio & Live Ticker

```
src/app/(dashboard)/investments/page.tsx (Server Component)
 │
 ├── Subcomponent: <LiveTicker /> (Client Component)
 │     - Data Source: holdings, watchlistItems from @/data/seed
 │     - State: Infinite marquee CSS animation, client-side gain/loss calculations
 │
 ├── Subcomponent: <PortfolioAllocation /> (Client Component)
 │     - Data Source: holdings from @/data/seed
 │     - State: Aggregates value by sector in useMemo, renders Recharts Pie
 │
 ├── Subcomponent: <PerformanceChart /> (Client Component)
 │     - Data Source: portfolioHistory from @/data/seed
 │     - State: useState("1Y") timeframe selector
 │
 ├── Subcomponent: <HoldingsTable /> (Client Component)
 │     - Data Source: holdings from @/data/seed
 │     - State:
 │         * Live price simulation: setInterval(3000ms) drifting prices +/- 0.3%
 │         * Table sorting by symbol, price, change, allocation
 │
 └── Subcomponent: <Watchlist /> (Client Component)
       - Data Source: watchlistItems from @/data/seed
       - State: Static rendering of watchlist sparklines
```

### 2.7 `/budgets` — Budget Rings & Spending Calendar

```
src/app/(dashboard)/budgets/page.tsx (Server Component)
 │
 ├── Subcomponent: <BudgetRings /> (Client Component)
 │     - Data Source: budgetCategories from @/data/seed
 │     - State: SVG circumference calculation for circular progress
 │
 ├── Subcomponent: <SavingsGoals /> (Server Component)
 │     - Data Source: savingsGoals from @/data/seed
 │     - State: Statically calculates projected completion dates
 │
 ├── Subcomponent: <SpendingCalendar /> (Client Component)
 │     - Data Source: dailySpending from @/data/seed
 │     - State: Calendar grid visualization
 │
 └── Subcomponent: <MonthProjection /> (Client Component)
       - Data Source: budgetCategories, dailySpending from @/data/seed
       - State: Recharts composite area chart comparing budget vs actual
```

### 2.8 `/payable` & `/receivable` (Currently Aliased to Crypto)

```
src/app/(dashboard)/payable/page.tsx & receivable/page.tsx (Server Components)
 │
 └── <CryptoPageClient /> (Client Component)
       │
       ├── Data Source: cryptoCoins from @/data/seed
       │
       ├── State Management:
       │     - Live price simulation: setInterval(3000ms) drifting crypto prices
       │     - const [selectedCoin, setSelectedCoin] = useState("btc")
       │
       ├── Subcomponents: <MyBalance />, <TopCoins />, <MyPortfolio />, <CoinInsight />
       │     - State: Real-time re-calculation of net worth based on drifting prices
       │
       └── Subcomponents: <TradeForm />, <MarketOverview />
             - State: Trade simulation tab (Buy, Sell, Trade), currency conversion
```

### 2.9 `/notifications` — Notifications Center

```
src/app/(dashboard)/notifications/page.tsx (Server Component)
 │
 └── <NotificationsPageClient /> (Client Component)
       │
       ├── Data Source: notifications from @/data/seed
       │
       ├── State Management:
       │     - const [items, setItems] = useState<Notification[]>(seedNotifications)
       │     - const [filter, setFilter] = useState<FilterType>("all")
       │
       └── Mutations (Local State Only):
             - markAllRead(): maps items in RAM
             - toggleRead(id): updates single item
             - dismiss(id): filters out item
             * NOTE: Top sidebar badge (in nav-secondary.tsx) remains unsynchronized!
```

### 2.10 `/support` — FAQ & Support Tickets

```
src/app/(dashboard)/support/page.tsx (Server Component)
 │
 └── <SupportPageClient /> (Client Component)
       │
       ├── Data Source: faqItems, supportTickets, systemStatus from @/data/seed
       │
       ├── State Management:
       │     - const [activeTab, setActiveTab] = useState<TabId>("faq")
       │     - FAQ tab: search string, category pill filters, accordion openId
       │     - Tickets tab: const [tickets] = useState<SupportTicket[]>(supportTickets)
       │     - Contact form: name, email, subject, message input states
       │     - System status: renders uptime cards and incident logs
```

### 2.11 `/settings` — User Settings & Preferences

```
src/app/(dashboard)/settings/page.tsx (Server Component)
 │
 └── <SettingsPageClient /> (Client Component)
       │
       ├── State Management:
       │     - User profile state: useState("Sadaqat Rao"), useState("islamsadaqat@gmail.com")
       │     - useState for twoFA toggle (boolean)
       │     - useState for notification switches
       │     - useState for active sessions table
       │     - next-themes useTheme hook for theme selection
```

---

## 3. High-Risk Calculated Metrics on the Client

The audit identified multiple compute-heavy calculations being performed in client-side render cycles that will degrade performance when data grows beyond mock arrays:

1. **Transaction Summary (`transaction-summary.tsx`)**:
   - `totalIn`: Iterates through all transactions with `.filter().reduce()`.
   - `totalOut`: Iterates through all transactions with `.filter().reduce()`.
   - `largest`: Iterates through all transactions with `.reduce()`.
   *Future Fix*: `SELECT SUM(amount) FROM transactions WHERE type = 'income'` executed server-side.

2. **Holdings Table & Live Ticker (`holdings-table.tsx`, `live-ticker.tsx`)**:
   - Computes return on investment: `((currentPrice - avgBuyPrice) / avgBuyPrice) * 100` for every holding on every re-render.
   *Future Fix*: Pre-computed in SQL query or cached portfolio service.

3. **Analytics Heatmap & Category Donut (`spending-heatmap.tsx`, `category-donut.tsx`)**:
   - Groups transactions into daily calendar cells and category percentages.
   *Future Fix*: PostgreSQL date aggregation: `GROUP BY date_trunc('day', transacted_at)` or dedicated analytics view.
