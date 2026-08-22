import { useQuery } from "@tanstack/react-query"

import { PageHeader } from "@/components/shared/page-header"
import { StatCard } from "@/components/dashboard/stat-card"

import { reportService } from "@/services/reportService"

export function HrDashboardPage() {
  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => reportService.dashboardStats(),
  })

  return (
    <>
      <PageHeader title="HR Dashboard" description="Overview of your workforce" />

      {stats ? (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-5">
          <div className="flex-0 sm:col-span-2">
            <StatCard
              title="Total Employees"
              value={stats.totalEmployees.toString()}
              tone="primary"
            />
          </div>
          <StatCard title="Present Today" value={stats.presentToday.toString()} tone="success" />
          <StatCard title="On Leave" value={stats.onLeaveToday.toString()} tone="warning" />
          <StatCard title="Pending" value={stats.pendingLeaveRequests.toString()} tone="warning" />
          <StatCard title="Payroll" value={stats.monthlyPayrollTotal.toString()} tone="info" />
        </div>
      ) : null}
    </>
  )
}