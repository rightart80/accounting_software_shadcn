"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { getClients, getVendors } from "@/services/clients.service"
import type { Client } from "@/types/clients"

interface EntitySearchSelectProps {
  type: "client" | "vendor"
  value?: string
  onChange: (entity: Client | null) => void
}

export function EntitySearchSelect({ type, value, onChange }: EntitySearchSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const [entities, setEntities] = React.useState<Client[]>([])
  
  React.useEffect(() => {
    // Load entities based on type
    if (type === "client") {
      setEntities(getClients())
    } else {
      // If we don't have explicit vendors in seed data yet, we fallback to returning clients for now 
      // so it functions, but normally it would use getVendors()
      const vendors = getVendors()
      setEntities(vendors.length > 0 ? vendors : getClients())
    }
  }, [type])

  const selectedEntity = React.useMemo(() => {
    return entities.find(e => e.id === value) || null
  }, [value, entities])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="w-full">
        <div
          role="combobox"
          aria-expanded={open}
          className="flex items-center justify-between w-full h-8 px-3 text-xs font-normal border rounded-md shadow-sm border-input bg-transparent hover:bg-accent hover:text-accent-foreground"
        >
          <span className="truncate">
            {selectedEntity ? selectedEntity.name : `Select ${type}...`}
          </span>
          <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput 
            placeholder={`Search ${type}...`} 
            value={search}
            onValueChange={setSearch}
            className="h-8 text-xs" 
          />
          <CommandList>
            <CommandEmpty>No {type} found.</CommandEmpty>
            <CommandGroup>
              {entities
                .filter(e => e.name.toLowerCase().includes(search.toLowerCase()) || 
                             e.company.toLowerCase().includes(search.toLowerCase()))
                .slice(0, 50) // Limit results for performance
                .map((entity) => (
                <CommandItem
                  key={entity.id}
                  value={entity.name}
                  onSelect={() => {
                    onChange(entity)
                    setOpen(false)
                    setSearch("")
                  }}
                  className="text-xs"
                >
                  <Check
                    className={cn(
                      "mr-2 h-3.5 w-3.5",
                      value === entity.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{entity.name}</span>
                    <span className="text-[10px] text-muted-foreground">{entity.company}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
