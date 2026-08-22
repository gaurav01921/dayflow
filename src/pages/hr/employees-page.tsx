import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { Users, Search, Briefcase } from "lucide-react"

import { PageHeader } from "@/components/shared/page-header"
import { StatusPill } from "@/components/shared/status-pill"
import { LoadingState } from "@/components/shared/loading-state"
import { EmptyState } from "@/components/shared/empty-state"
import { ErrorState } from "@/components/shared/error-state"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { employeeService } from "@/services/employeeService"
import { attendanceService } from "@/services/attendanceService"
import { formatDate } from "@/lib/utils"
import { toISODate } from "@/mocks/mockDb"
import type { Employee } from "@/types/api"

export function HrEmployeesPage() {
  const [search, setSearch] = useState("")
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)

  const {
    data: employees = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["employees"],
    queryFn: employeeService.list,
  })

  const { data: attendance = [] } = useQuery({
    queryKey: ["attendance"],
    queryFn: () => attendanceService.list(),
  })

  const todayISO = toISODate(new Date())
  const todayAttendance = new Map(
    attendance
      .filter((r) => r.date === todayISO)
      .map((r) => [r.employeeId, r.status]),
  )

  const filtered = employees.filter((emp) => {
    const q = search.toLowerCase()
    return (
      emp.firstName.toLowerCase().includes(q) ||
      emp.lastName.toLowerCase().includes(q) ||
      emp.employeeCode.toLowerCase().includes(q) ||
      emp.department.toLowerCase().includes(q) ||
      emp.position.toLowerCase().includes(q)
    )
  })

  if (error) return <ErrorState error={error} onRetry={() => refetch()} />

  return (
    <>
      <PageHeader
        title="Employees"
        description={`${employees.length} team member${employees.length !== 1 ? "s" : ""} in the organization.`}
      />

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="text-muted-foreground absolute top-2.5 left-2.5 size-4" />
        <Input
          placeholder="Search by name, ID, department…"
          className="pl-8"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <LoadingState label="Loading employees…" />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No employees found"
          description={search ? "Try a different search term." : "No employees in the system yet."}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="text-muted-foreground px-3 py-2 font-medium">Employee</th>
                    <th className="text-muted-foreground px-3 py-2 font-medium">ID</th>
                    <th className="text-muted-foreground px-3 py-2 font-medium">Department</th>
                    <th className="text-muted-foreground px-3 py-2 font-medium">Position</th>
                    <th className="text-muted-foreground px-3 py-2 font-medium">Type</th>
                    <th className="text-muted-foreground px-3 py-2 font-medium">Today</th>
                    <th className="text-muted-foreground px-3 py-2 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((emp) => (
                    <tr key={emp.id} className="hover:bg-muted/50 border-b last:border-0">
                      <td className="px-3 py-2.5">
                        <div>
                          <p className="font-medium">
                            {emp.firstName} {emp.lastName}
                          </p>
                          <p className="text-muted-foreground text-xs">{emp.email}</p>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 font-mono text-xs">{emp.employeeCode}</td>
                      <td className="px-3 py-2.5">{emp.department}</td>
                      <td className="px-3 py-2.5">{emp.position}</td>
                      <td className="px-3 py-2.5">
                        <Badge variant="secondary" className="capitalize">
                          {emp.employmentType}
                        </Badge>
                      </td>
                      <td className="px-3 py-2.5">
                        {todayAttendance.has(emp.id) ? (
                          <StatusPill status={todayAttendance.get(emp.id)!} />
                        ) : (
                          <span className="text-muted-foreground text-xs">No record</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedEmployee(emp)}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Employee detail dialog */}
      <Dialog open={!!selectedEmployee} onOpenChange={(open) => !open && setSelectedEmployee(null)}>
        <DialogContent className="sm:max-w-lg">
          {selectedEmployee ? (
            <>
              <DialogHeader>
                <DialogTitle>
                  {selectedEmployee.firstName} {selectedEmployee.lastName}
                </DialogTitle>
                <DialogDescription>{selectedEmployee.email}</DialogDescription>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <Row label="Employee ID" value={selectedEmployee.employeeCode} />
                <Row label="Phone" value={selectedEmployee.phone || "—"} />
                <Row label="Department" value={selectedEmployee.department} />
                <Row label="Position" value={selectedEmployee.position} />
                <Row label="Employment" value={<Badge variant="secondary" className="capitalize">{selectedEmployee.employmentType}</Badge>} />
                <Row label="Joined" value={formatDate(selectedEmployee.joinDate)} />
                <Row label="Role" value={<Badge variant="info">{selectedEmployee.role.toUpperCase()}</Badge>} />
                <Row label="Address" value={selectedEmployee.address || "—"} />
                {selectedEmployee.documents.length > 0 && (
                  <div className="border-t pt-3">
                    <p className="text-muted-foreground mb-2 text-xs font-medium">Documents</p>
                    {selectedEmployee.documents.map((doc) => (
                      <div key={doc.id} className="flex items-center gap-2 py-1">
                        <Briefcase className="text-muted-foreground size-3" />
                        <span>{doc.name}</span>
                        <span className="text-muted-foreground text-xs">({doc.category})</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b pb-2 last:border-b-0 last:pb-0">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
