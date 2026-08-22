import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { employeeService } from "@/services/employeeService"
import type { EmployeeUpdate } from "@/types/api"

export function useEmployees() {
  const employeesQuery = useQuery({
    queryKey: ["employees"],
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
    queryKey: ["employees", id ?? "me"],
    queryFn: () => employeeService.get(id),
  })

  const updateProfileMutation = useMutation({
    mutationFn: ({ targetId, patch }: { targetId: string; patch: EmployeeUpdate }) =>
      employeeService.update(targetId, patch),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["employees"] })
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
