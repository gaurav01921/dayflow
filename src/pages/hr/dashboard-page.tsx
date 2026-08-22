import { useQuery } from "@tanstack/react-query"
import {
  LayoutDashboard,
  PlaneTakeoff,
  Users,
  CalendarCheck2,
  Banknote,
  ArrowRight,
  Clock,
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

import { reportService } from "@/services/reportService"
import { leaveService } from "@/services/leaveService"
import { employeeService } from "@/services/employeeService"
import { attendanceService } from "@/services/attendanceService"
import { notificationService } from "@/services/notificationService"
import { toISODate } from "@/lib/utils"
import type { Employee, LeaveRequest } from "@/types/api"
import { useAuthStore } from "@/stores/authStore"

export function HrDashboardPage() {
  const user = useAuthStore((state) => state.user)

  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => reportService.dashboardStats(),
  })

  const { data: leaves = [] } = useQuery({
    queryKey: ["leaves"],
    queryFn: () => leaveService.list(),
  })

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: employeeService.list,
  })

  const { data: attendance = [] } = useQuery({
    queryKey: ["attendance"],
    queryFn: () => attendanceService.list(),
  })

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: notificationService.list,
    refetchInterval: 30_000,
  })

  const employeeMap = new Map<string, Employee>(
    employees.map((e) => [e.id, e]),
  )

  const pendingLeaves = leaves
    .filter((l) => l.status === "pending")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  const todayISO = toISODate(new Date())
  const todayRecords = attendance.filter((r) => r.date === todayISO)
  const recentNotifications = notifications.slice(0, 5)

  return (
    <>
      <PageHeader
        title="HR Dashboard"
        description="A clear view of your workforce, approvals, and payroll operations."
      />

      <section className="relative overflow-hidden rounded-2xl bg-slate-950 px-6 py-7 text-white shadow-lg sm:px-8">
        <div className="relative z-10 max-w-2xl">
          <p className="text-primary-foreground/65 text-xs font-semibold uppercase tracking-[0.18em]">Good morning</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Welcome back{user?.employeeCode ? `, ${user.employeeCode}` : ""}.
          </h2>
          <p className="text-slate-300 mt-2 max-w-xl text-sm leading-relaxed">
            Stay ahead of today&apos;s people operations. Review requests, keep attendance accurate, and make payroll decisions with confidence.
          </p>
        </div>
        <div className="absolute -right-16 -top-24 size-72 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute -bottom-32 right-24 size-64 rounded-full bg-cyan-400/10 blur-3xl" />
      </section>

      {/* Stat Cards */}
      {stats ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            title="Total Employees"
            value={stats.totalEmployees}
            icon={Users}
            tone="primary"
            hint="Across your workspace"
          />
          <StatCard
            title="Present Today"
            value={stats.presentToday}
            icon={CalendarCheck2}
            tone="success"
            hint="Checked in today"
          />
          <StatCard
            title="On Leave"
            value={stats.onLeaveToday}
            icon={PlaneTakeoff}
            tone="info"
            hint="Away today"
          />
          <StatCard
            title="Pending Leaves"
            value={stats.pendingLeaveRequests}
            icon={Clock}
            tone={stats.pendingLeaveRequests > 0 ? "warning" : "info"}
            hint="Needs attention"
          />
          <StatCard
            title="Monthly Payroll"
            value={`$${(stats.monthlyPayrollTotal / 1000).toFixed(1)}k`}
            icon={Banknote}
            tone="info"
            hint="Current month"
          />
        </div>
      ) : null}

      {/* Pending Leave Requests — the demo centerpiece */}
      <Card className="overflow-hidden">
        <CardHeader className="flex-row items-center justify-between border-b bg-muted/20 pb-5">
          <div>
            <CardTitle className="flex items-center gap-2">
              <PlaneTakeoff className="size-5" />
              Pending Leave Requests
            </CardTitle>
            <CardDescription>
              {pendingLeaves.length} request{pendingLeaves.length !== 1 ? "s" : ""} awaiting your review
            </CardDescription>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/hr/leaves">
              View all <ArrowRight className="size-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {pendingLeaves.length === 0 ? (
            <p className="text-muted-foreground py-6 text-center text-sm">
              All caught up! No pending leave requests.
            </p>
          ) : (
            <div className="space-y-2 pt-1">
              {pendingLeaves.slice(0, 5).map((leave) => (
                <LeaveRequestRow
                  key={leave.id}
                  leave={leave}
                  employeeMap={employeeMap}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions + Recent Activity */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Quick Actions */}
        <Card className="h-full">
          <CardHeader className="border-b pb-5">
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-1">
            {[
              { to: "/hr/leaves", label: "Review Leave Requests", icon: PlaneTakeoff, desc: pendingLeaves.length > 0 ? `${pendingLeaves.length} pending` : "All reviewed" },
              { to: "/hr/employees", label: "Manage Employees", icon: Users, desc: `${employees.length} team members` },
              { to: "/hr/attendance", label: "View Attendance", icon: CalendarCheck2, desc: `${todayRecords.length} records today` },
              { to: "/hr/payroll", label: "Process Payroll", icon: Banknote, desc: "Manage salaries" },
              { to: "/hr/reports", label: "View Reports", icon: LayoutDashboard, desc: "Analytics & charts" },
            ].map((action) => (
              <Link key={action.to} to={action.to}>
                <div className="group hover:border-primary/30 hover:bg-primary/[0.03] flex items-center gap-3 rounded-xl border border-border/70 px-3 py-3 transition-colors">
                  <div className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-xl">
                    <action.icon className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{action.label}</p>
                    <p className="text-muted-foreground text-xs">{action.desc}</p>
                  </div>
                  <ArrowRight className="text-muted-foreground size-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="h-full">
          <CardHeader className="border-b pb-5">
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates and notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-1">
            {recentNotifications.length === 0 ? (
              <p className="text-muted-foreground py-6 text-center text-sm">No recent activity.</p>
            ) : (
              recentNotifications.map((n) => (
                <div
                  key={n.id}
                  className="flex items-start justify-between gap-3 border-b pb-3 last:border-b-0 last:pb-0"
                >
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
          </CardContent>
        </Card>
      </div>
    </>
  )
}

function LeaveRequestRow({
  leave,
  employeeMap,
}: {
  leave: LeaveRequest
  employeeMap: Map<string, Employee>
}) {
  const emp = employeeMap.get(leave.employeeId)

  return (
    <div className="hover:bg-muted/50 flex items-center justify-between gap-4 rounded-lg border px-4 py-3 transition-colors">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">
          {emp ? `${emp.firstName} ${emp.lastName}` : leave.employeeId}
        </p>
        <p className="text-muted-foreground text-xs">
          <span className="capitalize">{leave.type}</span> leave · {leave.days} day
          {leave.days > 1 ? "s" : ""} ·{" "}
          {new Date(leave.startDate + "T00:00:00").toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}{" "}
          →{" "}
          {new Date(leave.endDate + "T00:00:00").toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </p>
        {leave.reason ? (
          <p className="text-muted-foreground mt-1 line-clamp-1 text-xs italic">
            "{leave.reason}"
          </p>
        ) : null}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <StatusPill status={leave.status} />
      </div>
    </div>
  )
}
