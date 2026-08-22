import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
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
    email: z.email("Enter a valid email address."),
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

  const role = watch("role")

  const mutation = useMutation({
    mutationFn: authService.signup,
    onSuccess: (_data, variables) => {
      toast.success("Account created. Verify your email to sign in.")
      navigate("/verify-email", { state: { email: variables.email }, replace: true })
    },
    onError: (error) => toast.error(toUserMessage(error)),
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create account</CardTitle>
        <CardDescription>Email verification required before first sign-in.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit((v) => mutation.mutate(v))}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="employeeCode">Employee ID</Label>
              <Input id="employeeCode" placeholder="EMP011" {...register("employeeCode")} />
              {errors.employeeCode ? (
                <p className="text-destructive text-xs">{errors.employeeCode.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={role} onValueChange={(v) => setValue("role", v as FormValues["role"])}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="hr">HR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-email">Email</Label>
            <Input
              id="signup-email"
              type="email"
              placeholder="you@dayflow.demo"
              autoComplete="email"
              {...register("email")}
            />
            {errors.email ? (
              <p className="text-destructive text-xs">{errors.email.message}</p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="signup-password">Password</Label>
              <Input
                id="signup-password"
                type="password"
                placeholder="Demo@123"
                autoComplete="new-password"
                {...register("password")}
              />
              {errors.password ? (
                <ul className="text-destructive list-inside list-disc text-xs">
                  <li>{errors.password?.message ?? "Password does not match requirements."}</li>
                </ul>
              ) : (
                <p className="text-muted-foreground text-xs">
                  8+ chars with upper, lower, number & symbol.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Repeat password"
                autoComplete="new-password"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword ? (
                <p className="text-destructive text-xs">{errors.confirmPassword.message}</p>
              ) : null}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? "Creating…" : "Sign up"}
          </Button>
        </form>

        <p className="text-muted-foreground mt-4 text-center text-sm">
          Already registered?{" "}
          <a href="/login" className="text-primary font-medium hover:underline">
            Sign in
          </a>
        </p>
      </CardContent>
    </Card>
  )
}
