import { clientsData } from "@/data/seed"
import type { Client } from "@/types/clients"

export function getClients(): Client[] {
  return clientsData
}

export function getClientById(id: string): Client | undefined {
  return clientsData.find((client) => client.id === id)
}

export function getVendors(): Client[] {
  return clientsData.filter((client) => client.role === "vendor" || client.role === "both")
}
