import { api } from "@/lib/axios"
import { mockApi } from "@/mocks/mockApi"
import { USE_MOCKS } from "@/services/config"
import type { Employee, EmployeeUpdate } from "@/types/api"

export const employeeService = {
  async list(): Promise<Employee[]> {
    if (USE_MOCKS) return mockApi.listEmployees()
    const res = await api.get<Employee[]>("/employees")
    return res.data
  },

  async get(id?: string): Promise<Employee> {
    if (USE_MOCKS) return mockApi.getEmployee(id)
    const res = await api.get<Employee>(`/employees/${id}`)
    return res.data
  },

  async update(id: string, patch: EmployeeUpdate): Promise<Employee> {
    if (USE_MOCKS) return mockApi.updateEmployee(id, patch)
    const res = await api.patch<Employee>(`/employees/${id}`, patch)
    return res.data
  },
}
