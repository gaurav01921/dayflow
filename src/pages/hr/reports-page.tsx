import { useQuery } from "@tanstack/react-query"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts"

import { PageHeader } from "@/components/shared/page-header"
import { LoadingState } from "@/components/shared/loading-state"
import { ErrorState } from "@/components/shared/error-state"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { reportService } from "@/services/reportService"

const CHART_COLORS = {
  present: "#22c55e",
  absent: "#ef4444",
  halfDay: "#f59e0b",
  onLeave: "#6366f1",
} as const

const PIE_COLORS = ["#22c55e", "#ef4444", "#f59e0b", "#6366f1"]

export function HrReportsPage() {
  const {
    data: attendanceData = [],
    isLoading: attendanceLoading,
    error: attendanceError,
    refetch: refetchAttendance,
  } = useQuery({
    queryKey: ["reports", "attendance"],
    queryFn: () => reportService.attendanceReport(14),
  })

  const {
    data: payrollData,
    isLoading: payrollLoading,
    error: payrollError,
    refetch: refetchPayroll,
  } = useQuery({
    queryKey: ["reports", "payroll"],
    queryFn: reportService.payrollReport,
  })

  if (attendanceError) return <ErrorState error={attendanceError} onRetry={() => refetchAttendance()} />
  if (payrollError) return <ErrorState error={payrollError} onRetry={() => refetchPayroll()} />

  // Aggregate attendance totals for pie chart
  const attendanceTotals = attendanceData.reduce(
    (acc, row) => ({
      present: acc.present + row.present,
      absent: acc.absent + row.absent,
      halfDay: acc.halfDay + row.halfDay,
      onLeave: acc.onLeave + row.onLeave,
    }),
    { present: 0, absent: 0, halfDay: 0, onLeave: 0 },
  )

  const pieData = [
    { name: "Present", value: attendanceTotals.present },
    { name: "Absent", value: attendanceTotals.absent },
    { name: "Half-day", value: attendanceTotals.halfDay },
    { name: "On Leave", value: attendanceTotals.onLeave },
  ].filter((d) => d.value > 0)

  return (
    <>
      <PageHeader
        title="Reports"
        description="Attendance and payroll analytics for the organization."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Attendance Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance Overview (14 days)</CardTitle>
          </CardHeader>
          <CardContent>
            {attendanceLoading ? (
              <LoadingState label="Loading attendance report…" />
            ) : attendanceData.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center text-sm">No attendance data available.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(v: string) => {
                      const d = new Date(v + "T00:00:00")
                      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    }}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    labelFormatter={(label) =>
                      new Date(String(label) + "T00:00:00").toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })
                    }
                  />
                  <Legend />
                  <Bar dataKey="present" fill={CHART_COLORS.present} name="Present" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="absent" fill={CHART_COLORS.absent} name="Absent" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="halfDay" fill={CHART_COLORS.halfDay} name="Half-day" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="onLeave" fill={CHART_COLORS.onLeave} name="On Leave" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Attendance Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {attendanceLoading ? (
              <LoadingState label="Loading…" />
            ) : pieData.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center text-sm">No data to display.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                  >
                    {pieData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Payroll by Department */}
        <Card>
          <CardHeader>
            <CardTitle>Payroll by Department</CardTitle>
          </CardHeader>
          <CardContent>
            {payrollLoading ? (
              <LoadingState label="Loading payroll report…" />
            ) : !payrollData || payrollData.byDepartment.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center text-sm">No payroll data available.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={payrollData.byDepartment} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis type="number" tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="department" tick={{ fontSize: 12 }} width={100} />
                  <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, "Net Pay"]} />
                  <Bar dataKey="totalNet" fill="#6366f1" name="Net Pay" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Payroll Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Payroll Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {payrollLoading ? (
              <LoadingState label="Loading…" />
            ) : !payrollData ? (
              <p className="text-muted-foreground py-8 text-center text-sm">No data available.</p>
            ) : (
              <div className="space-y-3">
                <SummaryRow label="Month" value={payrollData.month} />
                <SummaryRow label="Total Base Salary" value={`$${payrollData.totalBase.toLocaleString()}`} />
                <SummaryRow label="Total Allowances" value={`$${payrollData.totalAllowances.toLocaleString()}`} />
                <SummaryRow label="Total Bonus" value={`$${payrollData.totalBonus.toLocaleString()}`} />
                <SummaryRow
                  label="Total Deductions"
                  value={`−$${payrollData.totalDeductions.toLocaleString()}`}
                  destructive
                />
                <div className="border-t pt-3">
                  <SummaryRow
                    label="Total Net Pay"
                    value={`$${payrollData.totalNet.toLocaleString()}`}
                    highlight
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}

function SummaryRow({
  label,
  value,
  destructive = false,
  highlight = false,
}: {
  label: string
  value: string
  destructive?: boolean
  highlight?: boolean
}) {
  return (
    <div className="flex items-center justify-between border-b pb-2 last:border-b-0 last:pb-0">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span
        className={`font-semibold tabular-nums ${
          destructive ? "text-destructive" : highlight ? "text-primary" : ""
        }`}
      >
        {value}
      </span>
    </div>
  )
}
