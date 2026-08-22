import type { LucideIcon } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

const TONES = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/15 text-warning",
  destructive: "bg-destructive/10 text-destructive",
  info: "bg-info/10 text-info",
} as const

interface StatCardProps {
  title: string
  value: string | number
  hint?: string
  icon?: LucideIcon
  tone?: keyof typeof TONES
}

export function StatCard({
  title,
  value,
  hint,
  icon: Icon,
  tone = "primary",
}: StatCardProps) {
  return (
    <Card className="gap-0 py-0">
      <CardContent className="flex items-center gap-4 px-5 py-5">
        <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg", TONES[tone])}>
          {Icon ? (
            <Icon className="size-5" />
          ) : null}
        </div>
        <div className="min-w-0">
          <p className="text-muted-foreground truncate text-xs font-medium tracking-wide uppercase">
            {title}
          </p>
          <p className="mt-0.5 text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
          {hint ? <p className="text-muted-foreground mt-0.5 text-xs">{hint}</p> : null}
        </div>
      </CardContent>
    </Card>
  )
}

export function StatCardSkeleton() {
  return (
    <Card className="gap-0 py-0">
      <CardContent className="flex items-center gap-4 px-5 py-5">
        <Skeleton className="size-10 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-7 w-16" />
        </div>
      </CardContent>
    </Card>
  )
}
