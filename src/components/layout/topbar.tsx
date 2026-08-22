import { useQuery } from "@tanstack/react-query"
import { Bell, LogOut, Menu } from "lucide-react"
import { useNavigate } from "react-router-dom"
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
import { notificationService } from "@/services/notificationService"
import { authService } from "@/services/authService"
import { useAuthStore } from "@/stores/authStore"

export function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const clear = useAuthStore((s) => s.clear)

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: notificationService.list,
    refetchInterval: 30_000,
  })
  const unread = notifications.filter((n) => !n.read).length

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

  const initials =
    user?.email
      .slice(0, 2)
      .toUpperCase() ?? "DF"

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-40 flex h-14 items-center gap-3 border-b px-4 backdrop-blur">
      <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
        <Menu className="size-5" />
      </Button>
      <span className="font-semibold md:hidden">DayFlow</span>

      <div className="ml-auto flex items-center gap-1.5">
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
            <button className="hover:bg-accent flex items-center gap-2 rounded-md px-1.5 py-1 outline-none">
              <Avatar className="size-8">
                <AvatarImage src={undefined} alt={user?.email ?? ""} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="hidden text-left sm:block">
                <p className="max-w-[140px] truncate text-sm leading-tight font-medium">
                  {user?.employeeCode ?? ""}
                </p>
                <p className="text-muted-foreground text-xs leading-tight capitalize">
                  {user?.role ?? ""}
                </p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <p className="truncate">{user?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} variant="destructive">
              <LogOut />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
