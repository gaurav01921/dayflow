import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { toUserMessage } from "@/lib/api-error"
import { formatDate } from "@/lib/utils"
import { leaveService } from "@/services/leaveService"
import type { LeaveRequest } from "@/types/api"

export function LeaveReviewDialog({
  leave,
  onClose,
}: {
  leave: LeaveRequest | null
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const [comment, setComment] = useState("")

  const mutation = useMutation({
    mutationFn: (input: { status: "approved" | "rejected" }) =>
      leaveService.review(leave!.id, { ...input, comment }),
    onSuccess: (_data, input) => {
      toast.success(`Leave ${input.status}.`)
      void queryClient.invalidateQueries({ queryKey: ["leaves"] })
      void queryClient.invalidateQueries({ queryKey: ["reports"] })
      setComment("")
      onClose()
    },
    onError: (error) => toast.error(toUserMessage(error)),
  })

  return (
    <Dialog open={!!leave} onOpenChange={(open) => (!open ? onClose() : undefined)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Review leave request</DialogTitle>
          <DialogDescription>
            {leave ? (
              <span className="text-foreground">
                <span className="capitalize">{leave.type}</span> leave ·{" "}
                {formatDate(leave.startDate)} → {formatDate(leave.endDate)} ·{" "}
                {leave.days} day{leave.days > 1 ? "s" : ""}
              </span>
            ) : null}
          </DialogDescription>
        </DialogHeader>

        {leave?.reason ? (
          <p className="bg-muted/50 rounded-md border px-3 py-2 text-sm">
            “{leave.reason}”
          </p>
        ) : null}

        <Textarea
          placeholder="Add a comment for the employee (optional)…"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate({ status: "rejected" })}
          >
            Reject
          </Button>
          <Button
            disabled={mutation.isPending}
            onClick={() => mutation.mutate({ status: "approved" })}
          >
            Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
