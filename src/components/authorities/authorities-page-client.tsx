"use client"

import { useMemo, useState } from "react"
import { SearchIcon } from "lucide-react"

import type { Authority, AuthorityType, ComplianceStatus } from "@/types/authorities"
import { getAuthorities } from "@/services/authorities.service"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { AuthoritySummary } from "@/components/authorities/authority-summary"
import { AuthorityGrid } from "@/components/authorities/authority-grid"
import { AddAuthority } from "@/components/authorities/add-authority"
import { EmptyState } from "@/components/empty-state"

const filterTabs = [
  { value: "all", label: "All Authorities" },
  { value: "Federal Tax", label: "Federal Tax" },
  { value: "State Tax", label: "State Tax" },
  { value: "Regulatory", label: "Regulatory" },
  { value: "Labor & Social", label: "Labor & Social" },
  { value: "Municipal", label: "Municipal" },
] as const

type FilterType = (typeof filterTabs)[number]["value"]

export function AuthoritiesPageClient() {
  const [search, setSearch] = useState("")
  const [selectedType, setSelectedType] = useState<FilterType>("all")
  const [authorities, setAuthorities] = useState<Authority[]>(getAuthorities())

  const filtered = useMemo(() => {
    return authorities.filter((auth) => {
      const matchesSearch =
        search === "" ||
        auth.name.toLowerCase().includes(search.toLowerCase()) ||
        auth.shortCode.toLowerCase().includes(search.toLowerCase()) ||
        auth.jurisdiction.toLowerCase().includes(search.toLowerCase()) ||
        auth.accountNumber.toLowerCase().includes(search.toLowerCase())

      const matchesType =
        selectedType === "all" || auth.type === selectedType

      return matchesSearch && matchesType
    })
  }, [authorities, search, selectedType])

  function handleAddAuthority(authority: Authority) {
    setAuthorities((prev) => [...prev, authority])
  }

  return (
    <div className="flex flex-col gap-4">
      {/* KPI Overview */}
      <AuthoritySummary authorities={authorities} />

      {/* Search and Category filters */}
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search agencies, code, EIN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setSelectedType(tab.value)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                selectedType === tab.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of authority cards */}
      {filtered.length === 0 ? (
        <EmptyState
          variant="filter"
          title="No regulatory authorities found"
          description="We couldn't find any authorities matching your criteria. Try adjusting the search filters or link a new agency."
        />
      ) : (
        <AuthorityGrid
          authorities={filtered}
          cardsPerPage={6}
          trailingSlot={<AddAuthority onAdd={handleAddAuthority} />}
        />
      )}
    </div>
  )
}
