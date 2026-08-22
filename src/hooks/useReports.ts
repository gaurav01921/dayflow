import { useQuery } from "@tanstack/react-query"

import { reportService } from "@/services/reportService"

export function useDashboardStats() {
  const query = useQuery({
    queryKey: ["reports", "dashboard-stats"],
    queryFn: () => reportService.dashboardStats(),
  })

  return {
    stats: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

export function useAttendanceReport(days = 14) {
  const query = useQuery({
    queryKey: ["reports", "attendance", days],
    queryFn: () => reportService.attendanceReport(days),
  })

  return {
    report: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

export function usePayrollReport() {
  const query = useQuery({
    queryKey: ["reports", "payroll"],
    queryFn: () => reportService.payrollReport(),
  })

  return {
    report: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}
