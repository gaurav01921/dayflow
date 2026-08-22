import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { useLocation, useNavigate } from "react-router-dom"
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

const schema = z.object({
  email: z.email("Enter a valid email address."),
  code: z.string().length(6, "Enter the 6-digit code."),
})

type FormValues = z.infer<typeof schema>

export function VerifyEmailForm() {
  const navigate = useNavigate()
  const location = useLocation() as { state?: { email?: string } }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: location.state?.email ?? "", code: "" },
  })

  const mutation = useMutation({
    mutationFn: authService.verifyEmail,
    onSuccess: () => {
      toast.success("Email verified. You can sign in now.")
      navigate("/login", { replace: true })
    },
    onError: (error) => toast.error(toUserMessage(error)),
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verify your email</CardTitle>
        <CardDescription>
          We sent a 6-digit code to your inbox.
          <br />
          Demo mode — use code <span className="text-foreground font-semibold">123456</span>.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit((v) => mutation.mutate(v))}>
          <div className="space-y-2">
            <Label htmlFor="verify-email">Email</Label>
            <Input id="verify-email" type="email" placeholder="you@dayflow.demo" {...register("email")} />
            {errors.email ? (
              <p className="text-destructive text-xs">{errors.email.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="verify-code">Verification code</Label>
            <Input
              id="verify-code"
              inputMode="numeric"
              maxLength={6}
              placeholder="123456"
              {...register("code")}
            />
            {errors.code ? (
              <p className="text-destructive text-xs">{errors.code.message}</p>
            ) : null}
          </div>
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? "Verifying…" : "Verify email"}
          </Button>
        </form>
        <p className="text-muted-foreground mt-4 text-center text-sm">
          <a href="/login" className="text-primary font-medium hover:underline">
            Back to sign in
          </a>
        </p>
      </CardContent>
    </Card>
  )
}
