import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { CalendarCheck2, Search } from "lucide-react"

import { PageHeader } from "@/components/shared/page-header"
import { StatusPill } from "@/components/shared/status-pill"
import { LoadingState } from "@/components/shared/loading-state"
import { EmptyState } from "@/components/shared/empty-state"
import { ErrorState } from "@/components/shared/error-state"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { attendanceService } from "@/services/attendanceService"
import { employeeService } from "@/services/employeeService"
import { toISODate } from "@/mocks/mockDb"
import type { Employee } from "@/types/api"

function formatTime(iso: string | null): string {
  if (!iso) return "—"
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

export function HrAttendancePage() {
  const [employeeFilter, setEmployeeFilter] = useState<string>("all")
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 14)
    return toISODate(d)
  })
  const [dateTo, setDateTo] = useState(() => toISODate(new Date()))
  const [search, setSearch] = useState("")

  const {
    data: records = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["attendance", employeeFilter, dateFrom, dateTo],
    queryFn: () =>
      attendanceService.list({
        employeeId: employeeFilter === "all" ? undefined : employeeFilter,
        from: dateFrom,
        to: dateTo,
      }),
  })

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: employeeService.list,
  })

  const employeeMap = new Map<string, Employee>(
    employees.map((e) => [e.id, e]),
  )

  const filteredRecords = records.filter((r) => {
    if (!search) return true
    const emp = employeeMap.get(r.employeeId)
    if (!emp) return false
    const q = search.toLowerCase()
    return (
      emp.firstName.toLowerCase().includes(q) ||
      emp.lastName.toLowerCase().includes(q) ||
      emp.employeeCode.toLowerCase().includes(q)
    )
  })

  if (error) return <ErrorState error={error} onRetry={() => refetch()} />

  return (
    <>
      <PageHeader
        title="Attendance"
        description="View attendance records for all employees."
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-xs flex-1">
          <Search className="text-muted-foreground absolute top-2.5 left-2.5 size-4" />
          <Input
            placeholder="Search employee…"
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All employees" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All employees</SelectItem>
            {employees.map((emp) => (
              <SelectItem key={emp.id} value={emp.id}>
                {emp.firstName} {emp.lastName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="date"
          className="w-[150px]"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
        />
        <span className="text-muted-foreground text-sm">to</span>
        <Input
          type="date"
          className="w-[150px]"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
        />
      </div>

      {isLoading ? (
        <LoadingState label="Loading attendance records…" />
      ) : filteredRecords.length === 0 ? (
        <EmptyState
          icon={CalendarCheck2}
          title="No attendance records"
          description="No records found for the selected filters."
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              Attendance Records
              <span className="text-muted-foreground ml-2 text-sm font-normal">
                ({filteredRecords.length} record{filteredRecords.length !== 1 ? "s" : ""})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="text-muted-foreground px-3 py-2 font-medium">Employee</th>
                    <th className="text-muted-foreground px-3 py-2 font-medium">Date</th>
                    <th className="text-muted-foreground px-3 py-2 font-medium">Check In</th>
                    <th className="text-muted-foreground px-3 py-2 font-medium">Check Out</th>
                    <th className="text-muted-foreground px-3 py-2 font-medium">Hours</th>
                    <th className="text-muted-foreground px-3 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((record) => {
                    const emp = employeeMap.get(record.employeeId)
                    return (
                      <tr key={record.id} className="hover:bg-muted/50 border-b last:border-0">
                        <td className="px-3 py-2.5">
                          <div>
                            <p className="font-medium">
                              {emp ? `${emp.firstName} ${emp.lastName}` : record.employeeId}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              {emp?.employeeCode ?? "—"}
                            </p>
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          {new Date(record.date + "T00:00:00").toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                        <td className="px-3 py-2.5 tabular-nums">{formatTime(record.checkIn)}</td>
                        <td className="px-3 py-2.5 tabular-nums">{formatTime(record.checkOut)}</td>
                        <td className="px-3 py-2.5 tabular-nums">{record.hoursWorked}h</td>
                        <td className="px-3 py-2.5">
                          <StatusPill status={record.status} />
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
    </>
  )
}
