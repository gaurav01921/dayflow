import { AuthLayout } from "@/features/auth/auth-layout"
import { VerifyEmailForm } from "@/features/auth/verify-email-form"

export function VerifyEmailPage() {
  return (
    <AuthLayout title="One step left — confirm it's you.">
      <VerifyEmailForm />
    </AuthLayout>
  )
}
