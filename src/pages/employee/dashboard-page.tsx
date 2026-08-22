import { useQuery, useQueryClient } from "@tanstack/react-query"
import {
  ArrowRight,
  Banknote,
  CalendarCheck2,
  Clock3,
  PlaneTakeoff,
  UserRound,
  Users,
} from "lucide-react"
import { useMemo } from "react"
import { Link } from "react-router-dom"

import { StatCard } from "@/components/dashboard/stat-card"
import { PageHeader } from "@/components/shared/page-header"
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

  const todayISO = useMemo(() => toISODate(new Date()), [])
  const todayRecord = attendance.find((r) => r.date === todayISO)

  const weekHours = useMemo(() => {
    const cutoff = toISODate(new Date(Date.now() - 6 * 86_400_000))
    const weekRecords = attendance.filter((r) => r.date >= cutoff)
    return Math.round(weekRecords.reduce((sum, r) => sum + (r.hoursWorked ?? 0), 0) * 10) / 10
  }, [attendance])

  const pendingLeaves = leaves.filter((l) => l.status === "pending").length
  const latestPayslipMonth = new Date().toISOString().slice(0, 7)

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${user?.employeeCode ?? "Team Member"}`}
        description="Overview of your daily workspace status, attendance tracking, and leave entitlements."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Today's Status"
          value={todayRecord ? (todayRecord.checkOut ? "Shift Completed" : "Clocked In") : "Not Checked In"}
          hint={todayRecord?.checkIn ? `Checked in at ${new Date(todayRecord.checkIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "Clock in from Attendance module"}
          icon={CalendarCheck2}
          tone={todayRecord ? "success" : "warning"}
        />
        <StatCard
          title="Hours Logged (7 Days)"
          value={`${weekHours}h`}
          hint="Productive time recorded"
          icon={Clock3}
          tone="primary"
        />
        <StatCard
          title="Pending Time Off"
          value={pendingLeaves}
          hint={pendingLeaves > 0 ? "Awaiting manager approval" : "No active filings"}
          icon={PlaneTakeoff}
          tone={pendingLeaves > 0 ? "warning" : "info"}
        />
        <StatCard
          title="Current Cycle Slip"
          value={latestPayslipMonth}
          hint="View breakdown in Payroll"
          icon={Banknote}
          tone="info"
        />
      </div>

      {/* Main Navigation Modules Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { to: "/employee/employees", label: "Employee Directory", desc: "Browse colleague cards & in-office status", icon: Users, color: "text-primary bg-primary/10" },
          { to: "/employee/attendance", label: "Attendance & Clock In", desc: "Check in/out, view working hours", icon: CalendarCheck2, color: "text-success bg-success/10" },
          { to: "/employee/leave", label: "Time Off Requests", desc: "Apply for leaves & review allocations", icon: PlaneTakeoff, color: "text-warning bg-warning/15" },
          { to: "/employee/profile", label: "My Profile", desc: "Personal info, resume, skills & salary", icon: UserRound, color: "text-info bg-info/10" },
          { to: "/employee/payroll", label: "Payroll & Compensation", desc: "Monthly slips and wage breakdown", icon: Banknote, color: "text-primary bg-primary/10" },
        ].map((item) => (
          <Link key={item.to} to={item.to}>
            <Card className="hover:border-primary/50 h-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer border-border/80">
              <CardContent className="flex items-center justify-between p-5">
                <div className="flex items-center gap-3.5">
                  <div className={`flex size-10 items-center justify-center rounded-xl ${item.color}`}>
                    <item.icon className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.label}</p>
                    <p className="text-muted-foreground text-xs">{item.desc}</p>
                  </div>
                </div>
                <ArrowRight className="text-muted-foreground size-4 shrink-0" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Activity Card */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
          <CardDescription>Latest notifications and updates on your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {notifications.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4 text-center">No recent activity logged.</p>
          ) : (
            notifications.slice(0, 4).map((n) => (
              <div
                key={n.id}
                className="flex items-start justify-between gap-3 border-b border-border/50 pb-3 last:border-b-0 last:pb-0"
              >
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold text-foreground">{n.title}</p>
                  <p className="text-muted-foreground text-xs">{n.message}</p>
                </div>
                <span className="text-muted-foreground shrink-0 text-[11px] font-mono">
                  {new Date(n.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))
          )}
          {todayRecord ? (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => queryClient.invalidateQueries()}
            >
              <Link to="/employee/attendance" className="gap-1.5 text-xs">
                <span>View Full Attendance History</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}

export default EmployeeDashboardPage
