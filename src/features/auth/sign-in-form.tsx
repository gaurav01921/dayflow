import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { Eye, EyeOff, Lock, Mail, Shield, UserCheck } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { Link, Navigate, useNavigate } from "react-router-dom"
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
  email: z.string().email("Enter a valid email address."),
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
      toast.success(`Welcome back, ${user.employeeCode}`)
      navigate(user.role === "employee" ? "/employee/dashboard" : "/hr/dashboard", {
        replace: true,
      })
    },
    onError: (error) => toast.error(toUserMessage(error)),
  })

  if (user) {
    return (
      <Navigate
        to={user.role === "employee" ? "/employee/dashboard" : "/hr/dashboard"}
        replace
      />
    )
  }

  const fillDemo = (email: string, pass: string) => {
    setValue("email", email, { shouldValidate: true })
    setValue("password", pass, { shouldValidate: true })
  }

  return (
    <Card className="border-border/60 shadow-xl shadow-black/10 backdrop-blur-sm">
      <CardHeader className="pb-5 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">Sign In</CardTitle>
        <CardDescription className="text-sm">
          Enter your work email and password to access DayFlow.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form className="space-y-5" onSubmit={handleSubmit((v) => mutation.mutate(v))}>
          {/* Email / Login ID */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Login ID / Email
            </Label>
            <div className="relative">
              <Mail className="text-muted-foreground absolute top-2.5 left-3 size-4" />
              <Input
                id="email"
                type="email"
                placeholder="employee@dayflow.demo"
                autoComplete="email"
                className="pl-9 h-10"
                {...register("email")}
              />
            </div>
            {errors.email ? (
              <p className="text-destructive text-xs mt-1">{errors.email.message}</p>
            ) : null}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Password
            </Label>
            <div className="relative">
              <Lock className="text-muted-foreground absolute top-2.5 left-3 size-4" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
                className="pl-9 pr-10 h-10"
                {...register("password")}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {errors.password ? (
              <p className="text-destructive text-xs mt-1">{errors.password.message}</p>
            ) : null}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full h-10 font-semibold tracking-wide shadow-md shadow-primary/20"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Signing in…" : "SIGN IN"}
          </Button>
        </form>

        {/* Demo Accounts Quick-Fill */}
        <div className="bg-muted/40 border border-border/60 mt-5 rounded-xl p-3.5 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Demo Credentials — Click to Autofill
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillDemo("employee@dayflow.demo", "Demo@123")}
              className="flex items-center gap-2 rounded-lg border border-border/60 bg-background/80 hover:bg-accent/80 p-2.5 text-left transition-all hover:border-primary/40 cursor-pointer"
            >
              <UserCheck className="size-4 text-primary shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">Employee</p>
                <p className="text-[10px] text-muted-foreground truncate">Aarav Mehta</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => fillDemo("hr@dayflow.demo", "Demo@123")}
              className="flex items-center gap-2 rounded-lg border border-border/60 bg-background/80 hover:bg-accent/80 p-2.5 text-left transition-all hover:border-primary/40 cursor-pointer"
            >
              <Shield className="size-4 text-primary shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">HR / Admin</p>
                <p className="text-[10px] text-muted-foreground truncate">Rohan Manager</p>
              </div>
            </button>
          </div>
        </div>

        <p className="text-muted-foreground mt-5 text-center text-sm">
          Don't have an Account?{" "}
          <Link to="/signup" className="text-primary font-semibold hover:underline">
            Sign Up
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
