import { Loader2 } from "lucide-react"

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="text-muted-foreground flex items-center justify-center gap-2 py-14 text-sm">
      <Loader2 className="size-4 animate-spin" />
      <span>{label}</span>
    </div>
  )
}
