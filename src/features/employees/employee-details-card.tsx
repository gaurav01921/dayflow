import { Briefcase, Building2, Calendar, Mail, MapPin, Phone, ShieldCheck } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import type { Employee } from "@/types/api"

interface EmployeeDetailsCardProps {
  employee: Employee
}

export function EmployeeDetailsCard({ employee }: EmployeeDetailsCardProps) {
  const fullName = `${employee.firstName} ${employee.lastName}`
  const initials = `${employee.firstName?.[0] ?? ""}${employee.lastName?.[0] ?? ""}`.toUpperCase()

  return (
    <Card className="overflow-hidden border-border/80 shadow-sm">
      <CardHeader className="bg-muted/20 border-b border-border/50 pb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="size-16 border-2 border-primary/20 shadow-sm">
              <AvatarImage src={employee.avatarUrl} alt={fullName} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                {initials || "EM"}
              </AvatarFallback>
            </Avatar>

            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl font-bold">{fullName}</CardTitle>
                <Badge variant="info" className="uppercase text-[10px]">
                  {employee.role}
                </Badge>
              </div>
              <CardDescription className="flex items-center gap-2 mt-1">
                <span className="font-mono text-xs font-semibold text-foreground/80 bg-muted px-2 py-0.5 rounded">
                  {employee.employeeCode}
                </span>
                <span>·</span>
                <span>{employee.position}</span>
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="capitalize">
              {employee.employmentType}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 grid gap-6 sm:grid-cols-2">
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Job Specifications
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between py-1 border-b border-border/40">
              <span className="text-muted-foreground flex items-center gap-2 text-xs">
                <Building2 className="size-3.5" /> Department
              </span>
              <span className="font-medium">{employee.department}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-border/40">
              <span className="text-muted-foreground flex items-center gap-2 text-xs">
                <Briefcase className="size-3.5" /> Position
              </span>
              <span className="font-medium">{employee.position}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-border/40">
              <span className="text-muted-foreground flex items-center gap-2 text-xs">
                <Calendar className="size-3.5" /> Date Joined
              </span>
              <span className="font-medium">{formatDate(employee.joinDate)}</span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-muted-foreground flex items-center gap-2 text-xs">
                <ShieldCheck className="size-3.5" /> Role Access
              </span>
              <span className="font-medium capitalize">{employee.role}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Contact Information
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between py-1 border-b border-border/40">
              <span className="text-muted-foreground flex items-center gap-2 text-xs">
                <Mail className="size-3.5" /> Email
              </span>
              <span className="font-medium truncate max-w-[200px]" title={employee.email}>
                {employee.email}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-border/40">
              <span className="text-muted-foreground flex items-center gap-2 text-xs">
                <Phone className="size-3.5" /> Phone
              </span>
              <span className="font-medium">{employee.phone || "—"}</span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-muted-foreground flex items-center gap-2 text-xs">
                <MapPin className="size-3.5" /> Address
              </span>
              <span className="font-medium truncate max-w-[200px]" title={employee.address}>
                {employee.address || "—"}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
