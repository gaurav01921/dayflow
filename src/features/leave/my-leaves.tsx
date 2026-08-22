import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  CalendarDays,
  FileUp,
  HeartPulse,
  Palmtree,
  Plus,
  Umbrella,
} from "lucide-react"
import { useMemo, useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { PageHeader } from "@/components/shared/page-header"
import { StatusPill } from "@/components/shared/status-pill"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
  const [fileName, setFileName] = useState<string | null>(null)

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
      setFileName(null)
      onOpenChange(false)
    },
    onError: (error) => toast.error(toUserMessage(error)),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Time Off Request</DialogTitle>
          <DialogDescription>Submit your time off application for manager / HR review.</DialogDescription>
        </DialogHeader>

        <form className="space-y-4 pt-2" onSubmit={submit}>
          <div className="space-y-2">
            <Label htmlFor="leave-type" className="text-xs font-semibold">
              Time Off Type
            </Label>
            <select
              id="leave-type"
              className="border-input focus-visible:border-primary focus-visible:ring-primary/20 h-9 w-full rounded-md border bg-background px-3 text-sm shadow-xs outline-none focus-visible:ring-3"
              value={type}
              onChange={(e) => setType(e.target.value as LeaveType)}
            >
              <option value="paid">Paid Time Off (Annual Leave)</option>
              <option value="sick">Sick Leave</option>
              <option value="unpaid">Unpaid Leave</option>
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="leave-start" className="text-xs font-semibold">
                Start Date
              </Label>
              <Input id="leave-start" type="date" {...register("startDate")} />
              {errors.startDate ? (
                <p className="text-destructive text-xs">{errors.startDate.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="leave-end" className="text-xs font-semibold">
                End Date
              </Label>
              <Input id="leave-end" type="date" {...register("endDate")} />
              {errors.endDate ? (
                <p className="text-destructive text-xs">{errors.endDate.message}</p>
              ) : null}
            </div>
          </div>

          {calculatedDays > 0 ? (
            <div className="rounded-lg bg-primary/10 border border-primary/20 p-3 text-xs text-primary flex justify-between items-center font-medium">
              <span>Requested Allocation:</span>
              <span className="font-bold text-foreground">{calculatedDays} Day{calculatedDays > 1 ? "s" : ""}</span>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="leave-reason" className="text-xs font-semibold">
              Remarks / Reason
            </Label>
            <Textarea
              id="leave-reason"
              placeholder="State the reason for your time off request…"
              rows={3}
              {...register("reason")}
            />
            {errors.reason ? (
              <p className="text-destructive text-xs">{errors.reason.message}</p>
            ) : null}
          </div>

          {/* Attachment upload visual matching wireframe */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Attachment (Optional)</Label>
            <label className="border-border/80 bg-muted/30 hover:bg-muted/60 flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 cursor-pointer transition-colors">
              <FileUp className="size-6 text-muted-foreground mb-1" />
              <span className="text-xs font-medium text-foreground">
                {fileName ? fileName : "Click or drag file to attach (medical note, ticket)"}
              </span>
              <span className="text-[10px] text-muted-foreground mt-0.5">PDF, PNG, JPG up to 5MB</span>
              <input
                type="file"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) setFileName(file.name)
                }}
              />
            </label>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset()
                setFileName(null)
                onOpenChange(false)
              }}
            >
              Discard
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
    <div className="space-y-6">
      <PageHeader
        title="Time Off & Leave Management"
        description="Apply for vacation, sick leave, track available balance, and view review status."
        actions={
          <Button onClick={() => setDialogOpen(true)} className="gap-2 shadow-xs">
            <Plus className="size-4" /> Request Time Off
          </Button>
        }
      />
      <ApplyLeaveDialog open={dialogOpen} onOpenChange={setDialogOpen} />

      {/* Available Balance Cards per reference */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/80 shadow-xs">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Palmtree className="size-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Paid Time Off
              </p>
              <p className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
                12 <span className="text-sm font-normal text-muted-foreground">Days Available</span>
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Annual vacation quota</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-xs">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-success/10 text-success">
              <HeartPulse className="size-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Sick Leave
              </p>
              <p className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
                7 <span className="text-sm font-normal text-muted-foreground">Days Available</span>
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Medical & recovery leave</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-xs">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-info/10 text-info">
              <Umbrella className="size-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Unpaid Leave
              </p>
              <p className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
                Discretionary
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Subject to manager approval</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leave Requests Ledger */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
          <div>
            <CardTitle className="text-base font-semibold">Time Off History</CardTitle>
            <CardDescription>All submitted requests and reviewer feedback</CardDescription>
          </div>

          <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-auto">
            <TabsList className="h-8">
              <TabsTrigger value="all" className="text-xs px-2.5">
                All ({typedLeaves.length})
              </TabsTrigger>
              <TabsTrigger value="pending" className="text-xs px-2.5">
                Pending ({pendingCount})
              </TabsTrigger>
              <TabsTrigger value="approved" className="text-xs px-2.5">
                Approved ({approvedCount})
              </TabsTrigger>
              <TabsTrigger value="rejected" className="text-xs px-2.5">
                Rejected ({rejectedCount})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground py-10 text-center text-sm">Loading leave records…</p>
          ) : filteredLeaves.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <CalendarDays className="text-muted-foreground size-8" />
              <p className="text-sm font-semibold">No leave requests found</p>
              <p className="text-muted-foreground text-xs">
                {statusFilter === "all"
                  ? "Click 'Request Time Off' to submit your first request."
                  : `No requests with status "${statusFilter}".`}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Duration</th>
                    <th className="px-4 py-3">Days</th>
                    <th className="px-4 py-3">Remarks</th>
                    <th className="px-4 py-3">HR Comment</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredLeaves.map((l) => (
                    <tr key={l.id} className="transition-colors hover:bg-muted/40">
                      <td className="px-4 py-3.5 capitalize font-medium text-foreground">{l.type} Leave</td>
                      <td className="px-4 py-3.5 tabular-nums text-foreground">
                        {l.startDate} → {l.endDate}
                      </td>
                      <td className="px-4 py-3.5 tabular-nums font-semibold text-foreground">
                        {l.days} Day{l.days > 1 ? "s" : ""}
                      </td>
                      <td
                        className="text-muted-foreground max-w-[200px] truncate px-4 py-3.5 text-xs"
                        title={l.reason}
                      >
                        {l.reason || "—"}
                      </td>
                      <td
                        className="text-muted-foreground max-w-[200px] truncate px-4 py-3.5 text-xs"
                        title={l.reviewerComment ?? ""}
                      >
                        {l.reviewerComment || "—"}
                      </td>
                      <td className="px-4 py-3.5">
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
    </div>
  )
}

export default MyLeavesPage
