export type ClientEntityOption =
  | "client"
  | "purchaser"
  | "buyer"
  | "customer"
  | "custom"

export interface EntityNamingPreferences {
  clientOption: ClientEntityOption
  customSingular: string
  customPlural: string
}

export interface DisplayPreferences {
  compactMode: boolean
  currencySymbol: string
  showKpiTrends: boolean
}

export interface UserPreferences {
  entityNaming: EntityNamingPreferences
  display: DisplayPreferences
}

export interface PreferenceProfile {
  id: string
  name: string
  description: string
  isBuiltIn: boolean
  preferences: UserPreferences
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  entityNaming: {
    clientOption: "client",
    customSingular: "Client",
    customPlural: "Clients",
  },
  display: {
    compactMode: false,
    currencySymbol: "$",
    showKpiTrends: true,
  },
}

export const BUILTIN_PROFILES: PreferenceProfile[] = [
  {
    id: "standard-accounting",
    name: "Standard Accounting (Clients)",
    description: "Classic invoicing and accounting setup with Clients, Invoices, and Retainers.",
    isBuiltIn: true,
    preferences: {
      ...DEFAULT_PREFERENCES,
      entityNaming: {
        clientOption: "client",
        customSingular: "Client",
        customPlural: "Clients",
      },
    },
  },
  {
    id: "procurement-purchasers",
    name: "Supply Chain & Procurement (Purchasers)",
    description: "Configured for B2B wholesale, manufacturing, and distribution with Purchasers.",
    isBuiltIn: true,
    preferences: {
      ...DEFAULT_PREFERENCES,
      entityNaming: {
        clientOption: "purchaser",
        customSingular: "Purchaser",
        customPlural: "Purchasers",
      },
    },
  },
  {
    id: "retail-buyers",
    name: "E-Commerce & Retail (Buyers)",
    description: "Tailored for digital storefronts, retail transactions, and merchant Buyers.",
    isBuiltIn: true,
    preferences: {
      ...DEFAULT_PREFERENCES,
      entityNaming: {
        clientOption: "buyer",
        customSingular: "Buyer",
        customPlural: "Buyers",
      },
    },
  },
  {
    id: "saas-customers",
    name: "SaaS & Subscriptions (Customers)",
    description: "Configured for software platforms, recurring subscriptions, and Customers.",
    isBuiltIn: true,
    preferences: {
      ...DEFAULT_PREFERENCES,
      entityNaming: {
        clientOption: "customer",
        customSingular: "Customer",
        customPlural: "Customers",
      },
    },
  },
]

export function getClientLabels(entityNaming: EntityNamingPreferences): {
  singular: string
  plural: string
} {
  switch (entityNaming.clientOption) {
    case "purchaser":
      return { singular: "Purchaser", plural: "Purchasers" }
    case "buyer":
      return { singular: "Buyer", plural: "Buyers" }
    case "customer":
      return { singular: "Customer", plural: "Customers" }
    case "custom":
      return {
        singular: entityNaming.customSingular.trim() || "Client",
        plural: entityNaming.customPlural.trim() || "Clients",
      }
    case "client":
    default:
      return { singular: "Client", plural: "Clients" }
  }
}
