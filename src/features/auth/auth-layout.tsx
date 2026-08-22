import type { ReactNode } from "react"

export function AuthLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* 1. Top Spotlight Beam Effect */}
      <div
        className="pointer-events-none absolute -top-48 left-1/2 -translate-x-1/2 w-[800px] h-[500px] opacity-40 blur-3xl"
        style={{
          background:
            "conic-gradient(from 180deg at 50% 50%, rgba(99, 102, 241, 0.8) 0deg, rgba(168, 85, 247, 0.6) 120deg, rgba(236, 72, 153, 0.4) 240deg, rgba(99, 102, 241, 0.8) 360deg)",
        }}
      />

      {/* 2. Top-Left Glowing Indigo Light Orb */}
      <div className="pointer-events-none absolute top-10 left-10 size-96 rounded-full bg-indigo-600/30 blur-[100px] animate-pulse" />

      {/* 3. Bottom-Right Glowing Purple Light Orb */}
      <div className="pointer-events-none absolute bottom-10 right-10 size-96 rounded-full bg-purple-600/30 blur-[100px] animate-pulse" />

      {/* 4. Center Backlight Glow behind Card */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-96 rounded-full bg-linear-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-3xl" />

      {/* 5. Glowing Decorative Mesh Grid Background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(99, 102, 241, 0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(99, 102, 241, 0.15) 1px, transparent 1px)`,
          backgroundSize: "36px 36px",
        }}
      />

      {/* 6. Floating Ambient Light Particles */}
      <div className="pointer-events-none absolute top-1/4 left-1/5 size-2 rounded-full bg-indigo-400 shadow-[0_0_15px_rgba(129,140,248,1)] animate-ping" />
      <div className="pointer-events-none absolute bottom-1/3 right-1/4 size-2 rounded-full bg-purple-400 shadow-[0_0_15px_rgba(192,132,252,1)] animate-ping" />

      <div className="relative z-10 w-full max-w-md space-y-6">
        {/* System Header Branding */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="flex items-center justify-center gap-3">
            <div className="relative flex size-12 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 via-purple-600 to-indigo-700 text-white font-bold text-xl shadow-xl shadow-indigo-500/40 border border-indigo-300/30">
              DF
              <span className="absolute -top-1 -right-1 size-3.5 rounded-full bg-emerald-400 border-2 border-slate-950 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
            </div>
            <div className="text-left">
              <span className="text-2xl font-bold tracking-tight text-white block leading-none drop-shadow-md">DayFlow</span>
              <span className="text-[10px] font-semibold tracking-widest text-indigo-300 uppercase">HR Management SaaS</span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-200 bg-indigo-500/20 border border-indigo-400/30 px-3.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-[0_0_12px_rgba(99,102,241,0.25)]">
              <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,1)]" />
              Employee Portal Sign In
            </span>
          </div>

          <p className="text-slate-300 text-xs sm:text-sm max-w-xs leading-relaxed drop-shadow-xs">{title}</p>
        </div>

        {children}

        <div className="text-center space-y-1">
          <p className="text-[11px] font-mono text-slate-400">
            DayFlow HRMS · Enterprise Workforce Management
          </p>
          <p className="text-[10px] text-slate-500">
            © {new Date().getFullYear()} DayFlow SaaS · Secured Portal
          </p>
        </div>
      </div>
    </div>
  )
}
