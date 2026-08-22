import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
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
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
})

type FormValues = z.infer<typeof schema>

export function SignInForm() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const setAuth = useAuthStore((s) => s.setAuth)

  const {
    register,
    handleSubmit,
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Use your work email to continue.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit((v) => mutation.mutate(v))}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@dayflow.demo"
              autoComplete="email"
              {...register("email")}
            />
            {errors.email ? (
              <p className="text-destructive text-xs">{errors.email.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              {...register("password")}
            />
            {errors.password ? (
              <p className="text-destructive text-xs">{errors.password.message}</p>
            ) : null}
          </div>
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <div className="bg-muted/60 mt-4 rounded-md p-3 text-xs">
          <p className="font-medium">Demo accounts</p>
          <p className="text-muted-foreground mt-1">Employee: employee@dayflow.demo · Demo@123</p>
          <p className="text-muted-foreground">HR: hr@dayflow.demo · Demo@123</p>
        </div>

        <p className="text-muted-foreground mt-4 text-center text-sm">
          No account?{" "}
          <a href="/signup" className="text-primary font-medium hover:underline">
            Sign up
          </a>
        </p>
      </CardContent>
    </Card>
  )
}
