import { useQuery } from "@tanstack/react-query"
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  XCircle,
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
import { SearchBar } from "@/components/ui/search-bar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LeaveReviewDialog } from "@/features/admin/leave-review-dialog"
import { employeeService } from "@/services/employeeService"
import { leaveService } from "@/services/leaveService"
import type { Employee, LeaveRequest, LeaveStatus } from "@/types/api"

export function HrLeavesPage() {
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")

  const { data: leaves = [], isLoading: loadingLeaves } = useQuery({
    queryKey: ["leaves", "all"],
    queryFn: () => leaveService.list(),
  })

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: employeeService.list,
  })

  const employeeMap = useMemo(() => {
    const map = new Map<string, Employee>()
    for (const emp of employees) {
      map.set(emp.id, emp)
    }
    return map
  }, [employees])

  const typedLeaves = leaves as LeaveRequest[]
  const pendingCount = typedLeaves.filter((l) => l.status === "pending").length
  const approvedCount = typedLeaves.filter((l) => l.status === "approved").length
  const rejectedCount = typedLeaves.filter((l) => l.status === "rejected").length

  const filteredLeaves = useMemo(() => {
    return typedLeaves.filter((l) => {
      const emp = employeeMap.get(l.employeeId)
      const empName = emp ? `${emp.firstName} ${emp.lastName}` : l.employeeId
      const empCode = emp ? emp.employeeCode : ""
      const search = searchTerm.toLowerCase()

      const matchesSearch =
        empName.toLowerCase().includes(search) ||
        empCode.toLowerCase().includes(search) ||
        l.type.toLowerCase().includes(search) ||
        l.reason.toLowerCase().includes(search)

      const matchesStatus = statusFilter === "all" || l.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [typedLeaves, employeeMap, searchTerm, statusFilter])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave Approvals & Time Off"
        description="Review time-off requests, authorize employee absence allocations, and leave reviewer remarks."
      />

      {/* Review Dialog */}
      <LeaveReviewDialog
        leave={selectedLeave}
        onClose={() => setSelectedLeave(null)}
      />

      {/* Summary KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Pending Approvals"
          value={pendingCount}
          hint="Requests awaiting review"
          icon={Clock}
          tone={pendingCount > 0 ? "warning" : "info"}
        />
        <StatCard
          title="Approved Leaves"
          value={approvedCount}
          hint="Processed active leaves"
          icon={CheckCircle2}
          tone="success"
        />
        <StatCard
          title="Declined Requests"
          value={rejectedCount}
          hint="Rejected leave filings"
          icon={XCircle}
          tone={rejectedCount > 0 ? "destructive" : "info"}
        />
      </div>

      {/* Requests Ledger Table */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
          <div>
            <CardTitle className="text-base font-semibold">Workforce Leave Ledger</CardTitle>
            <CardDescription>Authorize or decline submitted absence requests</CardDescription>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <SearchBar
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClear={() => setSearchTerm("")}
              placeholder="Search employee or reason…"
              className="w-full sm:w-56"
            />

            <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-auto">
              <TabsList className="h-9">
                <TabsTrigger value="all" className="text-xs px-2.5">
                  All ({typedLeaves.length})
                </TabsTrigger>
                <TabsTrigger value="pending" className="text-xs px-2.5">
                  Pending ({pendingCount})
                </TabsTrigger>
                <TabsTrigger value="approved" className="text-xs px-2.5">
                  Approved ({approvedCount})
                </TabsTrigger>
                <TabsTrigger value="rejected" className="text-xs px-2.5">
                  Rejected ({rejectedCount})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>

        <CardContent>
          {loadingLeaves ? (
            <p className="text-muted-foreground py-10 text-center text-sm">Loading leave applications…</p>
          ) : filteredLeaves.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <CalendarDays className="text-muted-foreground size-8" />
              <p className="text-sm font-semibold">No leave requests found</p>
              <p className="text-muted-foreground text-xs">
                {statusFilter === "all"
                  ? "No employee requests are currently registered in the database."
                  : `No requests with status "${statusFilter}".`}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <th className="px-4 py-3">Employee</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Duration</th>
                    <th className="px-4 py-3">Days</th>
                    <th className="px-4 py-3">Remarks</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredLeaves.map((l) => {
                    const emp = employeeMap.get(l.employeeId)
                    const empName = emp ? `${emp.firstName} ${emp.lastName}` : l.employeeId
                    const empCode = emp ? emp.employeeCode : ""

                    return (
                      <tr key={l.id} className="transition-colors hover:bg-muted/40">
                        <td className="px-4 py-3.5">
                          <div>
                            <p className="font-semibold text-foreground">{empName}</p>
                            <p className="font-mono text-xs text-muted-foreground">{empCode}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 capitalize font-medium text-foreground">{l.type}</td>
                        <td className="px-4 py-3.5 tabular-nums text-foreground">
                          {l.startDate} → {l.endDate}
                        </td>
                        <td className="px-4 py-3.5 tabular-nums font-semibold text-foreground">
                          {l.days} Day{l.days > 1 ? "s" : ""}
                        </td>
                        <td
                          className="text-muted-foreground max-w-[200px] truncate px-4 py-3.5 text-xs"
                          title={l.reason}
                        >
                          {l.reason || "—"}
                        </td>
                        <td className="px-4 py-3.5">
                          <StatusPill status={l.status as LeaveStatus} />
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          {l.status === "pending" ? (
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => setSelectedLeave(l)}
                              >
                                Review
                              </Button>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">Reviewed</span>
                          )}
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

export default HrLeavesPage
