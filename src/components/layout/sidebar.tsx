import {
  Banknote,
  CalendarCheck2,
  ChartColumn,
  LayoutDashboard,
  PlaneTakeoff,
  UserRound,
  Users,
  X,
} from "lucide-react"
import { NavLink } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { isManagerRole } from "@/stores/authStore"
import type { UserRole } from "@/types/api"
import { cn } from "@/lib/utils"

interface NavItem {
  to: string
  label: string
  icon: typeof LayoutDashboard
}

const EMPLOYEE_NAV: NavItem[] = [
  { to: "/employee/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/employee/employees", label: "Employees", icon: Users },
  { to: "/employee/profile", label: "My Profile", icon: UserRound },
  { to: "/employee/attendance", label: "Attendance", icon: CalendarCheck2 },
  { to: "/employee/leave", label: "Time Off", icon: PlaneTakeoff },
  { to: "/employee/payroll", label: "Payroll", icon: Banknote },
]

const HR_NAV: NavItem[] = [
  { to: "/hr/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/hr/employees", label: "Employees", icon: Users },
  { to: "/hr/attendance", label: "Attendance", icon: CalendarCheck2 },
  { to: "/hr/leaves", label: "Leave Approvals", icon: PlaneTakeoff },
  { to: "/hr/payroll", label: "Payroll", icon: Banknote },
  { to: "/hr/reports", label: "Reports", icon: ChartColumn },
]

function NavLinks({ items, onNavigate }: { items: NavItem[]; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )
          }
        >
          <item.icon className="size-4 shrink-0" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}

function Brand() {
  return (
    <div className="flex items-center gap-2 px-2">
      <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg text-sm font-bold">
        DF
      </div>
      <span className="text-base font-semibold tracking-tight">DayFlow</span>
    </div>
  )
}

export function Sidebar({
  role,
  open,
  onClose,
}: {
  role: UserRole
  open?: boolean
  onClose?: () => void
}) {
  const items = isManagerRole(role) ? HR_NAV : EMPLOYEE_NAV
  return (
    <>
      {/* Desktop */}
      <aside className="bg-sidebar border-sidebar-border fixed inset-y-0 left-0 z-30 hidden w-60 flex-col gap-8 border-r p-4 md:flex">
        <div className="border-sidebar-border border-b pb-5">
          <Brand />
          <p className="text-sidebar-foreground/45 mt-3 px-2 text-[11px] font-medium uppercase tracking-[0.18em]">
            Workforce operations
          </p>
        </div>
        <div>
          <p className="text-sidebar-foreground/45 mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em]">
            Workspace
          </p>
          <NavLinks items={items} />
        </div>
        <div className="bg-sidebar-accent/70 border-sidebar-border mt-auto rounded-xl border p-3">
          <p className="text-xs font-semibold">DayFlow workspace</p>
          <p className="text-sidebar-foreground/55 mt-1 text-[11px] leading-relaxed">
            Your people, payroll, and attendance in one place.
          </p>
        </div>
        <p className="text-sidebar-foreground/35 px-3 text-[10px]">
          v1.0 · mock mode
        </p>
      </aside>

      {/* Mobile overlay */}
      {open ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={onClose} />
          <aside className="bg-background relative flex h-full w-72 flex-col gap-6 border-r p-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <Brand />
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="size-4" />
              </Button>
            </div>
            <NavLinks items={items} onNavigate={onClose} />
          </aside>
        </div>
      ) : null}
    </>
  )
}
