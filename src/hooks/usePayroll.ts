import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { payrollService } from "@/services/payrollService"
import type { PayrollUpdate } from "@/types/api"

export function usePayroll(employeeId?: string) {
  const queryClient = useQueryClient()

  const payrollQuery = useQuery({
    queryKey: ["payroll", employeeId ?? "me"],
    queryFn: () => payrollService.list(employeeId),
  })

  const updatePayrollMutation = useMutation({
    mutationFn: ({ targetEmployeeId, patch }: { targetEmployeeId: string; patch: PayrollUpdate }) =>
      payrollService.update(targetEmployeeId, patch),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["payroll"] })
      void queryClient.invalidateQueries({ queryKey: ["reports"] })
      void queryClient.invalidateQueries({ queryKey: ["notifications"] })
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
