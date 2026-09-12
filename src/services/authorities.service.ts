import { authoritiesData } from "@/data/seed"
import type { Authority } from "@/types/authorities"

export function getAuthorities(): Authority[] {
  return authoritiesData
}

export function getAuthorityById(id: string): Authority | undefined {
  return authoritiesData.find((auth) => auth.id === id)
}
