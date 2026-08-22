import { create } from "zustand"
import { persist } from "zustand/middleware"

import type { User, UserRole } from "@/types/api"

interface AuthState {
  user: User | null
  token: string | null
  setAuth: (user: User, token: string) => void
  clear: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => set({ user, token }),
      clear: () => set({ user: null, token: null }),
    }),
    { name: "dayflow-auth" }
  )
)

export function isManagerRole(role: UserRole | undefined): boolean {
  return role === "hr" || role === "admin"
}
