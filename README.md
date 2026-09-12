# Morao Artisans — Accounting & Inventory Management Platform

Proprietary financial accounting and inventory management platform built for Morao Artisans.

## Architecture & Features

- **Dual Workspace Support**:
  - **Finance Dashboard**: Full accounting suite, journal entries, balance sheet, profit & loss, cash flows, payables, receivables, and transaction management.
  - **Inventory Dashboard (PSI)**: Stock tracking, valuation, physical counts, movement logs, asset depreciation, and capital gains/losses.
- **Enterprise Financial Reporting**: US GAAP compliant statement generation, multi-period comparative analysis, and CSV export.
- **Modern UI / UX**: Built with Next.js App Router, Tailwind CSS v4, shadcn/ui components, and interactive Recharts visualizations.
- **Role & Preferences Management**: Multi-currency controls, custom fiscal calendars, theme customization (dark/light/system), and workspace switching.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) |
| UI & Components | shadcn/ui |
| Styling | Tailwind CSS v4 |
| Charts & Data Viz | Recharts |
| Motion | Motion |
| Drag & Drop | @dnd-kit |
| Language | TypeScript |

## Getting Started

### Prerequisites
- Node.js 20+
- pnpm 9+ or 10+

### Installation & Local Development

```bash
# Install dependencies
pnpm install

# Run the development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── docs/                 # Architecture, schemas, and specifications
├── public/               # Static assets and icons
├── src/
│   ├── app/              # Next.js App Router routes and pages
│   │   ├── (auth)/       # Authentication (Sign in, Sign up)
│   │   ├── (dashboard)/  # Accounting & finance workspace
│   │   └── psi_dashboard/# Inventory & stock valuation workspace
│   ├── components/       # Reusable UI & workspace components
│   ├── contexts/         # Preferences and application state
│   ├── data/             # Seed data and mock stores
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities and formatting helpers
│   └── types/            # TypeScript type definitions
└── package.json
```

## Ownership & License

Copyright (c) 2026 Morao Artisans. All rights reserved.

This software is the confidential and proprietary property of Morao Artisans. Unauthorized copying, distribution, or commercial exploitation is strictly prohibited.
