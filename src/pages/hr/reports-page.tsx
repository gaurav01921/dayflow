import { useQuery } from "@tanstack/react-query"
import {
  Banknote,
  CalendarCheck2,
  ChartBar,
  ChartPie,
  TrendingUp,
  Users,
} from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { StatCard } from "@/components/dashboard/stat-card"
import { PageHeader } from "@/components/shared/page-header"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { reportService } from "@/services/reportService"

const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#06b6d4", "#ec4899", "#8b5cf6"]

export function HrReportsPage() {
  const { data: stats } = useQuery({
    queryKey: ["reports", "dashboard-stats"],
    queryFn: reportService.dashboardStats,
  })

  const { data: attendanceTrends = [] } = useQuery({
    queryKey: ["reports", "attendance"],
    queryFn: () => reportService.attendanceReport(14),
  })

  const { data: payrollReport } = useQuery({
    queryKey: ["reports", "payroll"],
    queryFn: reportService.payrollReport,
  })

  const deptData =
    payrollReport?.byDepartment.map((d) => ({
      name: d.department,
      value: d.totalNet,
    })) ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workforce Reports & Analytics"
        description="Visualize workforce attendance trends, departmental payroll distribution, and key organizational metrics."
      />

      {/* Summary KPI Cards */}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Headcount"
            value={stats.totalEmployees}
            hint="Active team members"
            icon={Users}
            tone="primary"
          />
          <StatCard
            title="Present Today"
            value={stats.presentToday}
            hint="In-office attendance"
            icon={CalendarCheck2}
            tone="success"
          />
          <StatCard
            title="Leaves Active"
            value={stats.onLeaveToday}
            hint="Scheduled time off"
            icon={TrendingUp}
            tone="warning"
          />
          <StatCard
            title="Monthly Payroll"
            value={formatCurrency(stats.monthlyPayrollTotal)}
            hint="Total payroll volume"
            icon={Banknote}
            tone="info"
          />
        </div>
      )}

      {/* Analytics Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Attendance Trend Chart */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <ChartBar className="size-4 text-primary" /> Attendance Trends (Last 14 Days)
            </CardTitle>
            <CardDescription>Daily present vs on-leave headcount breakdown</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {attendanceTrends.length === 0 ? (
              <p className="text-muted-foreground text-center py-20 text-sm">No trend data available.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(v) => v.slice(5)}
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                  />
                  <YAxis tickLine={false} axisLine={false} fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-card)",
                      borderColor: "var(--color-border)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Bar dataKey="present" name="Present" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="onLeave" name="On Leave" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="absent" name="Absent" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Department Payroll Breakdown */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <ChartPie className="size-4 text-primary" /> Payroll By Department
            </CardTitle>
            <CardDescription>Distribution of net salaries across business units</CardDescription>
          </CardHeader>
          <CardContent className="h-80 flex flex-col items-center justify-center">
            {deptData.length === 0 ? (
              <p className="text-muted-foreground text-center py-20 text-sm">No department data available.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deptData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {deptData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => [formatCurrency(Number(val)), "Net Payroll"]}
                    contentStyle={{
                      backgroundColor: "var(--color-card)",
                      borderColor: "var(--color-border)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default HrReportsPage
