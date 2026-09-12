/**
 * lib/permissions.ts
 *
 * Single, permanent home for every access-control rule in the app.
 * All current and future permission checks go here — never inline elsewhere.
 *
 * Rules:
 *  - Each restricted feature gets its own named function.
 *  - Never reuse or rename an existing function to cover a second feature.
 *  - All functions accept a CurrentUser and return a boolean.
 */

import type { CurrentUser } from "@/lib/mock-user"

const PLAN_RANK: Record<CurrentUser["plan"], number> = {
  free: 0,
  plus: 1,
  pro: 2,
  ultra: 3,
}

/** Returns true if the user has the "admin" role. */
export function isAdmin(user: CurrentUser): boolean {
  return user.role === "admin"
}

/**
 * Returns true if the user's plan meets or exceeds the required minimum plan.
 * Plan order: free < plus < pro < ultra
 */
export function hasPlan(
  user: CurrentUser,
  minimumPlan: CurrentUser["plan"]
): boolean {
  return PLAN_RANK[user.plan] >= PLAN_RANK[minimumPlan]
}

/**
 * Bulk-approve transactions: requires admin role AND at least a "pro" plan.
 * Add future bulk-approve variants as separate functions — do not reuse this one.
 */
export function canBulkApproveTransactions(user: CurrentUser): boolean {
  return isAdmin(user) && hasPlan(user, "pro")
}
