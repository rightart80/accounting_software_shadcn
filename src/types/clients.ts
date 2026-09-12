export type ClientType =
  | "Enterprise"
  | "Retainer"
  | "Contract"
  | "SMB"
  | "Startup"

export type ClientTier = "tier-1" | "tier-2" | "tier-3"

export type ClientStatus = "active" | "pending" | "inactive"

export type Client = {
  id: string
  name: string
  company: string
  type: ClientType
  tier?: ClientTier
  industry?: string
  clientLogo: string
  clientNumber: string
  email: string
  totalRevenue: number
  currency: string
  change: number
  changePercent: number
  lastActivity: string
  status: ClientStatus
  activeProjects: number
  color: string
  role?: "client" | "vendor" | "both"
}
