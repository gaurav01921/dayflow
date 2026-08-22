import type { ReactNode } from "react"

export function AuthLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-linear-to-b from-background via-muted/30 to-background flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md space-y-6">
        {/* System Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-primary/80 bg-primary/10 px-3 py-1 rounded-full">
            Human Resource Management System
          </span>
          <div className="flex items-center justify-center gap-2.5 pt-1">
            <div className="bg-primary text-primary-foreground flex size-10 items-center justify-center rounded-xl text-lg font-bold shadow-md shadow-primary/20">
              DF
            </div>
            <span className="text-2xl font-bold tracking-tight text-foreground">DayFlow</span>
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm max-w-xs">{title}</p>
        </div>

        {children}
      </div>
    </div>
  )
}
