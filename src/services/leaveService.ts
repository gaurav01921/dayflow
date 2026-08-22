import { api } from "@/lib/axios"
import { USE_MOCKS } from "@/services/config"
import { mockApi } from "@/mocks/mockApi"
import type {
  LeaveCreateInput,
  LeaveRequest,
  LeaveReviewInput,
} from "@/types/api"

export interface ListLeavesParams {
  employeeId?: string
  status?: LeaveRequest["status"]
}

export const leaveService = {
  async list(params: ListLeavesParams = {}): Promise<LeaveRequest[]> {
    if (USE_MOCKS) return mockApi.listLeaves(params)
    const res = await api.get<LeaveRequest[]>("/leaves", { params })
    return res.data
  },

  async create(input: LeaveCreateInput): Promise<LeaveRequest> {
    if (USE_MOCKS) return mockApi.createLeave(input)
    const res = await api.post<LeaveRequest>("/leaves", input)
    return res.data
  },

  async review(id: string, input: LeaveReviewInput): Promise<LeaveRequest> {
    if (USE_MOCKS) return mockApi.reviewLeave(id, input)
    const res = await api.patch<LeaveRequest>(`/leaves/${id}`, input)
    return res.data
  },
}
