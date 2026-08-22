import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/hooks/queryKeys"
import { attendanceService } from "@/services/attendanceService"
import type { AttendanceQuery } from "@/types/api"

export function useAttendance(query: AttendanceQuery = {}) {
  const queryClient = useQueryClient()

  const attendanceQuery = useQuery({
    queryKey: queryKeys.attendance.list(query),
    queryFn: () => attendanceService.list(query),
    refetchInterval: 30_000,
  })

  const checkInMutation = useMutation({
    mutationFn: attendanceService.checkIn,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.attendance.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.reports.all })
    },
  })

  const checkOutMutation = useMutation({
    mutationFn: attendanceService.checkOut,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.attendance.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.reports.all })
    },
  })

  return {
    records: attendanceQuery.data ?? [],
    attendanceRecords: attendanceQuery.data ?? [],
    isLoading: attendanceQuery.isLoading,
    isError: attendanceQuery.isError,
    error: attendanceQuery.error,
    refetch: attendanceQuery.refetch,
    checkIn: checkInMutation.mutateAsync,
    checkOut: checkOutMutation.mutateAsync,
    checkInMutation,
    checkOutMutation,
  }
}
