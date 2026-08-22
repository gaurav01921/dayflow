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
  documents: DocumentFile[]
  workingSchedule?: WorkingSchedule
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
  monthlyWage: number
  basicSalary: number
  hra: number
  standardAllowance: number
  performanceBonus: number
  lta: number
  fixedAllowance: number
  providentFund: number
  professionalTax: number
  grossSalary: number
  employeePf: number
  employerPf: number
  totalDeductions: number
  netSalary: number
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
  payableDaysDetails?: PayableDaysResult
}

export interface PayrollUpdate {
  baseSalary?: number
  allowances?: number
  bonus?: number
  deductions?: number
  salaryConfig?: SalaryCalculationInput
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

// ── Salary Calculation Engine Types ──

export interface SalaryCalculationInput {
  monthlyWage: number
  basicPercentage?: number        // default 50
  hraPercentage?: number          // default 50 (of Basic)
  standardAllowance?: number      // default 4167
  performanceBonusPercentage?: number // default 8.33 (of Basic)
  ltaPercentage?: number          // default 8.33 (of Basic)
  employeePfRate?: number         // default 12 (of Basic)
  employerPfRate?: number         // default 12 (of Basic)
  professionalTax?: number         // default 200
}

// ── Payable Days Types ──

export interface PayableDaysInput {
  workingDays: number
  presentDays: number
  paidLeaveDays: number
  unpaidLeaveDays: number
  missingAttendanceDays: number
}

export interface PayableDaysResult {
  workingDays: number
  presentDays: number
  paidLeaveDays: number
  unpaidLeaveDays: number
  missingAttendanceDays: number
  payableDays: number
  unpaidDays: number
  missingDays: number
  payableRatio: number
  deductionAmount: number
}

// ── Full Payroll Calculation Types ──

export interface FullPayrollCalculationInput {
  monthlyWage: number
  workingDays: number
  presentDays: number
  paidLeaveDays: number
  unpaidLeaveDays: number
  missingAttendanceDays: number
  allowances?: number
  bonus?: number
  deductions?: number
  salaryConfig?: Omit<SalaryCalculationInput, "monthlyWage">
}

export interface FullPayrollCalculationResult {
  baseSalary: number
  allowances: number
  bonus: number
  deductions: number
  netPay: number
  salaryStructure: SalaryStructure
  payableDaysResult: PayableDaysResult
  payableDaysDetails: PayableDaysResult
  proratedGrossSalary: number
  proratedNetSalary: number
}

// ── Working Schedule Model ──

export interface WorkingSchedule {
  workingDaysPerWeek: number    // default 5
  expectedHoursPerDay: number   // default 8
  breakMinutes: number          // default 60
}
