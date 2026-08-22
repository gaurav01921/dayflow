import { api } from "@/lib/axios"
import { mockApi } from "@/mocks/mockApi"
import { USE_MOCKS } from "@/services/config"
import type { Payroll, PayrollUpdate } from "@/types/api"

export const payrollService = {
  async list(employeeId?: string): Promise<Payroll[]> {
    if (USE_MOCKS) return mockApi.listPayroll(employeeId)
    const id = employeeId ?? "me"
    const res = await api.get<Payroll[]>(`/payroll/${id}`)
    return res.data
  },

  async update(employeeId: string, patch: PayrollUpdate): Promise<Payroll> {
    if (USE_MOCKS) return mockApi.updatePayroll(employeeId, patch)
    const res = await api.put<Payroll>(`/payroll/${employeeId}`, patch)
    return res.data
  },
}
