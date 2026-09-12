"use client"

import { useMemo, useState } from "react"
import { SearchIcon } from "lucide-react"

import type { Client, ClientType, ClientTier } from "@/types/clients"
import { getClients } from "@/services/clients.service"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { ClientSummary } from "@/components/clients/client-summary"
import { ClientGrid } from "@/components/clients/client-grid"
import { AddClient } from "@/components/clients/add-client"
import { EmptyState } from "@/components/empty-state"
import { usePreferences } from "@/contexts/preferences-context"

const baseFilterTabs = [
  { value: "all", label: "All" },
  { value: "Enterprise", label: "Enterprise" },
  { value: "Retainer", label: "Retainers" },
  { value: "Contract", label: "Contracts" },
  { value: "SMB", label: "SMB" },
  { value: "Startup", label: "Startups" },
] as const

const filterTierTabs = [
  { value: "all", label: "All Tiers" },
  { value: "tier-1", label: "Tier 1 (High Value)" },
  { value: "tier-2", label: "Tier 2 (Growth)" },
  { value: "tier-3", label: "Tier 3 (Standard)" },
] as const

type FilterType = (typeof baseFilterTabs)[number]["value"]
type FilterTier = (typeof filterTierTabs)[number]["value"]

export function ClientsPageClient() {
  const { clientLabelSingular, clientLabelPlural } = usePreferences()
  const [search, setSearch] = useState("")
  const [selectedType, setSelectedType] = useState<FilterType>("all")
  const [selectedTier, setSelectedTier] = useState<FilterTier>("all")
  const [clients, setClients] = useState<Client[]>(getClients())

  const filterTabs: { value: FilterType; label: string }[] = useMemo(() => [
    { value: "all", label: `All ${clientLabelPlural}` },
    { value: "Enterprise", label: "Enterprise" },
    { value: "Retainer", label: "Retainers" },
    { value: "Contract", label: "Contracts" },
    { value: "SMB", label: "SMB" },
    { value: "Startup", label: "Startups" },
  ], [clientLabelPlural])

  const filtered = useMemo(() => {
    return clients.filter((client) => {
      const matchesSearch =
        search === "" ||
        client.company.toLowerCase().includes(search.toLowerCase()) ||
        client.name.toLowerCase().includes(search.toLowerCase()) ||
        client.clientNumber.toLowerCase().includes(search.toLowerCase())

      const matchesType =
        selectedType === "all" || client.type === selectedType

      const matchesTier =
        selectedTier === "all" || client.tier === selectedTier

      return matchesSearch && matchesType && matchesTier
    })
  }, [clients, search, selectedType, selectedTier])

  function handleAddClient(client: Client) {
    setClients((prev) => [...prev, client])
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Summary KPI row */}
      <ClientSummary clients={clients} />

      {/* Search and filters row */}
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center justify-between">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={`Search ${clientLabelPlural.toLowerCase()}, company, ID...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>

        {/* Filter type tabs */}
        <div className="flex flex-wrap gap-1.5 type">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setSelectedType(tab.value)
                if (tab.value !== "Enterprise") setSelectedTier("all")
              }}
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

      {/* Filter tier tabs — only shown when Enterprise is selected */}
      {selectedType === "Enterprise" && (
        <div className="flex flex-wrap gap-1.5 tier-filter">
          {filterTierTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setSelectedTier(tab.value)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                selectedTier === tab.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Client grid + add client card */}
      {filtered.length === 0 ? (
        <EmptyState
          variant="filter"
          title={`No ${clientLabelPlural.toLowerCase()} found`}
          description={`We couldn't find any ${clientLabelPlural.toLowerCase()} matching your criteria. Try adjusting the filters or onboard a new ${clientLabelSingular.toLowerCase()}.`}
        />
      ) : (
        <ClientGrid
          clients={filtered}
          cardsPerPage={6}
          trailingSlot={<AddClient onAdd={handleAddClient} />}
        />
      )}
    </div>
  )
}
