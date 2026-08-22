import { api } from "@/lib/axios"
import {
  calculateFullPayroll,
  calculatePayableDays,
  calculateSalary,
  summarizeAttendanceAndLeaves,
} from "@/lib/payroll/index"
import { mockApi } from "@/mocks/mockApi"
import { USE_MOCKS } from "@/services/config"
import type {
  FullPayrollCalculationInput,
  FullPayrollCalculationResult,
  PayableDaysInput,
  PayableDaysResult,
  Payroll,
  PayrollUpdate,
  SalaryCalculationInput,
  SalaryStructure,
} from "@/types/api"

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

  // Pure calculation methods exposed for M4 UI & payroll components
  calculateSalary(input: SalaryCalculationInput): SalaryStructure {
    return calculateSalary(input)
  },

  calculatePayableDays(input: PayableDaysInput): PayableDaysResult {
    return calculatePayableDays(input)
  },

  calculateFullPayroll(input: FullPayrollCalculationInput): FullPayrollCalculationResult {
    return calculateFullPayroll(input)
  },

  summarizeAttendanceAndLeaves,
}
