import { Building2, ChevronRight, Mail, Phone, PlaneTakeoff } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { AttendanceStatus, Employee } from "@/types/api"

export interface EmployeeCardProps {
  employee: Employee
  attendanceStatus?: AttendanceStatus
  onClick?: () => void
  className?: string
}

export function EmployeeCard({
  employee,
  attendanceStatus = "present",
  onClick,
  className,
}: EmployeeCardProps) {
  const fullName = `${employee.firstName} ${employee.lastName}`
  const initials = `${employee.firstName?.[0] ?? ""}${employee.lastName?.[0] ?? ""}`.toUpperCase()

  return (
    <Card
      onClick={onClick}
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden border-border/80 p-5 transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-md cursor-pointer",
        className
      )}
    >
      {/* Top row: Employee ID & Top-Right Attendance Status Indicator */}
      <div className="flex items-start justify-between gap-2">
        <span className="font-mono text-[11px] font-semibold text-muted-foreground bg-muted/80 px-2 py-0.5 rounded">
          {employee.employeeCode}
        </span>

        {/* Status Indicator according to reference rules:
            - Green dot (🟢) = Present
            - Airplane icon (✈️) = On Leave
            - Yellow dot (🟡) = Absent */}
        {attendanceStatus === "leave" ? (
          <Badge variant="info" className="flex items-center gap-1 py-0.5 px-2 text-[11px] font-medium bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20">
            <PlaneTakeoff className="size-3" />
            <span>On Leave</span>
          </Badge>
        ) : attendanceStatus === "absent" ? (
          <Badge variant="warning" className="flex items-center gap-1.5 py-0.5 px-2 text-[11px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
            <span className="size-2 rounded-full bg-amber-500" />
            <span>Absent</span>
          </Badge>
        ) : attendanceStatus === "half-day" ? (
          <Badge variant="warning" className="flex items-center gap-1.5 py-0.5 px-2 text-[11px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
            <span className="size-2 rounded-full bg-amber-400" />
            <span>Half Day</span>
          </Badge>
        ) : (
          <Badge variant="success" className="flex items-center gap-1.5 py-0.5 px-2 text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Present</span>
          </Badge>
        )}
      </div>

      {/* Center content: Avatar and names */}
      <div className="my-4 flex items-center gap-3.5">
        <Avatar className="size-14 border-2 border-primary/10 shadow-xs group-hover:border-primary/30 transition-colors">
          <AvatarImage src={employee.avatarUrl} alt={fullName} />
          <AvatarFallback className="bg-primary/10 text-primary text-base font-bold">
            {initials || "DF"}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold tracking-tight text-foreground truncate group-hover:text-primary transition-colors">
            {fullName}
          </h3>
          <p className="text-xs font-medium text-muted-foreground truncate">
            {employee.position}
          </p>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
            <Building2 className="size-3 shrink-0" />
            <span className="truncate">{employee.department}</span>
          </div>
        </div>
      </div>

      {/* Bottom row: Contact info & profile action */}
      <div className="mt-2 border-t border-border/50 pt-3 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2 truncate">
          <div className="flex items-center gap-1 truncate" title={employee.email}>
            <Mail className="size-3.5 shrink-0" />
            <span className="truncate max-w-[120px]">{employee.email}</span>
          </div>
          {employee.phone ? (
            <div className="hidden sm:flex items-center gap-1" title={employee.phone}>
              <span>·</span>
              <Phone className="size-3.5 shrink-0" />
              <span className="truncate">{employee.phone}</span>
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-0.5 text-primary text-xs font-medium opacity-80 group-hover:opacity-100 transition-opacity">
          <span>View Profile</span>
          <ChevronRight className="size-3.5" />
        </div>
      </div>
    </Card>
  )
}
