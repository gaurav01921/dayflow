import { api } from "@/lib/axios"
import { mockApi } from "@/mocks/mockApi"
import { USE_MOCKS } from "@/services/config"
import type { NotificationItem } from "@/types/api"

export const notificationService = {
  async list(): Promise<NotificationItem[]> {
    if (USE_MOCKS) return mockApi.listNotifications()
    const res = await api.get<NotificationItem[]>("/notifications")
    return res.data
  },
}
