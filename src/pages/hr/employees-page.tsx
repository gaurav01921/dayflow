import { useQuery } from "@tanstack/react-query"
import { Building2, SearchX } from "lucide-react"
import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"

import { PageHeader } from "@/components/shared/page-header"
import { EmployeeCard } from "@/components/ui/employee-card"
import { SearchBar } from "@/components/ui/search-bar"
import { Skeleton } from "@/components/ui/skeleton"
import { attendanceService } from "@/services/attendanceService"
import { employeeService } from "@/services/employeeService"
import type { AttendanceStatus, Employee } from "@/types/api"

export function HrEmployeesPage() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDept, setSelectedDept] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")

  const { data: employees = [], isLoading: loadingEmployees } = useQuery({
    queryKey: ["employees"],
    queryFn: employeeService.list,
  })

  const { data: attendance = [] } = useQuery({
    queryKey: ["attendance", "all"],
    queryFn: () => attendanceService.list(),
  })

  const attendanceMap = useMemo(() => {
    const todayISO = new Date().toISOString().slice(0, 10)
    const map = new Map<string, AttendanceStatus>()
    for (const record of attendance) {
      if (record.date === todayISO) {
        map.set(record.employeeId, record.status)
      }
    }
    return map
  }, [attendance])

  const departments = useMemo(() => {
    const set = new Set<string>()
    for (const emp of employees) {
      if (emp.department) set.add(emp.department)
    }
    return Array.from(set)
  }, [employees])

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase()
      const matchesSearch =
        fullName.includes(searchTerm.toLowerCase()) ||
        emp.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.department.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesDept = selectedDept === "all" || emp.department === selectedDept
      const status = attendanceMap.get(emp.id) ?? "present"
      const matchesStatus = selectedStatus === "all" || status === selectedStatus

      return matchesSearch && matchesDept && matchesStatus
    })
  }, [employees, searchTerm, selectedDept, selectedStatus, attendanceMap])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workforce Management"
        description="View employee records, manage role assignments, and oversee team distribution."
      />

      {/* Search and Filters Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchBar
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onClear={() => setSearchTerm("")}
          placeholder="Search by name, role, ID, or department…"
          className="w-full sm:max-w-md"
        />

        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-muted-foreground font-medium mr-1 hidden md:inline">Status:</span>
          {(["all", "present", "absent", "leave"] as const).map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`rounded-full px-3 py-1 font-medium capitalize transition-colors cursor-pointer ${
                selectedStatus === st
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              {st === "all" ? "All Status" : st === "leave" ? "On Leave" : st}
            </button>
          ))}
        </div>
      </div>

      {/* Department Filter Pills */}
      {departments.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-muted-foreground font-medium mr-1 flex items-center gap-1 shrink-0">
            <Building2 className="size-3.5" /> Dept:
          </span>
          <button
            onClick={() => setSelectedDept("all")}
            className={`rounded-md px-2.5 py-1 font-medium transition-colors shrink-0 cursor-pointer ${
              selectedDept === "all"
                ? "bg-foreground text-background font-semibold"
                : "bg-muted/60 text-muted-foreground hover:bg-muted"
            }`}
          >
            All ({employees.length})
          </button>
          {departments.map((dept) => {
            const count = employees.filter((e) => e.department === dept).length
            return (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`rounded-md px-2.5 py-1 font-medium transition-colors shrink-0 cursor-pointer ${
                  selectedDept === dept
                    ? "bg-foreground text-background font-semibold"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted"
                }`}
              >
                {dept} ({count})
              </button>
            )
          })}
        </div>
      )}

      {/* Grid of Employee Cards */}
      {loadingEmployees ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border p-5 space-y-3">
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-14" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex gap-3 items-center">
                <Skeleton className="size-12 rounded-full" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <SearchX className="text-muted-foreground size-10 mb-2" />
          <h3 className="text-base font-semibold text-foreground">No employees found</h3>
          <p className="text-muted-foreground text-xs mt-1 max-w-sm">
            {searchTerm || selectedDept !== "all" || selectedStatus !== "all"
              ? "Try adjusting your search terms or department filters."
              : "No employee records are available at the moment."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEmployees.map((employee: Employee) => (
            <EmployeeCard
              key={employee.id}
              employee={employee}
              attendanceStatus={attendanceMap.get(employee.id) ?? "present"}
              onClick={() => navigate(`/hr/profile/${employee.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default HrEmployeesPage
