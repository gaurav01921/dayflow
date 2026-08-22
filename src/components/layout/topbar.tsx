import { useQuery } from "@tanstack/react-query"
import { Bell, CalendarCheck2, LogOut, Menu, PlaneTakeoff, UserRound, Users } from "lucide-react"
import { Link, NavLink, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { attendanceService } from "@/services/attendanceService"
import { authService } from "@/services/authService"
import { notificationService } from "@/services/notificationService"
import { isManagerRole, useAuthStore } from "@/stores/authStore"

export function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const clear = useAuthStore((s) => s.clear)
  const isManager = isManagerRole(user?.role)

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: notificationService.list,
    refetchInterval: 30_000,
  })
  const unread = notifications.filter((n) => !n.read).length

  // Query user's today attendance status to control top-right status dot color
  const { data: attendance = [] } = useQuery({
    queryKey: ["attendance"],
    queryFn: () => attendanceService.list(),
  })

  const todayISO = new Date().toISOString().slice(0, 10)
  const myTodayRecord = attendance.find((r) => r.employeeId === user?.id && r.date === todayISO)
  const isCheckedIn = !!myTodayRecord?.checkIn

  async function handleLogout() {
    try {
      await authService.logout()
      clear()
      toast.success("Signed out")
      navigate("/login", { replace: true })
    } catch {
      clear()
      navigate("/login", { replace: true })
    }
  }

  const profilePath = isManager ? "/hr/profile" : "/employee/profile"
  const employeesPath = isManager ? "/hr/employees" : "/employee/employees"
  const attendancePath = isManager ? "/hr/attendance" : "/employee/attendance"
  const timeOffPath = isManager ? "/hr/leaves" : "/employee/leave"

  const initials =
    user?.email
      .slice(0, 2)
      .toUpperCase() ?? "DF"

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-40 flex h-14 items-center justify-between gap-3 border-b px-4 backdrop-blur">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
          <Menu className="size-5" />
        </Button>
        <Link to={isManager ? "/hr/dashboard" : "/employee/dashboard"} className="flex items-center gap-2 md:hidden">
          <div className="bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-lg text-xs font-bold">
            DF
          </div>
          <span className="font-semibold text-sm">DayFlow</span>
        </Link>

        {/* Top quick navigation links matching reference wireframe */}
        <nav className="hidden lg:flex items-center gap-1 ml-2">
          <NavLink
            to={employeesPath}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )
            }
          >
            <Users className="size-3.5" />
            Employees
          </NavLink>
          <NavLink
            to={attendancePath}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )
            }
          >
            <CalendarCheck2 className="size-3.5" />
            Attendance
          </NavLink>
          <NavLink
            to={timeOffPath}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )
            }
          >
            <PlaneTakeoff className="size-3.5" />
            Time Off
          </NavLink>
        </nav>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="size-5" />
              {unread > 0 ? (
                <span className="bg-destructive text-destructive-foreground absolute top-1 right-1 flex size-4 items-center justify-center rounded-full text-[10px] font-bold">
                  {unread}
                </span>
              ) : null}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.length === 0 ? (
              <p className="text-muted-foreground px-2 py-4 text-center text-sm">
                No notifications yet.
              </p>
            ) : (
              notifications.slice(0, 5).map((n) => (
                <DropdownMenuItem key={n.id} className="flex-col items-start gap-0.5">
                  <span className="text-sm font-medium">{n.title}</span>
                  <span className="text-muted-foreground line-clamp-2 text-xs">
                    {n.message}
                  </span>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="hover:bg-accent flex items-center gap-2 rounded-md px-1.5 py-1 outline-none transition-colors relative cursor-pointer">
              <div className="relative">
                <Avatar className="size-8 border border-border">
                  <AvatarImage src={undefined} alt={user?.email ?? ""} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">{initials}</AvatarFallback>
                </Avatar>

                {/* Status dot in top right bar changing color as per check-in:
                    - GREEN (🟢) when checked in
                    - YELLOW (🟡) when not checked in */}
                <span
                  title={isCheckedIn ? "Checked In (Present)" : "Not Checked In (Absent)"}
                  className={cn(
                    "absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-background transition-colors",
                    isCheckedIn ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                  )}
                />
              </div>

              <div className="hidden text-left sm:block">
                <div className="flex items-center gap-1.5">
                  <p className="max-w-[140px] truncate text-sm leading-tight font-medium">
                    {user?.employeeCode ?? ""}
                  </p>
                  <span
                    className={cn(
                      "size-2 rounded-full",
                      isCheckedIn ? "bg-emerald-500" : "bg-amber-500"
                    )}
                  />
                </div>
                <p className="text-muted-foreground text-xs leading-tight capitalize">
                  {user?.role ?? ""} {isCheckedIn ? "· Present" : "· Absent"}
                </p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex items-center justify-between">
                <p className="font-semibold text-xs uppercase text-muted-foreground tracking-wider">Signed in as</p>
                <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium", isCheckedIn ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600")}>
                  {isCheckedIn ? "Checked In" : "Not Checked In"}
                </span>
              </div>
              <p className="truncate text-sm font-medium text-foreground mt-0.5">{user?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate(profilePath)}>
              <UserRound className="size-4 mr-2" />
              My Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} variant="destructive">
              <LogOut className="size-4 mr-2" />
              Log Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
