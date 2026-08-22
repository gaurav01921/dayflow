import type { ReactNode } from "react"

export function AuthLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center justify-center gap-2">
          <div className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-lg text-base font-bold">
            DF
          </div>
          <span className="text-xl font-semibold tracking-tight">DayFlow</span>
        </div>
        <p className="text-muted-foreground text-center text-sm">{title}</p>
        {children}
      </div>
    </div>
  )
}
