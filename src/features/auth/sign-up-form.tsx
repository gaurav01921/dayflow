import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { IdCard, Lock, Mail } from "lucide-react"
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

  return (
    <Card className="border-border/80 shadow-lg shadow-black/5">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold">Create Account</CardTitle>
        <CardDescription>Join DayFlow HRMS with your company credentials.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit((v) => mutation.mutate(v))}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="employeeCode" className="text-xs font-semibold">
                Employee ID
              </Label>
              <div className="relative">
                <IdCard className="text-muted-foreground absolute top-2.5 left-3 size-4" />
                <Input
                  id="employeeCode"
                  placeholder="EMP011"
                  className="pl-9 font-mono"
                  {...register("employeeCode")}
                />
              </div>
              {errors.employeeCode ? (
                <p className="text-destructive text-xs">{errors.employeeCode.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Account Role</Label>
              <Select
                value={selectedRole}
                onValueChange={(v) => setValue("role", v as FormValues["role"])}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="hr">HR / Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-email" className="text-xs font-semibold">
              Work Email Address
            </Label>
            <div className="relative">
              <Mail className="text-muted-foreground absolute top-2.5 left-3 size-4" />
              <Input
                id="signup-email"
                type="email"
                placeholder="you@dayflow.demo"
                autoComplete="email"
                className="pl-9"
                {...register("email")}
              />
            </div>
            {errors.email ? (
              <p className="text-destructive text-xs">{errors.email.message}</p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="signup-password" className="text-xs font-semibold">
                Password
              </Label>
              <div className="relative">
                <Lock className="text-muted-foreground absolute top-2.5 left-3 size-4" />
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="Demo@123"
                  autoComplete="new-password"
                  className="pl-9"
                  {...register("password")}
                />
              </div>
              {errors.password ? (
                <p className="text-destructive text-xs">{errors.password.message}</p>
              ) : (
                <p className="text-muted-foreground text-[11px]">8+ chars with uppercase, number & symbol.</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-xs font-semibold">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="text-muted-foreground absolute top-2.5 left-3 size-4" />
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Repeat password"
                  autoComplete="new-password"
                  className="pl-9"
                  {...register("confirmPassword")}
                />
              </div>
              {errors.confirmPassword ? (
                <p className="text-destructive text-xs">{errors.confirmPassword.message}</p>
              ) : null}
            </div>
          </div>

          <Button type="submit" className="w-full h-10 font-semibold shadow-sm mt-2" disabled={mutation.isPending}>
            {mutation.isPending ? "Creating Account…" : "Sign Up"}
          </Button>
        </form>

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
