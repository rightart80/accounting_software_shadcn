# 07. Service Boundary Data Flow Map (Phase 2 Post-Migration)

## Executive Overview

Following the completion of **Phase 2 (Data Access Service Boundary Migration)**, direct component imports from the runtime seed data store (`@/data/seed`) have been eliminated across the entire application. 

A strictly typed service boundary layer now encapsulates all runtime data access:
- **Seed Data Source**: `src/data/seed.ts` (Now exclusively accessed via `src/services/*`)
- **Domain Type Definitions**: `src/types/*` (Extracted in Phase 1)
- **Service Boundary Modules**: `src/services/*` (11 pure passthrough modules)
- **Consumer Components**: 38 UI components across all dashboard and management routes

This architecture decouples presentational UI from data storage representation, preparing the codebase for Phase 3 UI optimization and Phase 6 asynchronous database integration (Drizzle ORM / PostgreSQL).

---

## 1. Architectural Data Flow Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Current Architecture (Phase 2)                  │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │                      src/data/seed.ts                          │   │
│   │               (Static InMemory Seed Data Store)                │   │
│   └───────────────────────────────┬────────────────────────────────┘   │
│                                   │ Direct internal ESM import         │
│                                   ▼                                    │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │                     src/services/*.service.ts                  │   │
│   │         11 Service Modules (Pure Getter Passthrough)           │   │
│   └───────┬───────────────────────┬────────────────────────┬───────┘   │
│           │                       │                        │           │
│           ▼                       ▼                        ▼           │
│   ┌───────────────┐       ┌───────────────┐       ┌────────────────┐   │
│   │ Module Scoped │       │ Initial State │       │ Component Body │   │
│   │ Constants     │       │ useState()    │       │ Memoized Reads │   │
│   └───────┬───────┘       └───────┬───────┘       └────────┬───────┘   │
│           │                       │                        │           │
│           └───────────────────────┼────────────────────────┘           │
│                                   │                                    │
│                                   ▼                                    │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │                   Presentational Components                    │   │
│   │      (Cards, Tables, Recharts Visuals, Dialogs, Filter Bars)   │   │
│   └────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│                        Future Architecture (Phase 6)                   │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │                   PostgreSQL / SQLite Database                 │   │
│   └───────────────────────────────┬────────────────────────────────┘   │
│                                   │ SQL Queries via Drizzle ORM        │
│                                   ▼                                    │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │                     src/services/*.service.ts                  │   │
│   │             Async Database Queries & Transaction Logic         │   │
│   └───────┬────────────────────────────────────────────────┬───────┘   │
│           │                                                │           │
│           ▼ Server Components                              ▼ Actions   │
│   ┌───────────────────────────────┐       ┌────────────────────────┐   │
│   │ Server Component RSC Pre-fetch│       │ Server Action Mutation │   │
│   │   const data = await get...() │       │   await createRecord() │   │
│   └───────────────┬───────────────┘       └────────┬───────────────┘   │
│                   │ Initial props                  │ revalidatePath    │
│                   ▼                                ▼                   │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │                 Client Components / UI Controls                │   │
│   └────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Complete Domain Data Flow Matrix

### 2.1 Accounts & Banking Domain

| Route(s) | Consumer Component | Service Module & Function | Returned Type | State Binding & Lifecycle | Downstream Consumers / Output |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/accounts`<br>`/psi_dashboard/accounts` | `AccountsPageClient` (`src/components/accounts/accounts-page-client.tsx`) | `accounts.service.ts`<br>`getBankAccounts()` | `BankAccount[]` | `useState(getBankAccounts())` (Allows local optimistic adding via `handleAddAccount`) | `AccountSummary`, `AccountCard`, `AddAccountDialog` |
| `/vendors`<br>`/psi_dashboard/vendors` | `VendorsPageClient` (`src/components/vendors/vendors-page-client.tsx`) | `accounts.service.ts`<br>`getBankAccounts()` | `BankAccount[]` | `useState(getBankAccounts())` (Filtered by vendor type and bank type) | `AccountSummary`, `AccountGrid` |
| `/dashboard`<br>`/psi_dashboard` | `AccountCards` (`src/components/dashboard/account-cards.tsx`) | `accounts.service.ts`<br>`getAccountCards()` | `AccountCard[]` | Module constant: `accountCards = getAccountCards()`; used in `initialCards` | Stacked card carousel, card detail toggle, dynamic card addition form |

---

### 2.2 Transactions Domain

| Route(s) | Consumer Component | Service Module & Function | Returned Type | State Binding & Lifecycle | Downstream Consumers / Output |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/transactions`<br>`/psi_dashboard/transactions` | `TransactionsPageClient` (`src/components/transactions/transactions-page-client.tsx`) | `transactions.service.ts`<br>`getFullTransactions()` | `FullTransaction[]` | Module constant: `fullTransactions = getFullTransactions()`; filtered in `useMemo` | `TransactionSummary`, `TransactionTable`, Pagination, CSV Export |
| `/dashboard`<br>`/psi_dashboard` | `RecentTransactions` (`src/components/dashboard/recent-transactions.tsx`) | `transactions.service.ts`<br>`getRecentTransactions()` | `Transaction[]` | Module constant: `recentTransactions = getRecentTransactions()` | Recent transaction list, icon decorators, transaction search link |
| Global (All Routes) | `CommandPalette` (`src/components/command-palette.tsx`) | `transactions.service.ts`<br>`getRecentTransactions()` | `Transaction[]` | Module constant: `recentTransactions = getRecentTransactions()` | Quick command search modal (⌘K) |

---

### 2.3 Cards Domain

| Route(s) | Consumer Component | Service Module & Function | Returned Type | State Binding & Lifecycle | Downstream Consumers / Output |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/cards`<br>`/psi_dashboard/cards` | `CardsPageClient` (`src/components/cards/cards-page-client.tsx`) | `cards.service.ts`<br>`getCards()` | `CardData[]` | `useState(getCards())` (Local pin toggle, freeze toggle, card creation) | Card visualizer, Card details drawer, Spending limits, Security settings |

---

### 2.4 Budgets & Savings Goals Domain

| Route(s) | Consumer Component | Service Module & Function | Returned Type | State Binding & Lifecycle | Downstream Consumers / Output |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/budgets`<br>`/psi_dashboard/budgets` | `BudgetRings` (`src/components/budgets/budget-rings.tsx`) | `budgets.service.ts`<br>`getBudgetCategories()` | `BudgetCategory[]` | Module constant: `budgetCategories = getBudgetCategories()` | Radial progress rings, category budget consumption summary |
| `/budgets`<br>`/psi_dashboard/budgets` | `MonthProjection` (`src/components/budgets/month-projection.tsx`) | `budgets.service.ts`<br>`getBudgetCategories()`, `getDailySpending()` | `BudgetCategory[]`, `DailySpending[]` | Module constants: `budgetCategories`, `dailySpending` | Projected monthly burn chart, pacing indicators |
| `/budgets`<br>`/psi_dashboard/budgets` | `SavingsGoals` (`src/components/budgets/savings-goals.tsx`) | `budgets.service.ts`<br>`getSavingsGoals()` | `SavingsGoal[]` | `useState(getSavingsGoals())` (Allows adding funds & updating goal progress) | Goal cards, milestone progress bars, target date projections |
| `/budgets`<br>`/psi_dashboard/budgets` | `SpendingCalendar` (`src/components/budgets/spending-calendar.tsx`) | `budgets.service.ts`<br>`getDailySpending()` | `DailySpending[]` | `useState(() => getDailySpending())` | Heatmap calendar grid, day-level spending popover inspection |

---

### 2.5 Transfers & Contacts Domain

| Route(s) | Consumer Component | Service Module & Function | Returned Type | State Binding & Lifecycle | Downstream Consumers / Output |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/transfers`<br>`/psi_dashboard/transfers` | `TransfersPageClient` (`src/components/transfers/transfers-page-client.tsx`) | `transfers.service.ts`<br>`getTransferRecords()` | `TransferRecord[]` | `useState(getTransferRecords())` | Transfer statistics, transfer history table, transfer cancellation |
| `/transfers`<br>`/psi_dashboard/transfers` | `QuickSend` (`src/components/transfers/quick-send.tsx`) | `transfers.service.ts`<br>`getContacts()` | `Contact[]` | Local constant: `contacts = getContacts()` | Avatar contact selector, amount input, simulated send flow |
| `/dashboard`<br>`/psi_dashboard` | `QuickTransfer` (`src/components/dashboard/quick-transfer.tsx`) | `transfers.service.ts`<br>`getContacts()` | `Contact[]` | Local constant: `contacts = getContacts()` | Dashboard quick-transfer bar, instant transfer dispatch |
| Global (All Routes) | `CommandPalette` (`src/components/command-palette.tsx`) | `transfers.service.ts`<br>`getContacts()` | `Contact[]` | Module constant: `contacts = getContacts()` | Quick send to contact via search bar |

---

### 2.6 Investments Domain

| Route(s) | Consumer Component | Service Module & Function | Returned Type | State Binding & Lifecycle | Downstream Consumers / Output |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/investments`<br>`/psi_dashboard/investments` | `HoldingsTable` (`src/components/investments/holdings-table.tsx`) | `investments.service.ts`<br>`getHoldings()` | `Holding[]` | `seedHoldings = getHoldings()`; initial price map initialized in `useState` | Real-time price simulation, sortable holdings table, P&L calculations |
| `/investments`<br>`/psi_dashboard/investments` | `LiveTicker` (`src/components/investments/live-ticker.tsx`) | `investments.service.ts`<br>`getHoldings()`, `getWatchlistItems()` | `Holding[]`, `WatchlistItem[]` | Module constants: `holdings`, `watchlistItems` | Top scrolling ticker banner across investments page |
| `/investments`<br>`/psi_dashboard/investments` | `PortfolioAllocation` (`src/components/investments/portfolio-allocation.tsx`) | `investments.service.ts`<br>`getHoldings()` | `Holding[]` | Module constant: `holdings = getHoldings()` | Asset allocation donut chart, sector percentage breakdown |
| `/investments`<br>`/psi_dashboard/investments` | `Watchlist` (`src/components/investments/watchlist.tsx`) | `investments.service.ts`<br>`getWatchlistItems()` | `WatchlistItem[]` | `useState(getWatchlistItems())` | Watchlist cards, sparkline charts, add/remove watchlist symbols |
| `/investments`<br>`/psi_dashboard/investments` | `PerformanceChart` (`src/components/investments/performance-chart.tsx`) | `investments.service.ts`<br>`getPortfolioHistory()` | `PortfolioHistoryPoint[]` | Module constant: `portfolioHistory = getPortfolioHistory()` | Interactive historical performance Recharts area graph with time ranges |

---

### 2.7 Notifications Domain

| Route(s) | Consumer Component | Service Module & Function | Returned Type | State Binding & Lifecycle | Downstream Consumers / Output |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/notifications`<br>`/psi_dashboard/notifications` | `NotificationsPageClient` (`src/components/notifications/notifications-page-client.tsx`) | `notifications.service.ts`<br>`getNotifications()` | `Notification[]` | `useState(getNotifications())` | Full notification inbox, mark as read, category filters, unread badge |
| Global Header / Navbar | `NavSecondary` (`src/components/nav-secondary.tsx`) | `notifications.service.ts`<br>`getNotifications()` | `Notification[]` | Module constant: `notifications = getNotifications()` (Reused for unread count & top 6 slice) | Notification bell badge, notification popover dropdown, interactive action buttons |

---

### 2.8 Customer Support Domain

| Route(s) | Consumer Component | Service Module & Function | Returned Type | State Binding & Lifecycle | Downstream Consumers / Output |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/support`<br>`/psi_dashboard/support` | `SupportPageClient` (`src/components/support/support-page-client.tsx`) | `support.service.ts`<br>`getFaqItems()`, `getSupportTickets()`, `getSystemStatus()` | `FaqItem[]`, `SupportTicket[]`, `SystemStatus[]` | `faqItems` (module constant), `tickets` (`useState`), `systemStatus` (module constant) | FAQ search accordion, Support ticket tracker & creator, live system status indicators |

---

### 2.9 Cryptocurrency Domain

| Route(s) | Consumer Component | Service Module & Function | Returned Type | State Binding & Lifecycle | Downstream Consumers / Output |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/crypto`<br>`/psi_dashboard/crypto` | `CryptoPageClient` (`src/components/crypto/crypto-page-client.tsx`) | `crypto.service.ts`<br>`getCryptoCoins()` | `CryptoCoin[]` | Module constant: `cryptoCoins = getCryptoCoins()` | Live price ticker simulator, selected coin selector |
| `/crypto`<br>`/psi_dashboard/crypto` | `MarketOverview` (`src/components/crypto/market-overview.tsx`) | `crypto.service.ts`<br>`getCryptoCoins()` | `CryptoCoin[]` | Module constant: `cryptoCoins = getCryptoCoins()` | Top crypto gainers/losers, market trends |
| `/crypto`<br>`/psi_dashboard/crypto` | `TopCoins` (`src/components/crypto/top-coins.tsx`) | `crypto.service.ts`<br>`getCryptoCoins()` | `CryptoCoin[]` | Module constant: `cryptoCoins = getCryptoCoins()` | Coin rank table, price changes, market capitalization |
| `/crypto`<br>`/psi_dashboard/crypto` | `MyBalance` (`src/components/crypto/my-balance.tsx`) | `crypto.service.ts`<br>`getCryptoCoins()` | `CryptoCoin[]` | Module constant: `cryptoCoins = getCryptoCoins()` | Crypto portfolio balance card, 24h gain summary |
| `/crypto`<br>`/psi_dashboard/crypto` | `MyPortfolio` (`src/components/crypto/my-portfolio.tsx`) | `crypto.service.ts`<br>`getCryptoCoins()` | `CryptoCoin[]` | Module constant: `cryptoCoins = getCryptoCoins()` | Crypto holdings list, allocation bars |
| `/crypto`<br>`/psi_dashboard/crypto` | `TradeForm` (`src/components/crypto/trade-form.tsx`) | `crypto.service.ts`<br>`getCryptoCoins()` | `CryptoCoin[]` | Module constant: `cryptoCoins = getCryptoCoins()` | Buy/Sell order executor form, fee calculator |
| `/crypto`<br>`/psi_dashboard/crypto` | `CoinInsight` (`src/components/crypto/coin-insight.tsx`) | `crypto.service.ts`<br>`getCryptoCoins()` | `CryptoCoin[]` | Module constant: `cryptoCoins = getCryptoCoins()` | Deep coin metrics, all-time-high data, circulation supply |
| Global (All Routes) | `CommandPalette` (`src/components/command-palette.tsx`) | `crypto.service.ts`<br>`getCryptoCoins()` | `CryptoCoin[]` | Module constant: `cryptoCoins = getCryptoCoins()` | Fast lookup for crypto coin prices in command modal |

---

### 2.10 Analytics & Insights Domain

| Route(s) | Consumer Component | Service Module & Function | Returned Type | State Binding & Lifecycle | Downstream Consumers / Output |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/analytics`<br>`/psi_dashboard/analytics` | `SpendingHeatmap` (`src/components/analytics/spending-heatmap.tsx`) | `analytics.service.ts`<br>`getSpendingHeatmapData()` | `SpendingHeatmapDay[]` | Module constant: `spendingHeatmapData` | 52-week activity calendar heatmap, tooltip expenditure breakdown |
| `/analytics`<br>`/psi_dashboard/analytics` | `CategoryDonut` (`src/components/analytics/category-donut.tsx`) | `analytics.service.ts`<br>`getCategoryBreakdowns()` | `CategoryBreakdown[]` | Module constant: `categoryBreakdowns` | Donut chart visualizer with center totals, legend with progress bars |
| `/analytics`<br>`/psi_dashboard/analytics` | `RecurringDetector` (`src/components/analytics/recurring-detector.tsx`) | `analytics.service.ts`<br>`getRecurringCharges()` | `RecurringCharge[]` | Module constant: `recurringCharges` | Subscriptions table, billing cycle indicators, monthly commitment tally |
| `/analytics`<br>`/psi_dashboard/analytics` | `MonthComparison` (`src/components/analytics/month-comparison.tsx`) | `analytics.service.ts`<br>`getMonthComparisons()` | `MonthComparison[]` | Module constant: `monthComparisons` (Shared between `ChangeLabel` & `MonthComparison`) | Grouped bar chart comparing current month vs previous month expenses |
| `/analytics`<br>`/psi_dashboard/analytics` | `AiInsights` (`src/components/analytics/ai-insights.tsx`) | `analytics.service.ts`<br>`getAiInsights()` | `AiInsight[]` | Module constant: `aiInsights` | AI-generated financial insights, recommendation cards |

---

### 2.11 Dashboard Domain

| Route(s) | Consumer Component | Service Module & Function | Returned Type | State Binding & Lifecycle | Downstream Consumers / Output |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/dashboard`<br>`/psi_dashboard` | `FinancialOverview` (`src/components/dashboard/financial-overview.tsx`) | `dashboard.service.ts`<br>`getFinancialOverview()` | `FinancialOverviewRecord[]` | Module constant: `financialOverview` | Income vs Expense dual bar chart with date filters |
| `/dashboard`<br>`/psi_dashboard` | `HealthScore` (`src/components/dashboard/health-score.tsx`) | `dashboard.service.ts`<br>`getFinancialHealthScore()` | `FinancialHealthScore` | Getter call site: `getFinancialHealthScore()` | Gauge score visualizer, debt-to-income metric, savings rate, credit health |
| `/dashboard`<br>`/psi_dashboard` | `MoneyMovement` (`src/components/dashboard/money-movement.tsx`) | `dashboard.service.ts`<br>`getMoneyMovementByPeriod()` | Record of period data | Module constant: `moneyMovementByPeriod = getMoneyMovementByPeriod()` | Money flow area chart with dynamic period switching (weekly/monthly/annual) |
| `/dashboard`<br>`/psi_dashboard` | `SpendingLimit` (`src/components/dashboard/spending-limit.tsx`) | `dashboard.service.ts`<br>`getSpendingLimit()` | `SpendingLimit` | Module constant: `spendingLimit = getSpendingLimit()` | Circular limit gauge, daily/monthly spend alert threshold indicators |
| `/dashboard`<br>`/psi_dashboard` | `AccountCards` (`src/components/dashboard/account-cards.tsx`) | `dashboard.service.ts`<br>`getWalletBalance()` | `WalletBalance` | Local constant inside component: `walletBalance = getWalletBalance()` | Top balance summary widget |

---

## 3. Forward-Looking Architectural Readiness

1. **Zero Component Seed Coupling**:
   - Zero components in `src/components/` import from `@/data/seed`.
   - If `src/data/seed.ts` is deleted or replaced with Drizzle ORM queries, exactly **0 lines in `src/components/`** need to be touched.
2. **Pure Interface Contract**:
   - Every service function maintains strict TypeScript return signatures mirroring domain types in `src/types/`.
   - The contract is synchronous during Phase 2-5, and ready to become `async` during Phase 6 database migration.
3. **Single Render Invocation**:
   - Every consumer component either defines its service data at module scope or reads it once into local state, guaranteeing that migrating to network/database requests in Phase 6 will generate at most one fetch per render cycle.
