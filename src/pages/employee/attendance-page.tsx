import { useQuery } from "@tanstack/react-query"
import { CalendarDays } from "lucide-react"

import { PageHeader } from "@/components/shared/page-header"
import { StatusPill } from "@/components/shared/status-pill"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { AttendanceTracker } from "@/features/attendance/attendance-tracker"
import { toISODate } from "@/mocks/mockDb"
import { attendanceService } from "@/services/attendanceService"
import type { AttendanceRecord } from "@/types/api"

function formatTime(iso: string | null): string {
  if (!iso) return "—"
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

export function EmployeeAttendancePage() {
  const { data: records = [], isLoading } = useQuery({
    queryKey: ["attendance", "me"],
    queryFn: () => attendanceService.list(),
    refetchInterval: 30_000,
  })

  const todayISO = toISODate(new Date())
  const todayRecord = records.find((r) => r.date === todayISO)
  const weekStart = toISODate(new Date(Date.now() - 6 * 86_400_000))
  const weekRecords = records
    .filter((r) => r.date >= weekStart)
    .sort((a, b) => b.date.localeCompare(a.date))

  return (
    <>
      <PageHeader
        title="Attendance & Daily Status"
        description="Check in and out, log daily work notes, and review your weekly attendance record."
      />

      <AttendanceTracker todayRecord={todayRecord} />

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Last 7 Days Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground py-6 text-center text-sm">Loading attendance records…</p>
          ) : weekRecords.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <CalendarDays className="text-muted-foreground size-6" />
              <p className="text-sm font-medium">No attendance records for this week</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {(weekRecords as AttendanceRecord[]).map((r) => (
                <div
                  key={r.id}
                  className="bg-muted/30 hover:bg-muted/50 transition-colors flex items-center justify-between rounded-lg border border-border/50 px-3.5 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold">
                      {new Date(r.date + "T00:00:00").toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-muted-foreground mt-0.5 text-xs font-mono">
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
