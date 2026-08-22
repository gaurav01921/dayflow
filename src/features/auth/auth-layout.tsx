import type { ReactNode } from "react"

export function AuthLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-4 sm:p-6">
      {/* Subtle background radial glow */}
      <div
        className="pointer-events-none fixed inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 0%, oklch(0.511 0.262 276.966 / 0.35), transparent)",
        }}
      />

      <div className="relative z-10 w-full max-w-md space-y-6">
        {/* System Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          {/* Logo mark */}
          <div className="flex items-center justify-center gap-2.5">
            <div className="bg-primary text-primary-foreground flex size-11 items-center justify-center rounded-xl text-lg font-bold shadow-lg shadow-primary/30">
              DF
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">DayFlow</span>
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-primary/70 bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
            Human Resource Management System
          </span>
          <p className="text-slate-400 text-xs sm:text-sm max-w-xs leading-relaxed">{title}</p>
        </div>

        {children}

        <p className="text-center text-[10px] text-slate-600">
          © {new Date().getFullYear()} DayFlow HRMS · All rights reserved
        </p>
      </div>
    </div>
  )
}
