import { useMutation, useQueryClient } from "@tanstack/react-query"
import { CalendarCheck2, Clock, LogIn, LogOut, MessageSquarePlus } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { StatusPill } from "@/components/shared/status-pill"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { toUserMessage } from "@/lib/api-error"
import { attendanceService } from "@/services/attendanceService"
import type { AttendanceRecord } from "@/types/api"
import { DailyStatusDialog } from "./daily-status-dialog"

function formatTime(iso: string | null): string {
  if (!iso) return "—"
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

interface AttendanceTrackerProps {
  todayRecord?: AttendanceRecord
}

export function AttendanceTracker({ todayRecord }: AttendanceTrackerProps) {
  const queryClient = useQueryClient()
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["attendance"] })

  const checkInMutation = useMutation({
    mutationFn: attendanceService.checkIn,
    onSuccess: () => {
      toast.success("Checked in successfully! Have a productive day.")
      void invalidate()
    },
    onError: (e) => toast.error(toUserMessage(e)),
  })

  const checkOutMutation = useMutation({
    mutationFn: attendanceService.checkOut,
    onSuccess: (record) => {
      toast.success(`Checked out successfully · ${record.hoursWorked}h logged`)
      void invalidate()
    },
    onError: (e) => toast.error(toUserMessage(e)),
  })

  const isCheckedIn = !!todayRecord?.checkIn
  const isCheckedOut = !!todayRecord?.checkOut

  return (
    <>
      <Card className="overflow-hidden border-border/80 shadow-sm">
        <CardHeader className="bg-muted/20 border-b border-border/50 flex-row items-center justify-between pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
              <CalendarCheck2 className="size-5" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">Today's Attendance</CardTitle>
              <CardDescription>
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </CardDescription>
            </div>
          </div>
          {todayRecord ? (
            <StatusPill status={todayRecord.status} />
          ) : (
            <span className="text-muted-foreground text-xs font-medium">Not checked in</span>
          )}
        </CardHeader>

        <CardContent className="p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="grid flex-1 grid-cols-3 gap-4 rounded-lg bg-muted/30 p-4 border border-border/40 text-center">
              <div>
                <p className="text-muted-foreground flex items-center justify-center gap-1 text-xs font-medium">
                  <Clock className="size-3.5" /> Check In
                </p>
                <p className="text-foreground mt-1 text-lg font-bold tabular-nums">
                  {formatTime(todayRecord?.checkIn ?? null)}
                </p>
              </div>
              <div className="border-x border-border/60">
                <p className="text-muted-foreground flex items-center justify-center gap-1 text-xs font-medium">
                  <Clock className="size-3.5" /> Check Out
                </p>
                <p className="text-foreground mt-1 text-lg font-bold tabular-nums">
                  {formatTime(todayRecord?.checkOut ?? null)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs font-medium">Hours Logged</p>
                <p className="text-primary mt-1 text-lg font-bold tabular-nums">
                  {todayRecord?.hoursWorked ?? 0}h
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={() => checkInMutation.mutate()}
                disabled={checkInMutation.isPending || isCheckedIn}
                className="gap-2"
              >
                <LogIn className="size-4" />
                {checkInMutation.isPending ? "Checking in..." : isCheckedIn ? "Checked In" : "Check In"}
              </Button>

              <Button
                variant="outline"
                onClick={() => checkOutMutation.mutate()}
                disabled={checkOutMutation.isPending || !isCheckedIn || isCheckedOut}
                className="gap-2"
              >
                <LogOut className="size-4" />
                {checkOutMutation.isPending ? "Checking out..." : isCheckedOut ? "Checked Out" : "Check Out"}
              </Button>

              <Button
                variant="secondary"
                size="icon"
                onClick={() => setStatusDialogOpen(true)}
                title="Add Daily Work Note"
              >
                <MessageSquarePlus className="size-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <DailyStatusDialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen} />
    </>
  )
}
