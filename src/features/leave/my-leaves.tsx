import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CalendarDays, Plus } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { PageHeader } from "@/components/shared/page-header"
import { StatusPill } from "@/components/shared/status-pill"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toUserMessage } from "@/lib/api-error"
import { leaveService } from "@/services/leaveService"
import type { LeaveRequest, LeaveType } from "@/types/api"

const schema = z
  .object({
    startDate: z.string().min(1, "Start date is required."),
    endDate: z.string().min(1, "End date is required."),
    reason: z.string().min(3, "Add a short remark.").max(300),
  })
  .refine((v) => v.endDate >= v.startDate, {
    message: "End date cannot be before start date.",
    path: ["endDate"],
  })

type FormValues = z.infer<typeof schema>

function ApplyLeaveDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()
  const [type, setType] = useState<LeaveType>("paid")
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { startDate: "", endDate: "", reason: "" },
  })

  const submit = handleSubmit((values) => {
    createMutation.mutate({ ...values, type })
  })

  const createMutation = useMutation({
    mutationFn: (input: FormValues & { type: LeaveType }) => leaveService.create(input),
    onSuccess: () => {
      toast.success("Leave request submitted for approval.")
      void queryClient.invalidateQueries({ queryKey: ["leaves"] })
      reset()
      onOpenChange(false)
    },
    onError: (error) => toast.error(toUserMessage(error)),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Apply for leave</DialogTitle>
          <DialogDescription>Your request goes to HR for approval.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={submit}>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="leave-type">Leave type</Label>
              <select
                id="leave-type"
                className="border-input focus-visible:border-ring focus-visible:ring-ring/30 h-9 w-full rounded-md border bg-transparent px-2 text-sm shadow-sm outline-none focus-visible:ring-[3px]"
                value={type}
                onChange={(e) => setType(e.target.value as LeaveType)}
              >
                <option value="paid">Paid</option>
                <option value="sick">Sick</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="leave-start">From</Label>
              <Input id="leave-start" type="date" {...register("startDate")} />
              {errors.startDate ? (
                <p className="text-destructive text-xs">{errors.startDate.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="leave-end">To</Label>
              <Input id="leave-end" type="date" {...register("endDate")} />
              {errors.endDate ? (
                <p className="text-destructive text-xs">{errors.endDate.message}</p>
              ) : null}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="leave-reason">Remarks</Label>
            <Textarea
              id="leave-reason"
              placeholder="Reason for your time off…"
              {...register("reason")}
            />
            {errors.reason ? (
              <p className="text-destructive text-xs">{errors.reason.message}</p>
            ) : null}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Submitting…" : "Submit request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function MyLeavesPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const { data: leaves = [], isLoading } = useQuery({
    queryKey: ["leaves", "me"],
    queryFn: () => leaveService.list(),
  })

  return (
    <>
      <PageHeader
        title="My leave requests"
        description="Apply for time off and track approval status."
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus /> Apply for leave
          </Button>
        }
      />
      <ApplyLeaveDialog open={dialogOpen} onOpenChange={setDialogOpen} />

      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground py-6 text-center text-sm">Loading…</p>
          ) : leaves.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <CalendarDays className="text-muted-foreground size-6" />
              <p className="text-sm font-medium">No leave requests yet</p>
              <p className="text-muted-foreground text-sm">
                Apply above and your requests will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="text-muted-foreground px-3 py-2 font-medium">Type</th>
                    <th className="text-muted-foreground px-3 py-2 font-medium">Dates</th>
                    <th className="text-muted-foreground px-3 py-2 font-medium">Days</th>
                    <th className="text-muted-foreground px-3 py-2 font-medium">Remarks</th>
                    <th className="text-muted-foreground px-3 py-2 font-medium">HR comment</th>
                    <th className="text-muted-foreground px-3 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(leaves as LeaveRequest[]).map((l) => (
                    <tr key={l.id} className="hover:bg-muted/50 border-b last:border-0">
                      <td className="px-3 py-2.5 capitalize">{l.type}</td>
                      <td className="px-3 py-2.5">
                        {l.startDate} → {l.endDate}
                      </td>
                      <td className="px-3 py-2.5 tabular-nums">{l.days}</td>
                      <td
                        className="text-muted-foreground max-w-[220px] truncate px-3 py-2.5"
                        title={l.reason}
                      >
                        {l.reason || "—"}
                      </td>
                      <td
                        className="text-muted-foreground max-w-[220px] truncate px-3 py-2.5"
                        title={l.reviewerComment ?? ""}
                      >
                        {l.reviewerComment || "—"}
                      </td>
                      <td className="px-3 py-2.5">
                        <StatusPill status={l.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
