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
  mustChangePassword?: boolean
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
  workingSchedule?: string | { workingDaysPerWeek: number; expectedHoursPerDay: number; breakMinutes: number }
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

export interface SalaryStructure {
  monthlyWage?: number
  basicSalary: number
  hra: number
  standardAllowance: number
  performanceBonus: number
  lta: number
  fixedAllowance: number
  providentFund: number
  professionalTax: number
  totalDeductions?: number
  grossSalary?: number
  netSalary?: number
  employeePf?: number
  employerPf?: number
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
  salaryStructure?: SalaryStructure
  salaryConfig?: Record<string, unknown>
  payableDaysDetails?: PayableDaysResult
}

export interface PayrollUpdate {
  baseSalary?: number
  allowances?: number
  bonus?: number
  deductions?: number
  salaryStructure?: SalaryStructure
  salaryConfig?: Record<string, unknown>
}

export interface SalaryCalculationInput {
  baseSalary?: number
  allowances?: number
  bonus?: number
  deductions?: number
  monthlyWage?: number
  basicPercentage?: number
  hraPercentage?: number
  standardAllowance?: number
  performanceBonusPercentage?: number
  ltaPercentage?: number
  employeePfRate?: number
  employerPfRate?: number
  professionalTax?: number
}

export interface PayableDaysInput {
  employeeId?: string
  month?: string
  totalWorkingDays?: number
  presentDays?: number
  leaveDays?: number
  unpaidDays?: number
  workingDays?: number
  paidLeaveDays?: number
  unpaidLeaveDays?: number
  missingAttendanceDays?: number
}

export interface PayableDaysResult {
  payableDays: number
  presentDays?: number
  unpaidDays: number
  deductionAmount: number
  workingDays?: number
  payableRatio?: number
}

export interface FullPayrollCalculationInput {
  baseSalary?: number
  allowances?: number
  bonus?: number
  deductions?: number
  totalWorkingDays?: number
  presentDays?: number
  leaveDays?: number
  unpaidDays?: number
  monthlyWage?: number
  salaryConfig?: Record<string, unknown>
  workingDays?: number
  paidLeaveDays?: number
  unpaidLeaveDays?: number
  missingAttendanceDays?: number
}

export interface FullPayrollCalculationResult {
  baseSalary: number
  allowances: number
  bonus: number
  deductions: number
  netPay: number
  payableDays?: number
  unpaidDays?: number
  salaryStructure?: SalaryStructure
  payableDaysDetails?: PayableDaysResult
  payableDaysResult?: PayableDaysResult
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

export interface ChangePasswordInput {
  temporaryPassword: string
  newPassword: string
}

export interface CreateEmployeeInput {
  companyName?: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  department: string
  position: string
  role: UserRole
  employmentType: EmploymentType
}

export interface CreateEmployeeResult {
  employee: Employee
  user: User
  loginId: string
  temporaryPassword: string
}
