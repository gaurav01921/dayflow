import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  ArrowRight,
  Banknote,
  CalendarCheck2,
  Clock3,
  PlaneTakeoff,
  UserRound,
} from "lucide-react"
import { Link } from "react-router-dom"

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
import { toISODate } from "@/mocks/mockDb"
import { attendanceService } from "@/services/attendanceService"
import { leaveService } from "@/services/leaveService"
import { notificationService } from "@/services/notificationService"
import { useAuthStore } from "@/stores/authStore"

export function EmployeeDashboardPage() {
  const user = useAuthStore((s) => s.user)
  const queryClient = useQueryClient()

  const { data: attendance = [] } = useQuery({
    queryKey: ["attendance", "me"],
    queryFn: () => attendanceService.list(),
    refetchInterval: 30_000,
  })
  const { data: leaves = [] } = useQuery({
    queryKey: ["leaves", "me"],
    queryFn: () => leaveService.list(),
  })
  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: notificationService.list,
    refetchInterval: 30_000,
  })

  const todayISO = toISODate(new Date())
  const todayRecord = attendance.find((r) => r.date === todayISO)
  const weekRecords = attendance.filter(
    (r) => r.date >= toISODate(new Date(Date.now() - 6 * 86_400_000))
  )
  const weekHours =
    Math.round(weekRecords.reduce((sum, r) => sum + (r.hoursWorked ?? 0), 0) * 10) / 10
  const pendingLeaves = leaves.filter((l) => l.status === "pending").length
  const latestPayslipMonth = new Date().toISOString().slice(0, 7)

  return (
    <>
      <PageHeader
        title={`Good day, ${user?.employeeCode ?? ""}`}
        description="Here's what's happening with your work day."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Today"
          value={todayRecord ? (todayRecord.checkOut ? "Done" : "Working") : "Not checked in"}
          hint={todayRecord?.checkIn ? `In at ${new Date(todayRecord.checkIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "Check in from Attendance"}
          icon={CalendarCheck2}
          tone={todayRecord ? "success" : "warning"}
        />
        <StatCard title="Hours · last 7 days" value={`${weekHours}h`} icon={Clock3} tone="primary" />
        <StatCard
          title="Pending leaves"
          value={pendingLeaves}
          icon={PlaneTakeoff}
          tone={pendingLeaves > 0 ? "warning" : "info"}
        />
        <StatCard title="Payslip" value={latestPayslipMonth} hint="Available in Payroll" icon={Banknote} tone="info" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { to: "/employee/profile", label: "Profile", desc: "Personal & job details", icon: UserRound },
          { to: "/employee/attendance", label: "Attendance", desc: "Check in/out and history", icon: CalendarCheck2 },
          { to: "/employee/leave", label: "Leave Requests", desc: "Apply and track time off", icon: PlaneTakeoff },
          { to: "/employee/payroll", label: "Payroll", desc: "Salary slips and breakdown", icon: Banknote },
        ].map((item) => (
          <Link key={item.to} to={item.to}>
            <Card className="hover:border-primary/40 h-full gap-0 py-0 transition-colors hover:shadow-md">
              <CardContent className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-lg">
                    <item.icon className="size-4.5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-muted-foreground text-xs">{item.desc}</p>
                  </div>
                </div>
                <ArrowRight className="text-muted-foreground size-4" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
          <CardDescription>Latest updates on your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {notifications.length === 0 ? (
            <p className="text-muted-foreground text-sm">No recent activity.</p>
          ) : (
            notifications.slice(0, 5).map((n) => (
              <div key={n.id} className="flex items-start justify-between gap-3 border-b pb-3 last:border-b-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-muted-foreground text-sm">{n.message}</p>
                </div>
                <span className="text-muted-foreground shrink-0 text-xs">
                  {new Date(n.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))
          )}
          {todayRecord ? (
            <Button asChild variant="outline" size="sm" className="mt-1" onClick={() => queryClient.invalidateQueries()}>
              <Link to="/employee/attendance">
                View full attendance <ArrowRight />
              </Link>
            </Button>
          ) : null}
        </CardContent>
      </Card>

      {todayRecord && !todayRecord.checkOut ? (
        <p className="text-muted-foreground text-sm">
          Current status: <StatusPill status={todayRecord.status} />
        </p>
      ) : null}
    </>
  )
}
