export type UserRole = "employee" | "hr" | "admin"

export type EmploymentType = "full-time" | "part-time" | "contract"

export type AttendanceStatus = "present" | "absent" | "half-day" | "leave"

export type LeaveStatus = "pending" | "approved" | "rejected"

export type LeaveType = "paid" | "sick" | "unpaid"

export type NotificationType = "info" | "success" | "warning"

export interface User {
  id: string
  employeeCode: string
  email: string
  role: UserRole
  emailVerified: boolean
}

export interface UserWithPassword extends User {
  password: string
}

export interface DocumentFile {
  id: string
  name: string
  category: string
  uploadedAt: string
}

export interface Employee {
  id: string
  employeeCode: string
  firstName: string
  lastName: string
  email: string
  phone: string
  role: UserRole
  department: string
  position: string
  employmentType: EmploymentType
  joinDate: string
  address: string
  avatarUrl?: string
  documents: DocumentFile[]
}

export interface EmployeeUpdate {
  firstName?: string
  lastName?: string
  phone?: string
  address?: string
  avatarUrl?: string
  department?: string
  position?: string
  employmentType?: EmploymentType
}

export interface AttendanceRecord {
  id: string
  employeeId: string
  date: string // YYYY-MM-DD
  checkIn: string | null // ISO datetime
  checkOut: string | null
  status: AttendanceStatus
  hoursWorked: number
}

export interface AttendanceQuery {
  employeeId?: string
  from?: string // YYYY-MM-DD
  to?: string // YYYY-MM-DD
}

export interface LeaveRequest {
  id: string
  employeeId: string
  type: LeaveType
  startDate: string // YYYY-MM-DD
  endDate: string // YYYY-MM-DD
  days: number
  reason: string
  status: LeaveStatus
  reviewerComment?: string
  reviewedBy?: string
  createdAt: string
}

export interface LeaveCreateInput {
  type: LeaveType
  startDate: string
  endDate: string
  reason: string
}

export interface LeaveReviewInput {
  status: Exclude<LeaveStatus, "pending">
  comment?: string
}

export interface Payroll {
  id: string
  employeeId: string
  month: string // YYYY-MM
  baseSalary: number
  allowances: number
  bonus: number
  deductions: number
  netPay: number
  paymentDate: string
}

export interface PayrollUpdate {
  baseSalary?: number
  allowances?: number
  bonus?: number
  deductions?: number
}

export interface NotificationItem {
  id: string
  userId: string
  title: string
  message: string
  type: NotificationType
  read: boolean
  createdAt: string
}

export interface DashboardStats {
  totalEmployees: number
  presentToday: number
  onLeaveToday: number
  pendingLeaveRequests: number
  monthlyPayrollTotal: number
}

export interface AttendanceReportRow {
  date: string
  present: number
  absent: number
  halfDay: number
  onLeave: number
}

export interface PayrollReport {
  month: string
  totalBase: number
  totalAllowances: number
  totalBonus: number
  totalDeductions: number
  totalNet: number
  byDepartment: { department: string; totalNet: number }[]
}

export interface AuthResponse {
  token: string
  user: User
}

export interface SignUpInput {
  employeeCode: string
  email: string
  password: string
  role: UserRole
}

export interface LoginInput {
  email: string
  password: string
}

export interface VerifyEmailInput {
  email: string
  code: string
}
