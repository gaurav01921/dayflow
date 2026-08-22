import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { PlaneTakeoff } from "lucide-react"

import { LeaveReviewDialog } from "@/features/admin/leave-review-dialog"
import { PageHeader } from "@/components/shared/page-header"
import { StatusPill } from "@/components/shared/status-pill"
import { LoadingState } from "@/components/shared/loading-state"
import { EmptyState } from "@/components/shared/empty-state"
import { ErrorState } from "@/components/shared/error-state"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { leaveService } from "@/services/leaveService"
import { employeeService } from "@/services/employeeService"
import type { Employee, LeaveRequest } from "@/types/api"

function formatDateShort(date: string): string {
  return new Date(date + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

export function HrLeavesPage() {
  const [reviewTarget, setReviewTarget] = useState<LeaveRequest | null>(null)
  const [statusFilter, setStatusFilter] = useState<LeaveRequest["status"] | "all">("all")

  const {
    data: leaves = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["leaves"],
    queryFn: () => leaveService.list(),
  })

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: employeeService.list,
  })

  const employeeMap = new Map<string, Employee>(
    employees.map((e) => [e.id, e]),
  )

  const filteredLeaves =
    statusFilter === "all"
      ? leaves
      : leaves.filter((l) => l.status === statusFilter)

  const pendingCount = leaves.filter((l) => l.status === "pending").length

  if (error) return <ErrorState error={error} onRetry={() => refetch()} />

  return (
    <>
      <PageHeader
        title="Leave Approvals"
        description={`${pendingCount} pending request${pendingCount !== 1 ? "s" : ""} awaiting review.`}
      />

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(["all", "pending", "approved", "rejected"] as const).map((tab) => (
          <Button
            key={tab}
            variant={statusFilter === tab ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(tab)}
          >
            {tab === "all" ? "All" : tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab === "pending" && pendingCount > 0 ? (
              <span className="bg-primary-foreground text-primary ml-1 rounded-full px-1.5 text-xs font-bold">
                {pendingCount}
              </span>
            ) : null}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <LoadingState label="Loading leave requests…" />
      ) : filteredLeaves.length === 0 ? (
        <EmptyState
          icon={PlaneTakeoff}
          title="No leave requests"
          description={
            statusFilter === "all"
              ? "Employees haven't submitted any leave requests yet."
              : `No ${statusFilter} leave requests found.`
          }
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              {statusFilter === "all" ? "All Requests" : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1) + " Requests"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="text-muted-foreground px-3 py-2 font-medium">Employee</th>
                    <th className="text-muted-foreground px-3 py-2 font-medium">Type</th>
                    <th className="text-muted-foreground px-3 py-2 font-medium">Dates</th>
                    <th className="text-muted-foreground px-3 py-2 font-medium">Days</th>
                    <th className="text-muted-foreground px-3 py-2 font-medium">Remarks</th>
                    <th className="text-muted-foreground px-3 py-2 font-medium">Submitted</th>
                    <th className="text-muted-foreground px-3 py-2 font-medium">Status</th>
                    <th className="text-muted-foreground px-3 py-2 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeaves.map((leave) => {
                    const emp = employeeMap.get(leave.employeeId)
                    return (
                      <tr key={leave.id} className="hover:bg-muted/50 border-b last:border-0">
                        <td className="px-3 py-2.5">
                          <div>
                            <p className="font-medium">
                              {emp ? `${emp.firstName} ${emp.lastName}` : leave.employeeId}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              {emp?.employeeCode ?? "—"}
                            </p>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 capitalize">{leave.type}</td>
                        <td className="px-3 py-2.5">
                          {formatDateShort(leave.startDate)} → {formatDateShort(leave.endDate)}
                        </td>
                        <td className="px-3 py-2.5 tabular-nums">{leave.days}</td>
                        <td
                          className="text-muted-foreground max-w-[200px] truncate px-3 py-2.5"
                          title={leave.reason}
                        >
                          {leave.reason || "—"}
                        </td>
                        <td className="text-muted-foreground px-3 py-2.5">
                          {formatDateShort(leave.createdAt)}
                        </td>
                        <td className="px-3 py-2.5">
                          <StatusPill status={leave.status} />
                        </td>
                        <td className="px-3 py-2.5">
                          {leave.status === "pending" ? (
                            <Button
                              size="sm"
                              onClick={() => setReviewTarget(leave)}
                            >
                              Review
                            </Button>
                          ) : (
                            <span className="text-muted-foreground text-xs">
                              {leave.reviewerComment ?? "—"}
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <LeaveReviewDialog
        leave={reviewTarget}
        onClose={() => setReviewTarget(null)}
      />
    </>
  )
}
