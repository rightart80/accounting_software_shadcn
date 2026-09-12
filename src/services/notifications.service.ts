import { notifications } from "@/data/seed"
import type { Notification } from "@/types/notifications"

export function getNotifications(): Notification[] {
  return notifications
}
