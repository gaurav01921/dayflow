import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { Mail } from "lucide-react"
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
    <Card className="border-border/60 shadow-xl shadow-black/10 backdrop-blur-sm">
      <CardHeader className="pb-5 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">Verify Email</CardTitle>
        <CardDescription className="text-sm">
          We sent a 6-digit code to your inbox.{" "}
          <br />
          Demo mode — use code{" "}
          <span className="text-foreground font-bold">123456</span>.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form className="space-y-5" onSubmit={handleSubmit((v) => mutation.mutate(v))}>
          <div className="space-y-1.5">
            <Label htmlFor="verify-email" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Email
            </Label>
            <div className="relative">
              <Mail className="text-muted-foreground absolute top-2.5 left-3 size-4" />
              <Input
                id="verify-email"
                type="email"
                placeholder="you@dayflow.demo"
                className="pl-9 h-10"
                {...register("email")}
              />
            </div>
            {errors.email ? (
              <p className="text-destructive text-xs">{errors.email.message}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="verify-code" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Verification Code
            </Label>
            <Input
              id="verify-code"
              inputMode="numeric"
              maxLength={6}
              placeholder="123456"
              className="h-10 text-center text-lg font-bold tracking-[0.5em]"
              {...register("code")}
            />
            {errors.code ? (
              <p className="text-destructive text-xs">{errors.code.message}</p>
            ) : null}
          </div>

          <Button
            type="submit"
            className="w-full h-10 font-semibold tracking-wide shadow-md shadow-primary/20"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Verifying…" : "VERIFY EMAIL"}
          </Button>
        </form>

        <p className="text-muted-foreground mt-5 text-center text-sm">
          <a href="/login" className="text-primary font-semibold hover:underline">
            ← Back to Sign In
          </a>
        </p>
      </CardContent>
    </Card>
  )
}
