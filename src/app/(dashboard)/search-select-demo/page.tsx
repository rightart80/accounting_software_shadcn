"use client"
import * as React from "react"
import { EntitySearchSelect } from "@/components/shared/entity-search-select"
import { Client } from "@/types/clients"

export default function SearchSelectDemo() {
  const [selectedClient, setSelectedClient] = React.useState<Client | null>(null)
  const [selectedVendor, setSelectedVendor] = React.useState<Client | null>(null)

  return (
    <div className="p-8 max-w-md mx-auto space-y-8">
      <h1 className="text-xl font-bold">Search Select Component Demo</h1>
      
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Client Search</label>
          <EntitySearchSelect 
            type="client" 
            value={selectedClient?.id} 
            onChange={setSelectedClient} 
          />
          {selectedClient && (
            <div className="mt-2 text-xs p-2 bg-muted rounded">
              Selected: {selectedClient.name} ({selectedClient.company}) - ID: {selectedClient.id}
            </div>
          )}
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Vendor Search</label>
          <EntitySearchSelect 
            type="vendor" 
            value={selectedVendor?.id} 
            onChange={setSelectedVendor} 
          />
          {selectedVendor && (
            <div className="mt-2 text-xs p-2 bg-muted rounded">
              Selected: {selectedVendor.name} ({selectedVendor.company}) - ID: {selectedVendor.id}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
