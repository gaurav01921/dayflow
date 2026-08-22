import { useQuery } from "@tanstack/react-query"
import {
  ArrowRight,
  Banknote,
  CalendarCheck2,
  ChartColumn,
  Clock,
  PlaneTakeoff,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react"
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
import { formatCurrency } from "@/lib/utils"
import { notificationService } from "@/services/notificationService"
import { reportService } from "@/services/reportService"
import { useAuthStore } from "@/stores/authStore"

export function HrDashboardPage() {
  const user = useAuthStore((s) => s.user)

  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => reportService.dashboardStats(),
  })

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: notificationService.list,
    refetchInterval: 30_000,
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Executive HR Dashboard · ${user?.employeeCode ?? "Manager"}`}
        description="Comprehensive overview of organizational workforce, attendance trends, and approval workflows."
      />

      {stats ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            title="Total Employees"
            value={stats.totalEmployees}
            hint="Active team members"
            icon={Users}
            tone="primary"
          />
          <StatCard
            title="Present Today"
            value={stats.presentToday}
            hint="In-office attendance"
            icon={UserCheck}
            tone="success"
          />
          <StatCard
            title="On Leave Today"
            value={stats.onLeaveToday}
            hint="Scheduled time off"
            icon={PlaneTakeoff}
            tone="info"
          />
          <StatCard
            title="Pending Leaves"
            value={stats.pendingLeaveRequests}
            hint="Awaiting HR approval"
            icon={Clock}
            tone={stats.pendingLeaveRequests > 0 ? "warning" : "info"}
          />
          <StatCard
            title="Monthly Payroll"
            value={formatCurrency(stats.monthlyPayrollTotal)}
            hint="Total monthly volume"
            icon={Banknote}
            tone="primary"
          />
        </div>
      ) : null}

      {/* Quick Access Modules Navigation */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            to: "/hr/employees",
            title: "Employee Directory",
            desc: "View and filter all workforce cards",
            icon: Users,
            color: "text-primary bg-primary/10",
          },
          {
            to: "/hr/attendance",
            title: "Workforce Attendance",
            desc: "Daily clock-in logs and date tracking",
            icon: CalendarCheck2,
            color: "text-success bg-success/10",
          },
          {
            to: "/hr/leaves",
            title: "Leave Approvals",
            desc: "Review and act on pending absence filings",
            icon: PlaneTakeoff,
            color: "text-warning bg-warning/15",
          },
          {
            to: "/hr/reports",
            title: "Analytics & Reports",
            desc: "Attendance trends and department charts",
            icon: ChartColumn,
            color: "text-info bg-info/10",
          },
        ].map((item) => (
          <Link key={item.to} to={item.to}>
            <Card className="hover:border-primary/50 h-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer border-border/80">
              <CardContent className="flex items-center justify-between p-5">
                <div className="flex items-center gap-3.5">
                  <div className={`flex size-10 items-center justify-center rounded-xl ${item.color}`}>
                    <item.icon className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.title}</p>
                    <p className="text-muted-foreground text-xs">{item.desc}</p>
                  </div>
                </div>
                <ArrowRight className="text-muted-foreground size-4 shrink-0" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Activity & Operational Feed */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2 border-border/80 shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Live System Activity</CardTitle>
            <CardDescription>Real-time notifications and operational updates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {notifications.length === 0 ? (
              <p className="text-muted-foreground text-sm py-6 text-center">No recent activity logged.</p>
            ) : (
              notifications.slice(0, 5).map((n) => (
                <div
                  key={n.id}
                  className="flex items-start justify-between gap-3 border-b border-border/50 pb-3 last:border-b-0 last:pb-0"
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-foreground">{n.title}</p>
                    <p className="text-muted-foreground text-xs">{n.message}</p>
                  </div>
                  <span className="text-muted-foreground text-[11px] shrink-0 font-mono">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Quick Operations Panel */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="size-4 text-primary" /> Action Center
            </CardTitle>
            <CardDescription>Common administrator tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5">
            <Button asChild className="w-full justify-between" size="sm">
              <Link to="/hr/leaves">
                <span>Review Pending Leaves</span>
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-between" size="sm">
              <Link to="/hr/attendance">
                <span>Verify Today's Clock-Ins</span>
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-between" size="sm">
              <Link to="/hr/payroll">
                <span>Manage Monthly Payroll</span>
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="ghost" className="w-full justify-between text-muted-foreground" size="sm">
              <Link to="/hr/reports">
                <span>Generate HR Reports</span>
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default HrDashboardPage