import { api } from "@/lib/axios"
import { mockApi } from "@/mocks/mockApi"
import { USE_MOCKS } from "@/services/config"
import type {
  AuthResponse,
  ChangePasswordInput,
  CreateEmployeeInput,
  CreateEmployeeResult,
  LoginInput,
  SignUpInput,
  User,
  VerifyEmailInput,
} from "@/types/api"

export const authService = {
  async signup(input: SignUpInput): Promise<AuthResponse> {
    if (USE_MOCKS) return mockApi.signup(input)
    const res = await api.post<{ token: string; user: AuthResponse["user"] }>(
      "/auth/signup",
      input
    )
    return res.data
  },

  async createEmployee(input: CreateEmployeeInput): Promise<CreateEmployeeResult> {
    if (USE_MOCKS) return mockApi.createEmployee(input)
    const res = await api.post<CreateEmployeeResult>("/employees/create", input)
    return res.data
  },

  async login(input: LoginInput): Promise<AuthResponse> {
    if (USE_MOCKS) return mockApi.login(input)
    const res = await api.post("/auth/login", input)
    return res.data
  },

  async changePassword(input: ChangePasswordInput): Promise<{ user: User }> {
    if (USE_MOCKS) return mockApi.changePassword(input)
    const res = await api.post<{ user: User }>("/auth/change-password", input)
    return res.data
  },

  async verifyEmail(input: VerifyEmailInput) {
    if (USE_MOCKS) return mockApi.verifyEmail(input)
    const res = await api.post("/auth/verify-email", input)
    return res.data
  },

  async logout(): Promise<void> {
    if (USE_MOCKS) return mockApi.logout()
    return undefined
  },
}
