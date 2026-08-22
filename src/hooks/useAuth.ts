import { useMutation } from "@tanstack/react-query"

import { mockApi } from "@/mocks/mockApi"
import { authService } from "@/services/authService"
import { USE_MOCKS } from "@/services/config"
import { isManagerRole, useAuthStore } from "@/stores/authStore"
import type { LoginInput, SignUpInput, VerifyEmailInput } from "@/types/api"

export function useAuth() {
  const user = useAuthStore((s) => s.user)
  const token = useAuthStore((s) => s.token)
  const setAuth = useAuthStore((s) => s.setAuth)
  const clear = useAuthStore((s) => s.clear)

  const isAuthenticated = Boolean(user && token)
  const isHR = isManagerRole(user?.role)
  const isAdmin = user?.role === "admin"
  const isEmployee = user?.role === "employee"

  const loginMutation = useMutation({
    mutationFn: (input: LoginInput) => authService.login(input),
    onSuccess: ({ user, token }) => {
      setAuth(user, token)
      if (USE_MOCKS) {
        mockApi.syncSession(user.id)
      }
    },
  })

  const signupMutation = useMutation({
    mutationFn: (input: SignUpInput) => authService.signup(input),
  })

  const verifyEmailMutation = useMutation({
    mutationFn: (input: VerifyEmailInput) => authService.verifyEmail(input),
  })

  async function logout(): Promise<void> {
    try {
      await authService.logout()
    } finally {
      if (USE_MOCKS) {
        mockApi.syncSession(null)
      }
      clear()
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    isHR,
    isAdmin,
    isEmployee,
    login: loginMutation.mutateAsync,
    signup: signupMutation.mutateAsync,
    verifyEmail: verifyEmailMutation.mutateAsync,
    logout,
    loginMutation,
    signupMutation,
    verifyEmailMutation,
  }
}
