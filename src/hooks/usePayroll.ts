import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/hooks/queryKeys"
import { payrollService } from "@/services/payrollService"
import type { PayrollUpdate } from "@/types/api"

export function usePayroll(employeeId?: string) {
  const queryClient = useQueryClient()

  const payrollQuery = useQuery({
    queryKey: queryKeys.payroll.detail(employeeId),
    queryFn: () => payrollService.list(employeeId),
  })

  const updatePayrollMutation = useMutation({
    mutationFn: ({ targetEmployeeId, patch }: { targetEmployeeId: string; patch: PayrollUpdate }) =>
      payrollService.update(targetEmployeeId, patch),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.payroll.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.reports.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all })
    },
  })

  return {
    payslips: payrollQuery.data ?? [],
    payrollRecords: payrollQuery.data ?? [],
    latestPayslip: payrollQuery.data?.[0],
    isLoading: payrollQuery.isLoading,
    isError: payrollQuery.isError,
    error: payrollQuery.error,
    refetch: payrollQuery.refetch,
    updatePayroll: updatePayrollMutation.mutateAsync,
    updatePayrollMutation,
  }
}
