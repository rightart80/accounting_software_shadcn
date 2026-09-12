/**
 * Mock current user — edit this object by hand to test different roles/plans.
 * This is NOT connected to any real auth system.
 */
export const currentUser = {
  id: "user-001",
  role: "admin" as "user" | "admin",
  plan: "pro" as "free" | "plus" | "pro" | "ultra",
}

export type CurrentUser = typeof currentUser
