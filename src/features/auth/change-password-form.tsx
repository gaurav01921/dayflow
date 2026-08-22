import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { Eye, EyeOff, KeyRound, Lock } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
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
import { isManagerRole, useAuthStore } from "@/stores/authStore"

const schema = z
  .object({
    temporaryPassword: z.string().min(1, "Temporary password is required."),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters.")
      .regex(/[A-Z]/, "Include at least one uppercase letter.")
      .regex(/[a-z]/, "Include at least one lowercase letter.")
      .regex(/[0-9]/, "Include at least one number."),
    confirmPassword: z.string().min(1, "Please confirm your new password."),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })

type FormValues = z.infer<typeof schema>

export function ChangePasswordForm() {
  const navigate = useNavigate()
  const token = useAuthStore((s) => s.token)
  const setAuth = useAuthStore((s) => s.setAuth)

  const [showTemp, setShowTemp] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      temporaryPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      authService.changePassword({
        temporaryPassword: values.temporaryPassword,
        newPassword: values.newPassword,
      }),
    onSuccess: ({ user: updatedUser }) => {
      if (token) {
        setAuth({ ...updatedUser, mustChangePassword: false }, token)
      }
      toast.success("Password changed successfully!")
      navigate(isManagerRole(updatedUser.role) ? "/hr/dashboard" : "/employee/dashboard", {
        replace: true,
      })
    },
    onError: (e) => toast.error(toUserMessage(e)),
  })

  return (
    <Card className="border-border/60 shadow-xl shadow-black/10 backdrop-blur-sm sm:max-w-[480px] w-full mx-auto">
      <CardHeader className="pb-5 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-2">
          <KeyRound className="size-6" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">Set New Password</CardTitle>
        <CardDescription className="text-sm">
          Welcome to DayFlow! Your account was initialized with a temporary password. Please set a secure new password before continuing.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit((v) => mutation.mutate(v))}>
          {/* Temporary Password */}
          <div className="space-y-1.5">
            <Label htmlFor="temporaryPassword" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Temporary / Current Password
            </Label>
            <div className="relative">
              <Lock className="text-muted-foreground absolute top-2.5 left-3 size-4" />
              <Input
                id="temporaryPassword"
                type={showTemp ? "text" : "password"}
                placeholder="Enter initial password"
                autoComplete="current-password"
                className="pl-9 pr-10 h-10 font-mono"
                {...register("temporaryPassword")}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowTemp((v) => !v)}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                aria-label={showTemp ? "Hide password" : "Show password"}
              >
                {showTemp ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {errors.temporaryPassword ? (
              <p className="text-destructive text-xs mt-1">{errors.temporaryPassword.message}</p>
            ) : null}
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <Label htmlFor="newPassword" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              New Password
            </Label>
            <div className="relative">
              <Lock className="text-muted-foreground absolute top-2.5 left-3 size-4" />
              <Input
                id="newPassword"
                type={showNew ? "text" : "password"}
                placeholder="Enter new password"
                autoComplete="new-password"
                className="pl-9 pr-10 h-10 font-mono"
                {...register("newPassword")}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowNew((v) => !v)}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                aria-label={showNew ? "Hide password" : "Show password"}
              >
                {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {errors.newPassword ? (
              <p className="text-destructive text-xs mt-1">{errors.newPassword.message}</p>
            ) : (
              <p className="text-muted-foreground text-[11px]">
                Must be at least 8 characters with uppercase, lowercase &amp; number.
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Confirm New Password
            </Label>
            <div className="relative">
              <Lock className="text-muted-foreground absolute top-2.5 left-3 size-4" />
              <Input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                placeholder="Re-enter new password"
                autoComplete="new-password"
                className="pl-9 pr-10 h-10 font-mono"
                {...register("confirmPassword")}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {errors.confirmPassword ? (
              <p className="text-destructive text-xs mt-1">{errors.confirmPassword.message}</p>
            ) : null}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full h-10 font-semibold tracking-wide shadow-md shadow-primary/20 mt-3"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Updating Password…" : "CHANGE PASSWORD & CONTINUE"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
