"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import { usePreferences } from "@/contexts/preferences-context"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  LayoutDashboardIcon,
  WalletIcon,
  StoreIcon,
  ArrowLeftRightIcon,
  CreditCardIcon,
  ChartAreaIcon,
  TargetIcon,
  SettingsIcon,
  LifeBuoyIcon,
  LandmarkIcon,
  SendIcon,
  TrendingUpIcon,
  ArrowUpRightIcon,
  ArrowDownLeftIcon,
  BellIcon,
  LogInIcon,
  UserPlusIcon,
  UsersIcon,
  CircleDollarSignIcon,
  ReceiptIcon,
  Building2Icon,
  ScaleIcon,
  FileSpreadsheetIcon,
  CoinsIcon,
  BitcoinIcon,
  ArrowLeftIcon,
  ChevronRightIcon,
} from "lucide-react"

const data = {
  user: {
    name: "Sadaqat Rao.",
    email: "islamsadaqat@gmail.com",
    avatar: "/avatars/user.jpg",
  },
  navBusiness: [
    { title: "Overview", url: "/dashboard", icon: <LayoutDashboardIcon /> },
    { title: "Accounts", url: "/accounts", icon: <WalletIcon /> },
    { title: "Transfers", url: "/transfers", icon: <SendIcon /> },
  ],
  navEntities: [
    { title: "Clients", url: "/clients", icon: <UsersIcon /> },
    { title: "Vendors", url: "/vendors", icon: <StoreIcon /> },
    { title: "Authorities", url: "/authorities", icon: <LandmarkIcon /> },
  ],
  navMoney: [
    { title: "Transactions", url: "/transactions", icon: <ArrowLeftRightIcon /> },
    { title: "Income", url: "/income", icon: <CircleDollarSignIcon /> },
    { title: "Payable", url: "/payable", icon: <ArrowUpRightIcon /> },
    { title: "Expenses", url: "/expenses", icon: <ReceiptIcon /> },
    { title: "Receivable", url: "/receivable", icon: <ArrowDownLeftIcon /> },
    { title: "Currencies", url: "/currencies", icon: <CoinsIcon /> },
  ],
  navAssets: [
    { title: "Fixed Assets", url: "/assets", icon: <Building2Icon /> },
    { title: "Investments", url: "/investments", icon: <TrendingUpIcon /> },
  ],
  navInsights: [
    { title: "Analytics", url: "/analytics", icon: <ChartAreaIcon /> },
    { title: "Budgets", url: "/budgets", icon: <TargetIcon /> },
  ],
  navReports: [
    { title: "Balance Sheet", url: "/reports/balance-sheet", icon: <ScaleIcon /> },
    { title: "Profit & Loss", url: "/reports/profit-loss", icon: <FileSpreadsheetIcon /> },
    { title: "Cash Flow", url: "/reports/cash-flow", icon: <ArrowLeftRightIcon /> },
    { title: "Fixed Assets Valuation", url: "/reports/fixed-assets-valuation", icon: <Building2Icon /> },
    { title: "Non-Fixed Assets Valuation", url: "/reports/non-fixed-assets-valuation", icon: <CoinsIcon /> },
    { title: "Capital G/L", url: "/reports/capital-gains-losses", icon: <TrendingUpIcon /> },
  ],
  navUnallocated: [
    { title: "Cards", url: "/cards", icon: <CreditCardIcon /> },
    { title: "Crypto", url: "/crypto", icon: <BitcoinIcon /> },
  ],
  navAuth: [
    { title: "Sign In", url: "/sign-in", icon: <LogInIcon /> },
    { title: "Sign Up", url: "/sign-up", icon: <UserPlusIcon /> },
  ],
  navSecondary: [
    { title: "Notifications", url: "/notifications", icon: <BellIcon /> },
    { title: "Settings", url: "/settings", icon: <SettingsIcon /> },
    { title: "Help & Support", url: "/support", icon: <LifeBuoyIcon /> },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter()
  const pathname = usePathname()
  const { clientLabelPlural } = usePreferences()

  const activeReports = data.navReports
  const baseEntities = data.navEntities
  const activeEntities = React.useMemo(() => {
    return baseEntities.map((item) => {
      if (item.url === "/clients") {
        return {
          ...item,
          title: clientLabelPlural,
        }
      }
      return item
    })
  }, [baseEntities, clientLabelPlural])
  const activeAssets = data.navAssets

  const isReportsPath = (path: string) => path.includes("/reports")
  const isEntitiesPath = (path: string) => {
    return (
      path.startsWith("/clients") ||
      path.startsWith("/vendors") ||
      path.startsWith("/authorities")
    )
  }
  const isAssetsPath = (path: string) => {
    return (
      path.startsWith("/assets") ||
      path.startsWith("/investments")
    )
  }

  type SidebarView = "main" | "reports" | "entities" | "assets"

  const getInitialView = (): SidebarView => {
    if (isReportsPath(pathname)) return "reports"
    if (isEntitiesPath(pathname)) return "entities"
    if (isAssetsPath(pathname)) return "assets"
    return "main"
  }

  const [activeView, setActiveView] = React.useState<SidebarView>(getInitialView)

  React.useEffect(() => {
    if (isReportsPath(pathname)) {
      setActiveView("reports")
    } else if (isEntitiesPath(pathname)) {
      setActiveView("entities")
    } else if (isAssetsPath(pathname)) {
      setActiveView("assets")
    } else {
      setActiveView("main")
    }
  }, [pathname])

  const handleOpenReports = () => {
    setActiveView("reports")
    if (!pathname.includes("/reports")) {
      router.push("/reports/balance-sheet")
    }
  }

  const handleOpenEntities = () => {
    setActiveView("entities")
    if (!isEntitiesPath(pathname)) {
      router.push("/clients")
    }
  }

  const handleOpenAssets = () => {
    setActiveView("assets")
    if (!isAssetsPath(pathname)) {
      router.push("/assets")
    }
  }

  const handleGoBack = () => {
    setActiveView("main")
    if (isReportsPath(pathname) || isEntitiesPath(pathname) || isAssetsPath(pathname)) {
      router.push("/dashboard")
    }
  }

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="hover:bg-transparent">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <LandmarkIcon className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Morao Artisans</span>
                <span className="truncate text-xs text-muted-foreground">Financial Accounting</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {activeView === "reports" ? (
          <>
            <SidebarGroup>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={handleGoBack}
                    tooltip="Go back"
                    className="cursor-pointer"
                  >
                    <ArrowLeftIcon />
                    <span>Go back</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Statements & Reports</SidebarGroupLabel>
              <SidebarMenu>
                {activeReports.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={pathname === item.url}
                      tooltip={item.title}
                      render={<Link href={item.url} />}
                      className="cursor-pointer"
                    >
                      {item.icon}
                      <span className="truncate whitespace-nowrap">{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          </>
        ) : activeView === "entities" ? (
          <>
            <SidebarGroup>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={handleGoBack}
                    tooltip="Go back"
                    className="cursor-pointer"
                  >
                    <ArrowLeftIcon />
                    <span>Go back</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Entities</SidebarGroupLabel>
              <SidebarMenu>
                {activeEntities.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={pathname === item.url}
                      tooltip={item.title}
                      render={<Link href={item.url} />}
                      className="cursor-pointer"
                    >
                      {item.icon}
                      <span className="truncate whitespace-nowrap">{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          </>
        ) : activeView === "assets" ? (
          <>
            <SidebarGroup>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={handleGoBack}
                    tooltip="Go back"
                    className="cursor-pointer"
                  >
                    <ArrowLeftIcon />
                    <span>Go back</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Assets</SidebarGroupLabel>
              <SidebarMenu>
                {activeAssets.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={pathname === item.url}
                      tooltip={item.title}
                      render={<Link href={item.url} />}
                      className="cursor-pointer"
                    >
                      {item.icon}
                      <span className="truncate whitespace-nowrap">{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          </>
        ) : (
          <>
            {/* Business */}
            <SidebarGroup>
              <SidebarGroupLabel>Business</SidebarGroupLabel>
              <SidebarMenu>
                {/* 1. Overview */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={pathname === "/dashboard"}
                    tooltip="Overview"
                    render={<Link href="/dashboard" />}
                    className="cursor-pointer"
                  >
                    <LayoutDashboardIcon />
                    <span>Overview</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* 2. Accounts */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={pathname === "/accounts"}
                    tooltip="Accounts"
                    render={<Link href="/accounts" />}
                    className="cursor-pointer"
                  >
                    <WalletIcon />
                    <span>Accounts</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* 3. Entities */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    render={
                      <Link
                        href="/clients"
                        onClick={handleOpenEntities}
                      />
                    }
                    tooltip="Entities"
                    isActive={isEntitiesPath(pathname)}
                    className="cursor-pointer"
                  >
                    <UsersIcon />
                    <span className="truncate whitespace-nowrap">Entities</span>
                    <ChevronRightIcon className="ml-auto size-4 shrink-0 opacity-70 group-hover/menu-button:opacity-100 group-hover/menu-button:translate-x-0.5 transition-all" />
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* 4. Transfers */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={pathname === "/transfers"}
                    tooltip="Transfers"
                    render={<Link href="/transfers" />}
                    className="cursor-pointer"
                  >
                    <SendIcon />
                    <span>Transfers</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>

            {/* Money */}
            <SidebarGroup>
              <SidebarGroupLabel>Money</SidebarGroupLabel>
              <SidebarMenu>
                {/* 1. Transactions */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={pathname === "/transactions"}
                    tooltip="Transactions"
                    render={<Link href="/transactions" />}
                    className="cursor-pointer"
                  >
                    <ArrowLeftRightIcon />
                    <span>Transactions</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* 2. Income */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={pathname === "/income"}
                    tooltip="Income"
                    render={<Link href="/income" />}
                    className="cursor-pointer"
                  >
                    <CircleDollarSignIcon />
                    <span>Income</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* 3. Payable */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={pathname === "/payable"}
                    tooltip="Payable"
                    render={<Link href="/payable" />}
                    className="cursor-pointer"
                  >
                    <ArrowUpRightIcon />
                    <span>Payable</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* 4. Expenses */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={pathname === "/expenses"}
                    tooltip="Expenses"
                    render={<Link href="/expenses" />}
                    className="cursor-pointer"
                  >
                    <ReceiptIcon />
                    <span>Expenses</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* 5. Receivable */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={pathname === "/receivable"}
                    tooltip="Receivable"
                    render={<Link href="/receivable" />}
                    className="cursor-pointer"
                  >
                    <ArrowDownLeftIcon />
                    <span>Receivable</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Currencies */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={pathname === "/currencies"}
                    tooltip="Currencies"
                    render={<Link href="/currencies" />}
                    className="cursor-pointer"
                  >
                    <CoinsIcon />
                    <span>Currencies</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* 6. Assets */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    render={
                      <Link
                        href="/assets"
                        onClick={handleOpenAssets}
                      />
                    }
                    tooltip="Assets"
                    isActive={isAssetsPath(pathname)}
                    className="cursor-pointer"
                  >
                    <Building2Icon />
                    <span className="truncate whitespace-nowrap">Assets</span>
                    <ChevronRightIcon className="ml-auto size-4 shrink-0 opacity-70 group-hover/menu-button:opacity-100 group-hover/menu-button:translate-x-0.5 transition-all" />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>

            {/* Insights */}
            <SidebarGroup>
              <SidebarGroupLabel>Insights</SidebarGroupLabel>
              <SidebarMenu>
                {data.navInsights.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={pathname === item.url}
                      tooltip={item.title}
                      render={<Link href={item.url} />}
                      className="cursor-pointer"
                    >
                      {item.icon}
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    render={
                      <Link
                        href="/reports/balance-sheet"
                        onClick={handleOpenReports}
                      />
                    }
                    tooltip="Statements & Reports"
                    isActive={isReportsPath(pathname)}
                    className="cursor-pointer"
                  >
                    <ScaleIcon />
                    <span className="truncate whitespace-nowrap">Statements & Reports</span>
                    <ChevronRightIcon className="ml-auto size-4 shrink-0 opacity-70 group-hover/menu-button:opacity-100 group-hover/menu-button:translate-x-0.5 transition-all" />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>

            {/* Unallocated */}
            <SidebarGroup>
              <SidebarGroupLabel>Unallocated</SidebarGroupLabel>
              <SidebarMenu>
                {data.navUnallocated.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={pathname === item.url}
                      tooltip={item.title}
                      render={<Link href={item.url} />}
                      className="cursor-pointer"
                    >
                      {item.icon}
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>

            <NavMain items={data.navAuth} label="Auth" />
            <NavSecondary items={data.navSecondary} className="mt-auto" />
          </>
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
