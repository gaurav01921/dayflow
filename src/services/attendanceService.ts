import { api } from "@/lib/axios"
import { mockApi } from "@/mocks/mockApi"
import { USE_MOCKS } from "@/services/config"
import type { AttendanceQuery, AttendanceRecord } from "@/types/api"

export const attendanceService = {
  async list(query: AttendanceQuery = {}): Promise<AttendanceRecord[]> {
    if (USE_MOCKS) return mockApi.getAttendance(query)
    const res = await api.get<AttendanceRecord[]>("/attendance", { params: query })
    return res.data
  },

  async checkIn(): Promise<AttendanceRecord> {
    if (USE_MOCKS) return mockApi.checkIn()
    const res = await api.post<AttendanceRecord>("/attendance/check-in")
    return res.data
  },

  async checkOut(): Promise<AttendanceRecord> {
    if (USE_MOCKS) return mockApi.checkOut()
    const res = await api.post<AttendanceRecord>("/attendance/check-out")
    return res.data
  },
}
