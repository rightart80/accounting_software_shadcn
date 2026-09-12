"use client"

import * as React from "react"
import {
  SearchIcon,
  RotateCcwIcon,
  PlusIcon,
  CheckIcon,
  CopyIcon,
  Trash2Icon,
  FileCodeIcon,
  TablePropertiesIcon,
  SparklesIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { usePreferences } from "@/contexts/preferences-context"
import type { ClientEntityOption } from "@/types/preferences"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"

export function PreferencesTab() {
  const {
    preferences,
    activeProfileId,
    profiles,
    clientLabelSingular,
    clientLabelPlural,
    selectProfile,
    saveAsNewProfile,
    deleteProfile,
    updateEntityNaming,
    updateDisplay,
    resetToDefaults,
  } = usePreferences()

  const [searchQuery, setSearchQuery] = React.useState("")
  const [viewMode, setViewMode] = React.useState<"table" | "json">("table")
  const [newProfileName, setNewProfileName] = React.useState("")
  const [newProfileDesc, setNewProfileDesc] = React.useState("")
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  const activeProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0]

  const handleSaveProfile = () => {
    if (!newProfileName.trim()) return
    saveAsNewProfile(newProfileName, newProfileDesc || undefined)
    setNewProfileName("")
    setNewProfileDesc("")
    setDialogOpen(false)
  }

  // VS Code formatted JSON representation
  const vscodeSettings = React.useMemo(() => {
    return {
      "workbench.profile.id": activeProfileId,
      "workbench.profile.name": activeProfile?.name,
      "entities.clients.naming": preferences.entityNaming.clientOption,
      "entities.clients.customSingular": preferences.entityNaming.customSingular,
      "entities.clients.customPlural": preferences.entityNaming.customPlural,
      "workbench.table.compactMode": preferences.display.compactMode,
      "workbench.kpi.showTrends": preferences.display.showKpiTrends,
      "localization.currency.symbol": preferences.display.currencySymbol,
    }
  }, [preferences, activeProfileId, activeProfile])

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(vscodeSettings, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // All settings definitions for the table
  const settingsList = [
    {
      key: "entities.clients.naming",
      name: "Clients Entity Terminology",
      category: "Entities",
      type: "enum",
      description: "Entity tab name & terminology used across sidebar navigation, summary KPIs, and action buttons.",
      isModified: preferences.entityNaming.clientOption !== "client",
      control: (
        <Select
          value={preferences.entityNaming.clientOption}
          onValueChange={(val) =>
            val && updateEntityNaming({ clientOption: val as ClientEntityOption })
          }
        >
          <SelectTrigger className="h-7 w-40 text-xs font-mono">
            <SelectValue placeholder="Select name" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="client">client (Clients)</SelectItem>
            <SelectItem value="purchaser">purchaser (Purchasers)</SelectItem>
            <SelectItem value="buyer">buyer (Buyers)</SelectItem>
            <SelectItem value="customer">customer (Customers)</SelectItem>
            <SelectItem value="custom">custom (Custom...)</SelectItem>
          </SelectContent>
        </Select>
      ),
      onReset: () => updateEntityNaming({ clientOption: "client" }),
    },
    {
      key: "entities.clients.customSingular",
      name: "Clients Singular Label",
      category: "Entities",
      type: "string",
      description: "Custom singular noun applied when entities.clients.naming is set to 'custom' (e.g. Patient, Tenant, Member).",
      isModified:
        preferences.entityNaming.clientOption === "custom" &&
        preferences.entityNaming.customSingular !== "Client",
      control: (
        <Input
          size={undefined}
          disabled={preferences.entityNaming.clientOption !== "custom"}
          value={preferences.entityNaming.customSingular}
          onChange={(e) => updateEntityNaming({ customSingular: e.target.value })}
          placeholder="Client"
          className="h-7 w-40 text-xs font-mono disabled:opacity-40"
        />
      ),
      onReset: () => updateEntityNaming({ customSingular: "Client" }),
    },
    {
      key: "entities.clients.customPlural",
      name: "Clients Plural Label",
      category: "Entities",
      type: "string",
      description: "Custom plural noun applied when entities.clients.naming is set to 'custom' (e.g. Patients, Tenants, Members).",
      isModified:
        preferences.entityNaming.clientOption === "custom" &&
        preferences.entityNaming.customPlural !== "Clients",
      control: (
        <Input
          size={undefined}
          disabled={preferences.entityNaming.clientOption !== "custom"}
          value={preferences.entityNaming.customPlural}
          onChange={(e) => updateEntityNaming({ customPlural: e.target.value })}
          placeholder="Clients"
          className="h-7 w-40 text-xs font-mono disabled:opacity-40"
        />
      ),
      onReset: () => updateEntityNaming({ customPlural: "Clients" }),
    },
    {
      key: "workbench.table.compactMode",
      name: "Compact Table Density",
      category: "Display",
      type: "boolean",
      description: "Render tables with compact row height and condensed spacing for maximum data visibility.",
      isModified: preferences.display.compactMode !== false,
      control: (
        <Switch
          checked={preferences.display.compactMode}
          onCheckedChange={(checked) => updateDisplay({ compactMode: checked })}
        />
      ),
      onReset: () => updateDisplay({ compactMode: false }),
    },
    {
      key: "workbench.kpi.showTrends",
      name: "Show KPI Growth Trends",
      category: "Display",
      type: "boolean",
      description: "Display percentage gains/losses and direction indicators on metric summary cards.",
      isModified: preferences.display.showKpiTrends !== true,
      control: (
        <Switch
          checked={preferences.display.showKpiTrends}
          onCheckedChange={(checked) => updateDisplay({ showKpiTrends: checked })}
        />
      ),
      onReset: () => updateDisplay({ showKpiTrends: true }),
    },
    {
      key: "localization.currency.symbol",
      name: "Default Currency Symbol",
      category: "Localization",
      type: "enum",
      description: "Primary currency symbol formatted on amounts across cards, tables, and financial reports.",
      isModified: preferences.display.currencySymbol !== "$",
      control: (
        <Select
          value={preferences.display.currencySymbol}
          onValueChange={(val) => val && updateDisplay({ currencySymbol: val })}
        >
          <SelectTrigger className="h-7 w-28 text-xs font-mono">
            <SelectValue placeholder="Symbol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="$">$ (USD)</SelectItem>
            <SelectItem value="€">€ (EUR)</SelectItem>
            <SelectItem value="£">£ (GBP)</SelectItem>
            <SelectItem value="¥">¥ (JPY)</SelectItem>
          </SelectContent>
        </Select>
      ),
      onReset: () => updateDisplay({ currencySymbol: "$" }),
    },
  ]

  const filteredSettings = settingsList.filter((s) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      s.key.toLowerCase().includes(q) ||
      s.name.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q)
    )
  })

  const modifiedCount = settingsList.filter((s) => s.isModified).length

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-xs font-sans">
      {/* ── VS Code Style Header Toolbar ── */}
      <div className="border-b bg-muted/30 px-3 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        {/* Left: Search input */}
        <div className="relative flex-1 max-w-md">
          <SearchIcon className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search preferences (e.g. entities.clients, currency, table)..."
            className="h-7 pl-7 text-xs font-mono bg-background"
          />
        </div>

        {/* Right: Profile Selector & Action Controls */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Profile Switcher */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-muted-foreground font-mono hidden md:inline">
              Profile:
            </span>
            <Select
              value={activeProfileId}
              onValueChange={(val) => val && selectProfile(val)}
            >
              <SelectTrigger className="h-7 min-w-44 text-xs font-medium bg-background">
                <SelectValue placeholder="Profile" />
              </SelectTrigger>
              <SelectContent>
                {profiles.map((prof) => (
                  <SelectItem key={prof.id} value={prof.id}>
                    {prof.name} {prof.isBuiltIn ? "" : "(Custom)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Save Profile Dialog */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger
              render={
                <Button
                  size="xs"
                  variant="outline"
                  className="h-7 gap-1 text-[11px]"
                  title="Save current preferences as a new profile"
                />
              }
            >
              <PlusIcon className="size-3" />
              Save Profile
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Save Preference Profile</DialogTitle>
                <DialogDescription>
                  Save the current preference configuration as a new profile so other users can load it.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 py-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Profile Name</label>
                  <Input
                    placeholder="e.g. Retail Store, Procurement B2B, Clinic"
                    value={newProfileName}
                    onChange={(e) => setNewProfileName(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Description (optional)
                  </label>
                  <Input
                    placeholder="Brief description for this profile"
                    value={newProfileDesc}
                    onChange={(e) => setNewProfileDesc(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <DialogFooter>
                <DialogClose render={<Button variant="outline" size="sm" />}>
                  Cancel
                </DialogClose>
                <Button size="sm" onClick={handleSaveProfile} disabled={!newProfileName.trim()}>
                  Save Profile
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete custom profile if applicable */}
          {!activeProfile?.isBuiltIn && (
            <Button
              size="xs"
              variant="ghost"
              className="h-7 text-destructive hover:bg-destructive/10"
              onClick={() => deleteProfile(activeProfileId)}
              title="Delete active custom profile"
            >
              <Trash2Icon className="size-3" />
            </Button>
          )}

          {/* Reset button */}
          <Button
            size="xs"
            variant="ghost"
            className="h-7 text-muted-foreground hover:text-foreground gap-1 text-[11px]"
            onClick={resetToDefaults}
            title="Reset preferences to defaults"
          >
            <RotateCcwIcon className="size-3" />
            Reset
          </Button>

          {/* View toggle (Table vs JSON) like VS Code */}
          <div className="flex items-center border rounded-md overflow-hidden bg-background">
            <Button
              size="xs"
              variant={viewMode === "table" ? "secondary" : "ghost"}
              className="h-7 px-2 rounded-none"
              onClick={() => setViewMode("table")}
              title="Table view"
            >
              <TablePropertiesIcon className="size-3" />
            </Button>
            <Button
              size="xs"
              variant={viewMode === "json" ? "secondary" : "ghost"}
              className="h-7 px-2 rounded-none"
              onClick={() => setViewMode("json")}
              title="Open settings.json"
            >
              <FileCodeIcon className="size-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* ── Table View ── */}
      {viewMode === "table" ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/15">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-1/3 text-xs font-semibold py-2">Setting</TableHead>
                <TableHead className="w-24 text-xs font-semibold py-2">Category</TableHead>
                <TableHead className="w-20 text-xs font-semibold py-2">Type</TableHead>
                <TableHead className="text-xs font-semibold py-2">Value</TableHead>
                <TableHead className="w-12 text-xs font-semibold py-2 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSettings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-xs text-muted-foreground">
                    No preferences matching &quot;{searchQuery}&quot;
                  </TableCell>
                </TableRow>
              ) : (
                filteredSettings.map((item) => (
                  <TableRow
                    key={item.key}
                    className={cn(
                      "group text-xs transition-colors hover:bg-muted/30 relative",
                      item.isModified && "bg-primary/[0.02]"
                    )}
                  >
                    {/* Setting Key + Title + Description */}
                    <TableCell className="py-2.5 align-top">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <code className="text-[11px] font-mono font-medium text-primary bg-primary/10 px-1 py-0.5 rounded">
                            {item.key}
                          </code>
                          <span className="font-semibold text-foreground text-xs">
                            {item.name}
                          </span>
                          {item.isModified && (
                            <span className="inline-block size-1.5 rounded-full bg-primary" title="Modified from default" />
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </TableCell>

                    {/* Category */}
                    <TableCell className="py-2.5 align-middle">
                      <Badge variant="outline" className="text-[10px] font-mono py-0 h-5">
                        {item.category}
                      </Badge>
                    </TableCell>

                    {/* Type */}
                    <TableCell className="py-2.5 align-middle">
                      <span className="text-[11px] font-mono text-muted-foreground">
                        {item.type}
                      </span>
                    </TableCell>

                    {/* Control Value */}
                    <TableCell className="py-2.5 align-middle">
                      <div className="flex items-center gap-2">
                        {item.control}
                      </div>
                    </TableCell>

                    {/* Action (Reset individual setting) */}
                    <TableCell className="py-2.5 align-middle text-right">
                      {item.isModified && (
                        <Button
                          size="icon-xs"
                          variant="ghost"
                          onClick={item.onReset}
                          className="size-6 text-muted-foreground hover:text-foreground opacity-60 hover:opacity-100"
                          title="Reset setting to default"
                        >
                          <RotateCcwIcon className="size-2.5" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        /* ── VS Code JSON View (settings.json) ── */
        <div className="p-3 bg-muted/20">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-border text-xs text-muted-foreground">
            <span className="font-mono text-[11px] flex items-center gap-1.5">
              <FileCodeIcon className="size-3.5 text-primary" />
              settings.json ({activeProfile.name})
            </span>
            <Button
              size="xs"
              variant="outline"
              className="h-6 gap-1 text-[11px]"
              onClick={handleCopyJson}
            >
              {copied ? <CheckIcon className="size-3 text-emerald-500" /> : <CopyIcon className="size-3" />}
              {copied ? "Copied" : "Copy JSON"}
            </Button>
          </div>
          <pre className="p-3 rounded-md bg-muted/40 border font-mono text-xs overflow-x-auto text-foreground/90 leading-relaxed">
            {JSON.stringify(vscodeSettings, null, 2)}
          </pre>
        </div>
      )}

      {/* ── VS Code Style Status Bar Strip ── */}
      <div className="border-t bg-muted/40 px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground font-mono">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Profile: <strong className="text-foreground font-semibold">{activeProfile?.name}</strong>
          </span>
          <span>
            Modified: <strong className="text-foreground">{modifiedCount}</strong> / {settingsList.length}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <SparklesIcon className="size-3 text-primary" />
          <span>Active Entity:</span>
          <code className="text-primary font-semibold px-1 rounded bg-primary/10">
            {clientLabelPlural} ({clientLabelSingular})
          </code>
        </div>
      </div>
    </div>
  )
}
