import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/hooks/queryKeys"
import { employeeService } from "@/services/employeeService"
import type { EmployeeUpdate } from "@/types/api"

export function useEmployees() {
  const employeesQuery = useQuery({
    queryKey: queryKeys.employees.all,
    queryFn: () => employeeService.list(),
  })

  return {
    employees: employeesQuery.data ?? [],
    isLoading: employeesQuery.isLoading,
    isError: employeesQuery.isError,
    error: employeesQuery.error,
    refetch: employeesQuery.refetch,
  }
}

export function useEmployeeProfile(id?: string) {
  const queryClient = useQueryClient()

  const profileQuery = useQuery({
    queryKey: queryKeys.employees.detail(id),
    queryFn: () => employeeService.get(id),
  })

  const updateProfileMutation = useMutation({
    mutationFn: ({ targetId, patch }: { targetId: string; patch: EmployeeUpdate }) =>
      employeeService.update(targetId, patch),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.employees.all })
    },
  })

  return {
    employee: profileQuery.data,
    isLoading: profileQuery.isLoading,
    isError: profileQuery.isError,
    error: profileQuery.error,
    refetch: profileQuery.refetch,
    updateProfile: updateProfileMutation.mutateAsync,
    updateProfileMutation,
  }
}
