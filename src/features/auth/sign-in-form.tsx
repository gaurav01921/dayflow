import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { Eye, EyeOff, Lock, Mail, Shield, UserCheck } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { Navigate, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toUserMessage } from "@/lib/api-error"
import { authService } from "@/services/authService"
import { useAuthStore } from "@/stores/authStore"

const schema = z.object({
  email: z.string().min(1, "Login ID or Email is required."),
  password: z.string().min(1, "Password is required."),
})

type FormValues = z.infer<typeof schema>

export function SignInForm() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const setAuth = useAuthStore((s) => s.setAuth)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  })

  const mutation = useMutation({
    mutationFn: authService.login,
    onSuccess: ({ user, token }) => {
      setAuth(user, token)
      if (user.mustChangePassword) {
        toast.info("First time login detected. Please change your temporary password.")
        navigate("/change-password", { replace: true })
        return
      }
      toast.success(`Welcome back, ${user.employeeCode}`)
      // Redirect employee to /employee/employees Directory page
      navigate(user.role === "employee" ? "/employee/employees" : "/hr/dashboard", {
        replace: true,
      })
    },
    onError: (error) => toast.error(toUserMessage(error)),
  })

  if (user) {
    if (user.mustChangePassword) {
      return <Navigate to="/change-password" replace />
    }
    return (
      <Navigate
        to={user.role === "employee" ? "/employee/employees" : "/hr/dashboard"}
        replace
      />
    )
  }

  const fillDemo = (email: string, pass: string) => {
    setValue("email", email, { shouldValidate: true })
    setValue("password", pass, { shouldValidate: true })
  }

  return (
    <Card className="relative overflow-hidden border border-indigo-500/30 border-t-indigo-400/70 bg-slate-900/90 shadow-[0_0_50px_rgba(99,102,241,0.2)] backdrop-blur-xl">
      {/* Top light glow bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
      <CardHeader className="pb-4 text-center">
        <CardTitle className="text-xl font-bold tracking-tight text-white">Account Sign In</CardTitle>
        <CardDescription className="text-xs text-slate-400">
          Enter your System Login ID (e.g. ODO20260001) or Work Email to access DayFlow.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <form className="space-y-4" onSubmit={handleSubmit((v) => mutation.mutate(v))}>
          {/* Email / Login ID */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Login ID / Email
            </Label>
            <div className="relative">
              <Mail className="text-slate-400 absolute top-2.5 left-3 size-4" />
              <Input
                id="email"
                type="text"
                placeholder="ODO20260001 or employee@dayflow.demo"
                autoComplete="username"
                className="pl-9 h-10 bg-slate-950/60 border-slate-800 text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500/20"
                {...register("email")}
              />
            </div>
            {errors.email ? (
              <p className="text-rose-400 text-xs mt-1">{errors.email.message}</p>
            ) : null}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Password
            </Label>
            <div className="relative">
              <Lock className="text-slate-400 absolute top-2.5 left-3 size-4" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
                className="pl-9 pr-10 h-10 font-mono bg-slate-950/60 border-slate-800 text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500/20"
                {...register("password")}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {errors.password ? (
              <p className="text-rose-400 text-xs mt-1">{errors.password.message}</p>
            ) : null}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-10 font-semibold tracking-wide bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-md shadow-indigo-600/30 cursor-pointer"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Signing in…" : "SIGN IN"}
          </Button>
        </form>

        {/* Quick Demo Autofill */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 flex items-center justify-between">
            <span>Quick Demo Login</span>
            <span className="text-[9px] text-slate-500 font-normal">Click to autofill</span>
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillDemo("employee@dayflow.demo", "Demo@123")}
              className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/90 hover:bg-slate-800/90 p-2 text-left transition-all hover:border-indigo-500/40 cursor-pointer"
            >
              <UserCheck className="size-4 text-emerald-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-200 truncate">Employee</p>
                <p className="text-[10px] text-slate-400 truncate">Aarav Mehta</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => fillDemo("hr@dayflow.demo", "Demo@123")}
              className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/90 hover:bg-slate-800/90 p-2 text-left transition-all hover:border-indigo-500/40 cursor-pointer"
            >
              <Shield className="size-4 text-indigo-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-200 truncate">HR / Admin</p>
                <p className="text-[10px] text-slate-400 truncate">Priya Sharma</p>
              </div>
            </button>
          </div>
        </div>

        {/* Employee Registration Notice */}
        <div className="rounded-lg border border-slate-800/60 bg-slate-950/40 p-3 text-center text-xs text-slate-400 space-y-0.5">
          <p className="font-semibold text-slate-200">Employee Registration Notice</p>
          <p className="text-[11px] text-slate-400">
            Employee accounts are generated centrally by HR/Admin with an assigned Login ID &amp; temporary password.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
