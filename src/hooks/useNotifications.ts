import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { notificationService } from "@/services/notificationService"

export function useNotifications() {
  const queryClient = useQueryClient()

  const notificationsQuery = useQuery({
    queryKey: ["notifications"],
    queryFn: notificationService.list,
    refetchInterval: 30_000,
  })

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })

  const notifications = notificationsQuery.data ?? []
  const unreadCount = notifications.filter((n) => !n.read).length

  return {
    notifications,
    unreadCount,
    isLoading: notificationsQuery.isLoading,
    isError: notificationsQuery.isError,
    error: notificationsQuery.error,
    refetch: notificationsQuery.refetch,
    markAsRead: markAsReadMutation.mutateAsync,
    markAsReadMutation,
  }
}
