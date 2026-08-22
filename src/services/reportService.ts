import { api } from "@/lib/axios"
import { mockApi } from "@/mocks/mockApi"
import { USE_MOCKS } from "@/services/config"
import type {
  AttendanceReportRow,
  DashboardStats,
  PayrollReport,
} from "@/types/api"

export const reportService = {
  async dashboardStats(): Promise<DashboardStats> {
    if (USE_MOCKS) return mockApi.dashboardStats()
    const res = await api.get<DashboardStats>("/reports/dashboard-stats")
    return res.data
  },

  async attendanceReport(days = 14): Promise<AttendanceReportRow[]> {
    if (USE_MOCKS) return mockApi.attendanceReport(days)
    const res = await api.get<AttendanceReportRow[]>("/reports/attendance", {
      params: { days },
    })
    return res.data
  },

  async payrollReport(): Promise<PayrollReport> {
    if (USE_MOCKS) return mockApi.payrollReport()
    const res = await api.get<PayrollReport>("/reports/payroll")
    return res.data
  },
}
