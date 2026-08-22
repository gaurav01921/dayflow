import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CalendarDays, LogIn, LogOut } from "lucide-react"
import { toast } from "sonner"

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
import { toISODate } from "@/mocks/mockDb"
import { toUserMessage } from "@/lib/api-error"
import { attendanceService } from "@/services/attendanceService"
import type { AttendanceRecord } from "@/types/api"

function formatTime(iso: string | null): string {
  if (!iso) return "—"
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

export function EmployeeAttendancePage() {
  const queryClient = useQueryClient()
  const { data: records = [], isLoading } = useQuery({
    queryKey: ["attendance", "me"],
    queryFn: () => attendanceService.list(),
    refetchInterval: 30_000,
  })

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["attendance"] })

  const checkIn = useMutation({
    mutationFn: attendanceService.checkIn,
    onSuccess: () => {
      toast.success("Checked in. Have a great day!")
      void invalidate()
    },
    onError: (e) => toast.error(toUserMessage(e)),
  })
  const checkOut = useMutation({
    mutationFn: attendanceService.checkOut,
    onSuccess: (record) => {
      toast.success(`Checked out · ${record.hoursWorked}h logged`)
      void invalidate()
    },
    onError: (e) => toast.error(toUserMessage(e)),
  })

  const todayISO = toISODate(new Date())
  const today = records.find((r) => r.date === todayISO)
  const weekStart = toISODate(new Date(Date.now() - 6 * 86_400_000))
  const weekRecords = records
    .filter((r) => r.date >= weekStart)
    .sort((a, b) => b.date.localeCompare(a.date))

  return (
    <>
      <PageHeader
        title="Attendance"
        description="Check in and out, and review your daily and weekly record."
      />

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Today</CardTitle>
            <CardDescription>
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </CardDescription>
          </div>
          {today ? (
            <StatusPill status={today.status} />
          ) : (
            <span className="text-muted-foreground text-sm">No record yet</span>
          )}
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <div className="text-muted-foreground mr-auto grid grid-cols-3 gap-6 text-center text-sm">
            <div>
              <p className="text-xs">Check in</p>
              <p className="text-foreground text-lg font-semibold tabular-nums">
                {formatTime(today?.checkIn ?? null)}
              </p>
            </div>
            <div>
              <p className="text-xs">Check out</p>
              <p className="text-foreground text-lg font-semibold tabular-nums">
                {formatTime(today?.checkOut ?? null)}
              </p>
            </div>
            <div>
              <p className="text-xs">Hours</p>
              <p className="text-foreground text-lg font-semibold tabular-nums">
                {today?.hoursWorked ?? 0}h
              </p>
            </div>
          </div>
          <Button onClick={() => checkIn.mutate()} disabled={checkIn.isPending || !!today?.checkIn}>
            <LogIn /> Check in
          </Button>
          <Button
            variant="outline"
            onClick={() => checkOut.mutate()}
            disabled={checkOut.isPending || !today?.checkIn || !!today?.checkOut}
          >
            <LogOut /> Check out
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Last 7 days</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground py-6 text-center text-sm">Loading…</p>
          ) : weekRecords.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <CalendarDays className="text-muted-foreground size-6" />
              <p className="text-sm font-medium">No attendance this week</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {(weekRecords as AttendanceRecord[]).map((r) => (
                <div
                  key={r.id}
                  className="bg-muted/40 flex items-center justify-between rounded-lg border px-3 py-2.5"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {new Date(r.date + "T00:00:00").toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {formatTime(r.checkIn)} → {formatTime(r.checkOut)}
                      {r.hoursWorked ? ` · ${r.hoursWorked}h` : ""}
                    </p>
                  </div>
                  <StatusPill status={r.status} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
