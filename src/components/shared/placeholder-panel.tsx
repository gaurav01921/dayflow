import { CalendarCheck } from "lucide-react"

export function PlaceholderPanel({ title }: { title: string }) {
  return (
    <div className="bg-muted/40 text-muted-foreground flex flex-col items-center justify-center rounded-lg border px-6 py-12 text-center">
      <CalendarCheck className="mb-3 size-6" />
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-1 max-w-sm text-sm">
        This section is ready for its owner to build on. The service layer and mock data are already wired.
      </p>
    </div>
  )
}
