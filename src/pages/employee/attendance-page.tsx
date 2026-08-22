import { useQuery } from "@tanstack/react-query"
import {
  Calendar,
  CalendarCheck2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  PlaneTakeoff,
  UserCheck,
} from "lucide-react"
import { useMemo, useState } from "react"

import { StatCard } from "@/components/dashboard/stat-card"
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
import { AttendanceTracker } from "@/features/attendance/attendance-tracker"
import { attendanceService } from "@/services/attendanceService"
import type { AttendanceRecord } from "@/types/api"

function formatTime(iso: string | null): string {
  if (!iso) return "—"
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

export function EmployeeAttendancePage() {
  const [selectedDateISO, setSelectedDateISO] = useState<string>(
    () => new Date().toISOString().slice(0, 10)
  )

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["attendance", "me"],
    queryFn: () => attendanceService.list(),
    refetchInterval: 30_000,
  })

  const todayISO = useMemo(() => new Date().toISOString().slice(0, 10), [])
  const todayRecord = records.find((r) => r.date === todayISO)

  // Calculations for summary cards
  const stats = useMemo(() => {
    const presentCount = records.filter((r) => r.status === "present").length
    const leaveCount = records.filter((r) => r.status === "leave").length
    const totalHours = records.reduce((sum, r) => sum + (r.hoursWorked ?? 0), 0)
    const workingDaysCount = records.length || 22

    return {
      presentCount,
      leaveCount,
      totalHours: Math.round(totalHours * 10) / 10,
      workingDaysCount,
    }
  }, [records])

  // Navigate date
  const changeDate = (offsetDays: number) => {
    const d = new Date(selectedDateISO + "T00:00:00")
    d.setDate(d.getDate() + offsetDays)
    setSelectedDateISO(d.toISOString().slice(0, 10))
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance & Daily Work Log"
        description="Record check-in and check-out times, log work status, and monitor your monthly attendance."
      />

      {/* Attendance Tracker Widget */}
      <AttendanceTracker todayRecord={todayRecord} />

      {/* Visual Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Present Days"
          value={stats.presentCount}
          hint="Days attended this month"
          icon={UserCheck}
          tone="success"
        />
        <StatCard
          title="Leave Days"
          value={stats.leaveCount}
          hint="Approved leaves taken"
          icon={PlaneTakeoff}
          tone="info"
        />
        <StatCard
          title="Total Hours"
          value={`${stats.totalHours}h`}
          hint="Productive hours logged"
          icon={Clock}
          tone="primary"
        />
        <StatCard
          title="Working Days"
          value={stats.workingDaysCount}
          hint="Total cycle working days"
          icon={CalendarCheck2}
          tone="warning"
        />
      </div>

      {/* Attendance History Table with Date Navigator */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
          <div>
            <CardTitle className="text-base font-semibold">Attendance Log</CardTitle>
            <CardDescription>Review all logged timestamps and daily work hours</CardDescription>
          </div>

          {/* Date Navigator per wireframe */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => changeDate(-1)}
              className="h-8 gap-1 px-2.5 text-xs"
            >
              <ChevronLeft className="size-3.5" /> Prev Day
            </Button>
            <div className="flex items-center gap-1.5 bg-muted/60 border border-border px-3 py-1 rounded-md text-xs font-semibold">
              <Calendar className="size-3.5 text-primary" />
              <span>
                {new Date(selectedDateISO + "T00:00:00").toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => changeDate(1)}
              className="h-8 gap-1 px-2.5 text-xs"
            >
              Next Day <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground py-10 text-center text-sm">Loading attendance records…</p>
          ) : records.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <CalendarDays className="text-muted-foreground size-8" />
              <p className="text-sm font-semibold">No attendance records found</p>
              <p className="text-muted-foreground text-xs">
                Your check-in entries will automatically log here daily.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Day</th>
                    <th className="px-4 py-3">Check In</th>
                    <th className="px-4 py-3">Check Out</th>
                    <th className="px-4 py-3">Work Hours</th>
                    <th className="px-4 py-3">Extra Hours</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {records.map((r: AttendanceRecord) => {
                    const recordDate = new Date(r.date + "T00:00:00")
                    const dayName = recordDate.toLocaleDateString("en-US", { weekday: "short" })
                    const isSelected = r.date === selectedDateISO
                    const extraHours = r.hoursWorked > 8 ? Math.round((r.hoursWorked - 8) * 10) / 10 : 0

                    return (
                      <tr
                        key={r.id}
                        className={`transition-colors hover:bg-muted/40 ${
                          isSelected ? "bg-primary/5 font-medium" : ""
                        }`}
                      >
                        <td className="px-4 py-3.5 font-mono text-xs">{r.date}</td>
                        <td className="px-4 py-3.5 font-medium text-foreground">{dayName}</td>
                        <td className="px-4 py-3.5 tabular-nums text-foreground">
                          {formatTime(r.checkIn)}
                        </td>
                        <td className="px-4 py-3.5 tabular-nums text-foreground">
                          {formatTime(r.checkOut)}
                        </td>
                        <td className="px-4 py-3.5 tabular-nums font-semibold text-foreground">
                          {r.hoursWorked ? `${r.hoursWorked}h` : "—"}
                        </td>
                        <td className="px-4 py-3.5 tabular-nums text-muted-foreground">
                          {extraHours > 0 ? `+${extraHours}h` : "—"}
                        </td>
                        <td className="px-4 py-3.5">
                          <StatusPill status={r.status} />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default EmployeeAttendancePage
