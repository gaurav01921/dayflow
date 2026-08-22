import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { attendanceService } from "@/services/attendanceService"
import type { AttendanceQuery } from "@/types/api"

export function useAttendance(query: AttendanceQuery = {}) {
  const queryClient = useQueryClient()

  const attendanceQuery = useQuery({
    queryKey: ["attendance", query],
    queryFn: () => attendanceService.list(query),
    refetchInterval: 30_000,
  })

  const checkInMutation = useMutation({
    mutationFn: attendanceService.checkIn,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["attendance"] })
      void queryClient.invalidateQueries({ queryKey: ["reports"] })
    },
  })

  const checkOutMutation = useMutation({
    mutationFn: attendanceService.checkOut,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["attendance"] })
      void queryClient.invalidateQueries({ queryKey: ["reports"] })
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
