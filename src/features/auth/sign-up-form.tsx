import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { Building2, Eye, EyeOff, IdCard, Lock, Mail, Phone, Upload, User, X } from "lucide-react"
import { useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router-dom"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toUserMessage } from "@/lib/api-error"
import { authService } from "@/services/authService"

const passwordRules = z
  .string()
  .min(8, "At least 8 characters.")
  .regex(/[A-Z]/, "Include an uppercase letter.")
  .regex(/[a-z]/, "Include a lowercase letter.")
  .regex(/[0-9]/, "Include a number.")
  .regex(/[^A-Za-z0-9]/, "Include a special character.")

const schema = z
  .object({
    employeeCode: z
      .string()
      .min(3, "Employee ID is required.")
      .regex(/^[A-Za-z]{2,4}\d{3}$/, "Format like EMP011."),
    email: z.string().email("Enter a valid email address."),
    password: passwordRules,
    confirmPassword: z.string(),
    role: z.enum(["employee", "hr"]),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })

type FormValues = z.infer<typeof schema>

export function SignUpForm() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { employeeCode: "", email: "", password: "", confirmPassword: "", role: "employee" },
  })

  const selectedRole = watch("role")

  const mutation = useMutation({
    mutationFn: authService.signup,
    onSuccess: (_data, variables) => {
      toast.success("Account created. Verify your email to sign in.")
      navigate("/verify-email", { state: { email: variables.email }, replace: true })
    },
    onError: (error) => toast.error(toUserMessage(error)),
  })

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo must be under 2 MB.")
      return
    }
    const reader = new FileReader()
    reader.onload = () => setLogoPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  return (
    <Card className="border-border/60 shadow-xl shadow-black/10 backdrop-blur-sm">
      <CardHeader className="pb-5 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">Create Account</CardTitle>
        <CardDescription className="text-sm">
          Join DayFlow HRMS with your company employee credentials.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit((v) => mutation.mutate(v))}>

          {/* Company Name + Logo Upload (UI-only) */}
          <div className="flex items-end gap-3">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="companyName" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Company Name
              </Label>
              <div className="relative">
                <Building2 className="text-muted-foreground absolute top-2.5 left-3 size-4" />
                <Input
                  id="companyName"
                  placeholder="e.g. Odoo India"
                  className="pl-9 h-10"
                  // UI-only field — not submitted to authService
                  // Integration required: authService.signup() + SignUpInput must be extended
                />
              </div>
            </div>

            {/* Logo Upload */}
            <div className="flex flex-col items-center gap-1">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Logo
              </Label>
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="relative flex size-10 shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-border hover:border-primary/50 transition-colors bg-muted/30 hover:bg-primary/5 cursor-pointer overflow-hidden"
                title="Upload company logo"
              >
                {logoPreview ? (
                  <>
                    <img src={logoPreview} alt="Logo preview" className="size-full object-cover" />
                    <span
                      onClick={(e) => {
                        e.stopPropagation()
                        setLogoPreview(null)
                        if (logoInputRef.current) logoInputRef.current.value = ""
                      }}
                      className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-destructive-foreground cursor-pointer"
                    >
                      <X className="size-2.5" />
                    </span>
                  </>
                ) : (
                  <Upload className="size-4 text-muted-foreground" />
                )}
              </button>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoChange}
              />
            </div>
          </div>

          {/* Name (UI-only) */}
          <div className="space-y-1.5">
            <Label htmlFor="fullName" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Full Name
            </Label>
            <div className="relative">
              <User className="text-muted-foreground absolute top-2.5 left-3 size-4" />
              <Input
                id="fullName"
                placeholder="e.g. Aarav Mehta"
                className="pl-9 h-10"
                // UI-only — authService.signup() doesn't accept name yet
              />
            </div>
          </div>

          {/* Employee ID + Role */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="employeeCode" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Employee ID
              </Label>
              <div className="relative">
                <IdCard className="text-muted-foreground absolute top-2.5 left-3 size-4" />
                <Input
                  id="employeeCode"
                  placeholder="EMP011"
                  className="pl-9 h-10 font-mono"
                  {...register("employeeCode")}
                />
              </div>
              {errors.employeeCode ? (
                <p className="text-destructive text-xs">{errors.employeeCode.message}</p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Account Role
              </Label>
              <Select
                value={selectedRole}
                onValueChange={(v) => setValue("role", v as FormValues["role"])}
              >
                <SelectTrigger className="w-full h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="hr">HR / Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="signup-email" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Work Email
            </Label>
            <div className="relative">
              <Mail className="text-muted-foreground absolute top-2.5 left-3 size-4" />
              <Input
                id="signup-email"
                type="email"
                placeholder="you@dayflow.demo"
                autoComplete="email"
                className="pl-9 h-10"
                {...register("email")}
              />
            </div>
            {errors.email ? (
              <p className="text-destructive text-xs">{errors.email.message}</p>
            ) : null}
          </div>

          {/* Phone (UI-only) */}
          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Phone
            </Label>
            <div className="relative">
              <Phone className="text-muted-foreground absolute top-2.5 left-3 size-4" />
              <Input
                id="phone"
                type="tel"
                placeholder="+91 98765 43210"
                className="pl-9 h-10"
                // UI-only — authService.signup() doesn't accept phone yet
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="signup-password" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Password
            </Label>
            <div className="relative">
              <Lock className="text-muted-foreground absolute top-2.5 left-3 size-4" />
              <Input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                placeholder="Demo@123"
                autoComplete="new-password"
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
              <p className="text-destructive text-xs">{errors.password.message}</p>
            ) : (
              <p className="text-muted-foreground text-[11px]">
                8+ chars with uppercase, number &amp; special character.
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <Label htmlFor="confirm-password" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Confirm Password
            </Label>
            <div className="relative">
              <Lock className="text-muted-foreground absolute top-2.5 left-3 size-4" />
              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Repeat password"
                autoComplete="new-password"
                className="pl-9 pr-10 h-10"
                {...register("confirmPassword")}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {errors.confirmPassword ? (
              <p className="text-destructive text-xs">{errors.confirmPassword.message}</p>
            ) : null}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full h-10 font-semibold tracking-wide shadow-md shadow-primary/20 mt-2"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Creating Account…" : "SIGN UP"}
          </Button>
        </form>

        {/* Note about HR-created accounts */}
        <div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3.5 py-3 text-xs text-amber-700 dark:text-amber-400 space-y-1">
          <p className="font-semibold">Note</p>
          <p>
            In production, normal users cannot self-register. HR / Admin creates employee accounts
            with a system-generated Login ID and initial password.
          </p>
        </div>

        <p className="text-muted-foreground mt-5 text-center text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
