import axios from "axios"

import { ApiError } from "@/lib/api-error"
import { useAuthStore } from "@/stores/authStore"

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api",
  timeout: 10_000,
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error?.response?.data as
      | { success?: boolean; message?: string; code?: string }
      | undefined

    if (data && data.success === false) {
      return Promise.reject(
        new ApiError(data.message ?? "Request failed.", data.code ?? "UNKNOWN")
      )
    }
    if (error?.response?.status === 401) {
      useAuthStore.getState().clear()
    }
    return Promise.reject(
      new ApiError(
        error?.message ?? "Cannot reach the server. Please try again.",
        "NETWORK_ERROR"
      )
    )
  }
)
