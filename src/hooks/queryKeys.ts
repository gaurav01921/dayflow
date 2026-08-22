import type { AttendanceQuery } from "@/types/api"
import type { ListLeavesParams } from "@/services/leaveService"

export const queryKeys = {
  employees: {
    all: ["employees"] as const,
    detail: (id?: string) => ["employees", id ?? "me"] as const,
  },
  attendance: {
    all: ["attendance"] as const,
    list: (query: AttendanceQuery = {}) => ["attendance", query] as const,
  },
  leaves: {
    all: ["leaves"] as const,
    list: (params: ListLeavesParams = {}) => ["leaves", params] as const,
  },
  payroll: {
    all: ["payroll"] as const,
    detail: (employeeId?: string) => ["payroll", employeeId ?? "me"] as const,
  },
  notifications: {
    all: ["notifications"] as const,
  },
  reports: {
    all: ["reports"] as const,
    dashboardStats: ["reports", "dashboard-stats"] as const,
    attendance: (days = 14) => ["reports", "attendance", days] as const,
    payroll: ["reports", "payroll"] as const,
  },
}
