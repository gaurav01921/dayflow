import type { LucideIcon } from "lucide-react"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  children?: React.ReactNode
}

export function EmptyState({ icon: Icon, title, description, children }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed px-6 py-14 text-center">
      <div className="bg-muted text-muted-foreground mb-3 flex size-11 items-center justify-center rounded-full">
        <Icon className="size-5" />
      </div>
      <p className="text-sm font-semibold">{title}</p>
      {description ? (
        <p className="text-muted-foreground mt-1 max-w-sm text-sm">{description}</p>
      ) : null}
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  )
}
