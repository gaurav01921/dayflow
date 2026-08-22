import { AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { toUserMessage } from "@/lib/api-error"

interface ErrorStateProps {
  error: unknown
  onRetry?: () => void
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className="border-destructive/30 bg-destructive/5 flex flex-col items-center justify-center rounded-lg border border-dashed px-6 py-12 text-center">
      <div className="bg-destructive/10 text-destructive mb-3 flex size-11 items-center justify-center rounded-full">
        <AlertTriangle className="size-5" />
      </div>
      <p className="text-sm font-semibold">Something went wrong</p>
      <p className="text-muted-foreground mt-1 max-w-sm text-sm">{toUserMessage(error)}</p>
      {onRetry ? (
        <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  )
}
