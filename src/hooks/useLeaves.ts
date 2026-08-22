import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { leaveService, type ListLeavesParams } from "@/services/leaveService"
import type { LeaveCreateInput, LeaveReviewInput } from "@/types/api"

export function useLeaves(params: ListLeavesParams = {}) {
  const queryClient = useQueryClient()

  const leavesQuery = useQuery({
    queryKey: ["leaves", params],
    queryFn: () => leaveService.list(params),
  })

  const createLeaveMutation = useMutation({
    mutationFn: (input: LeaveCreateInput) => leaveService.create(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["leaves"] })
      void queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })

  const reviewLeaveMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: LeaveReviewInput }) =>
      leaveService.review(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["leaves"] })
      void queryClient.invalidateQueries({ queryKey: ["attendance"] })
      void queryClient.invalidateQueries({ queryKey: ["reports"] })
      void queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })

  return {
    leaves: leavesQuery.data ?? [],
    isLoading: leavesQuery.isLoading,
    isError: leavesQuery.isError,
    error: leavesQuery.error,
    refetch: leavesQuery.refetch,
    applyLeave: createLeaveMutation.mutateAsync,
    createLeave: createLeaveMutation.mutateAsync,
    reviewLeave: reviewLeaveMutation.mutateAsync,
    createLeaveMutation,
    reviewLeaveMutation,
  }
}
