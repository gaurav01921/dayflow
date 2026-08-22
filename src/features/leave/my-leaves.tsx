import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CalendarDays, CheckCircle2, Clock, Plus, XCircle } from "lucide-react"
import { useMemo, useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { StatCard } from "@/components/dashboard/stat-card"
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { toUserMessage } from "@/lib/api-error"
import { leaveService } from "@/services/leaveService"
import type { LeaveRequest, LeaveStatus, LeaveType } from "@/types/api"

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
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { startDate: "", endDate: "", reason: "" },
  })

  const startDate = useWatch({ control, name: "startDate" })
  const endDate = useWatch({ control, name: "endDate" })

  const calculatedDays = useMemo(() => {
    if (!startDate || !endDate || endDate < startDate) return 0
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1
    return diff > 0 ? diff : 0
  }, [startDate, endDate])

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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Apply for Leave</DialogTitle>
          <DialogDescription>Submit your time off request for HR review.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4 pt-2" onSubmit={submit}>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="leave-type">Leave type</Label>
              <select
                id="leave-type"
                className="border-input focus-visible:border-ring focus-visible:ring-ring/30 h-9 w-full rounded-md border bg-background px-3 text-sm shadow-sm outline-none focus-visible:ring-[3px]"
                value={type}
                onChange={(e) => setType(e.target.value as LeaveType)}
              >
                <option value="paid">Paid Leave</option>
                <option value="sick">Sick Leave</option>
                <option value="unpaid">Unpaid Leave</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="leave-start">From Date</Label>
              <Input id="leave-start" type="date" {...register("startDate")} />
              {errors.startDate ? (
                <p className="text-destructive text-xs">{errors.startDate.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="leave-end">To Date</Label>
              <Input id="leave-end" type="date" {...register("endDate")} />
              {errors.endDate ? (
                <p className="text-destructive text-xs">{errors.endDate.message}</p>
              ) : null}
            </div>
          </div>

          {calculatedDays > 0 ? (
            <div className="rounded-md bg-muted/40 p-2.5 text-xs text-muted-foreground flex justify-between items-center">
              <span>Total Requested Duration:</span>
              <span className="font-semibold text-foreground">{calculatedDays} day{calculatedDays > 1 ? "s" : ""}</span>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="leave-reason">Remarks / Reason</Label>
            <Textarea
              id="leave-reason"
              placeholder="Reason for your time off request…"
              rows={3}
              {...register("reason")}
            />
            {errors.reason ? (
              <p className="text-destructive text-xs">{errors.reason.message}</p>
            ) : null}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Submitting…" : "Submit Request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function MyLeavesPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const { data: leaves = [], isLoading } = useQuery({
    queryKey: ["leaves", "me"],
    queryFn: () => leaveService.list(),
  })

  const typedLeaves = leaves as LeaveRequest[]

  const pendingCount = typedLeaves.filter((l) => l.status === "pending").length
  const approvedCount = typedLeaves.filter((l) => l.status === "approved").length
  const rejectedCount = typedLeaves.filter((l) => l.status === "rejected").length

  const filteredLeaves = useMemo(() => {
    if (statusFilter === "all") return typedLeaves
    return typedLeaves.filter((l) => l.status === statusFilter)
  }, [typedLeaves, statusFilter])

  return (
    <>
      <PageHeader
        title="Leave Requests"
        description="Apply for time off, view balances, and track approval status."
        actions={
          <Button onClick={() => setDialogOpen(true)} className="gap-2">
            <Plus className="size-4" /> Apply for leave
          </Button>
        }
      />
      <ApplyLeaveDialog open={dialogOpen} onOpenChange={setDialogOpen} />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Pending Requests"
          value={pendingCount}
          hint="Awaiting HR review"
          icon={Clock}
          tone={pendingCount > 0 ? "warning" : "info"}
        />
        <StatCard
          title="Approved Leaves"
          value={approvedCount}
          hint="Total approved this year"
          icon={CheckCircle2}
          tone="success"
        />
        <StatCard
          title="Rejected Requests"
          value={rejectedCount}
          hint="Declined by reviewer"
          icon={XCircle}
          tone={rejectedCount > 0 ? "destructive" : "info"}
        />
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between gap-4 pb-4">
          <CardTitle className="text-base font-semibold">Request History</CardTitle>
          <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-auto">
            <TabsList className="h-8">
              <TabsTrigger value="all" className="text-xs px-2.5">All ({typedLeaves.length})</TabsTrigger>
              <TabsTrigger value="pending" className="text-xs px-2.5">Pending ({pendingCount})</TabsTrigger>
              <TabsTrigger value="approved" className="text-xs px-2.5">Approved ({approvedCount})</TabsTrigger>
              <TabsTrigger value="rejected" className="text-xs px-2.5">Rejected ({rejectedCount})</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground py-6 text-center text-sm">Loading leave records…</p>
          ) : filteredLeaves.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <CalendarDays className="text-muted-foreground size-6" />
              <p className="text-sm font-medium">No leave requests found</p>
              <p className="text-muted-foreground text-sm">
                {statusFilter === "all"
                  ? "Apply above and your requests will appear here."
                  : `No requests with status "${statusFilter}".`}
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
                    <th className="text-muted-foreground px-3 py-2 font-medium">HR Comment</th>
                    <th className="text-muted-foreground px-3 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeaves.map((l) => (
                    <tr key={l.id} className="hover:bg-muted/50 border-b last:border-0 transition-colors">
                      <td className="px-3 py-2.5 capitalize font-medium">{l.type}</td>
                      <td className="px-3 py-2.5 tabular-nums">
                        {l.startDate} → {l.endDate}
                      </td>
                      <td className="px-3 py-2.5 tabular-nums font-semibold">{l.days}</td>
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
                        <StatusPill status={l.status as LeaveStatus} />
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
