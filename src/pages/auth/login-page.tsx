import { AuthLayout } from "@/features/auth/auth-layout"
import { SignInForm } from "@/features/auth/sign-in-form"

export function LoginPage() {
  return (
    <AuthLayout title="HR management that keeps your whole team in sync.">
      <SignInForm />
    </AuthLayout>
  )
}
