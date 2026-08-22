import { AuthLayout } from "@/features/auth/auth-layout"
import { ChangePasswordForm } from "@/features/auth/change-password-form"

export function ChangePasswordPage() {
  return (
    <AuthLayout title="HR management that keeps your whole team in sync.">
      <ChangePasswordForm />
    </AuthLayout>
  )
}
