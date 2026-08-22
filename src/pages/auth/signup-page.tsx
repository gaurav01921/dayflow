import { AuthLayout } from "@/features/auth/auth-layout"
import { SignUpForm } from "@/features/auth/sign-up-form"

export function SignupPage() {
  return (
    <AuthLayout title="Join DayFlow with your company employee ID.">
      <SignUpForm />
    </AuthLayout>
  )
}
