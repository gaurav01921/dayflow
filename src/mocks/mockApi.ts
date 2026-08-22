import { ApiError } from "@/lib/api-error"
import { useAuthStore } from "@/stores/authStore"
import {
  addDays,
  countWeekdays,
  isWeekend,
  mockDb,
  nextId,
  toISODate,
} from "@/mocks/mockDb"
import type {
  AttendanceQuery,
  AttendanceRecord,
  AttendanceReportRow,
  AuthResponse,
  DashboardStats,
  Employee,
  EmployeeUpdate,
  LeaveCreateInput,
  LeaveRequest,
  LeaveReviewInput,
  LoginInput,
  NotificationItem,
  Payroll,
  PayrollReport,
  PayrollUpdate,
  SignUpInput,
  User,
  VerifyEmailInput,
  ChangePasswordInput,
  CreateEmployeeInput,
  CreateEmployeeResult,
} from "@/types/api"

interface Session {
  userId: string
}

let session: Session | null = null

function delay<T>(value: T): Promise<T> {
  const ms = 120 + Math.random() * 180
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

function currentUser(): User {
  if (!session) {
    const storeUser = useAuthStore.getState().user
    if (storeUser?.id) {
      session = { userId: storeUser.id }
    }
  }
  if (!session) {
    throw new ApiError("You must be signed in.", "UNAUTHORIZED")
  }
  const found = mockDb.users.find((u) => u.id === session!.userId)
  if (!found) throw new ApiError("You must be signed in.", "UNAUTHORIZED")
  return {
    id: found.id,
    employeeCode: found.employeeCode,
    email: found.email,
    role: found.role,
    emailVerified: found.emailVerified,
  }
}

function requireManager(): void {
  const user = currentUser()
  if (user.role !== "hr" && user.role !== "admin") {
    throw new ApiError("HR or admin access required.", "FORBIDDEN")
  }
}

function publicUser(userId: string): User {
  const u = mockDb.users.find((x) => x.id === userId)
  if (!u) throw new ApiError("Account not found.", "NOT_FOUND")
  return {
    id: u.id,
    employeeCode: u.employeeCode,
    email: u.email,
    role: u.role,
    emailVerified: u.emailVerified,
    mustChangePassword: u.mustChangePassword ?? false,
  }
}

function makeToken(userId: string): string {
  return `mock-token.${userId}.${Date.now()}`
}

function pushNotification(
  userId: string,
  title: string,
  message: string,
  type: NotificationItem["type"]
): void {
  mockDb.notifications.unshift({
    id: nextId("nt"),
    userId,
    title,
    message,
    type,
    read: false,
    createdAt: new Date().toISOString(),
  })
}

export const mockApi = {
  // ---------- auth ----------
  async signup(input: SignUpInput): Promise<AuthResponse> {
    if (mockDb.users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
      throw new ApiError("An account with this email already exists.", "EMAIL_EXISTS")
    }
    if (mockDb.users.some((u) => u.employeeCode === input.employeeCode)) {
      throw new ApiError("This employee ID is already registered.", "EMPLOYEE_CODE_EXISTS")
    }
    const id = nextId("usr")
    mockDb.users.push({
      id,
      employeeCode: input.employeeCode,
      email: input.email,
      role: input.role,
      emailVerified: false,
      password: input.password,
    })
    mockDb.employees.push({
      id,
      employeeCode: input.employeeCode,
      firstName: "New",
      lastName: "Employee",
      email: input.email,
      phone: "",
      role: input.role,
      department: "Unassigned",
      position: "Unassigned",
      employmentType: "full-time",
      joinDate: toISODate(new Date()),
      address: "",
      documents: [],
    })
    session = { userId: id }
    return delay({ token: makeToken(id), user: publicUser(id) })
  },

  async login(input: LoginInput): Promise<AuthResponse> {
    const query = input.email.trim().toLowerCase()
    const found = mockDb.users.find(
      (u) => u.email.toLowerCase() === query || u.employeeCode.toLowerCase() === query
    )
    if (!found || found.password !== input.password) {
      throw new ApiError("Incorrect Login ID / email or password.", "INVALID_CREDENTIALS")
    }
    if (!found.emailVerified) {
      throw new ApiError(
        "Please verify your email before signing in.",
        "UNAUTHORIZED"
      )
    }
    session = { userId: found.id }
    return delay({ token: makeToken(found.id), user: publicUser(found.id) })
  },

  async createEmployee(input: CreateEmployeeInput): Promise<CreateEmployeeResult> {
    requireManager()
    if (mockDb.users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
      throw new ApiError("An account with this email already exists.", "EMAIL_EXISTS")
    }

    // Generate Login ID: Org/Company prefix + Initials + Year + Serial Counter
    const companyPrefix = (input.companyName ?? "DAYFLOW")
      .replace(/[^a-zA-Z]/g, "")
      .slice(0, 3)
      .toUpperCase() || "DFS"
    const initials = `${input.firstName[0] ?? "E"}${input.lastName[0] ?? "M"}`.toUpperCase()
    const year = new Date().getFullYear()
    const serialNum = String(mockDb.employees.length + 1).padStart(4, "0")
    const loginId = `${companyPrefix}${initials}${year}${serialNum}`

    // Generate 8-character random temporary password
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789"
    let tempPass = ""
    for (let i = 0; i < 8; i++) {
      tempPass += chars.charAt(Math.floor(Math.random() * chars.length))
    }

    const id = nextId("usr")
    const newUser = {
      id,
      employeeCode: loginId,
      email: input.email,
      role: input.role,
      emailVerified: true, // Created by HR -> verified
      mustChangePassword: true,
      password: tempPass,
    }
    mockDb.users.push(newUser)

    const newEmp: Employee = {
      id,
      employeeCode: loginId,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone ?? "",
      role: input.role,
      department: input.department,
      position: input.position,
      employmentType: input.employmentType,
      joinDate: toISODate(new Date()),
      address: "",
      documents: [],
    }
    mockDb.employees.push(newEmp)

    return delay({
      employee: newEmp,
      user: publicUser(id),
      loginId,
      temporaryPassword: tempPass,
    })
  },

  async changePassword(input: ChangePasswordInput): Promise<{ user: User }> {
    const me = currentUser()
    const found = mockDb.users.find((u) => u.id === me.id)
    if (!found) throw new ApiError("Account not found.", "NOT_FOUND")

    if (found.password !== input.temporaryPassword) {
      throw new ApiError("Current / temporary password does not match.", "INVALID_CREDENTIALS")
    }

    found.password = input.newPassword
    found.mustChangePassword = false

    return delay({ user: publicUser(found.id) })
  },

  async verifyEmail(input: VerifyEmailInput): Promise<{ user: User }> {
    const found = mockDb.users.find(
      (u) => u.email.toLowerCase() === input.email.toLowerCase()
    )
    if (!found) throw new ApiError("Account not found.", "NOT_FOUND")
    if (input.code !== "123456") {
      throw new ApiError("Invalid verification code.", "INVALID_INPUT")
    }
    found.emailVerified = true
    return delay({ user: publicUser(found.id) })
  },

  logout(): Promise<void> {
    session = null
    return delay(undefined)
  },

  // ---------- employees ----------
  async listEmployees(): Promise<Employee[]> {
    requireManager()
    return delay([...mockDb.employees])
  },

  async getEmployee(id?: string): Promise<Employee> {
    const target = id ?? currentUser().id
    const me = currentUser()
    if (me.role === "employee" && me.id !== target) {
      throw new ApiError("You can only view your own profile.", "FORBIDDEN")
    }
    const found = mockDb.employees.find((e) => e.id === target)
    if (!found) throw new ApiError("Employee not found.", "NOT_FOUND")
    return delay({ ...found })
  },

  async updateEmployee(id: string, patch: EmployeeUpdate): Promise<Employee> {
    const me = currentUser()
    const found = mockDb.employees.find((e) => e.id === id)
    if (!found) throw new ApiError("Employee not found.", "NOT_FOUND")
    const isSelf = me.id === id
    const isManager = me.role === "hr" || me.role === "admin"
    if (!isManager && !isSelf) {
      throw new ApiError("You can only edit your own profile.", "FORBIDDEN")
    }
    const managerFields: (keyof EmployeeUpdate)[] = [
      "department",
      "position",
      "employmentType",
    ]
    if (!isManager && Object.keys(patch).some((k) => managerFields.includes(k as keyof EmployeeUpdate))) {
      throw new ApiError("Only HR can change job details.", "FORBIDDEN")
    }
    Object.assign(found, patch)
    return delay({ ...found })
  },

  // ---------- attendance ----------
  async getAttendance(query: AttendanceQuery): Promise<AttendanceRecord[]> {
    const me = currentUser()
    const employeeId =
      me.role === "employee" ? me.id : (query.employeeId ?? undefined)
    let rows = mockDb.attendance.filter((r) =>
      employeeId ? r.employeeId === employeeId : true
    )
    if (query.from) rows = rows.filter((r) => r.date >= query.from!)
    if (query.to) rows = rows.filter((r) => r.date <= query.to!)
    rows.sort((a, b) => b.date.localeCompare(a.date))
    return delay(rows.map((r) => ({ ...r })))
  },

  async checkIn(): Promise<AttendanceRecord> {
    const me = currentUser()
    const today = toISODate(new Date())
    const existing = mockDb.attendance.find(
      (r) => r.employeeId === me.id && r.date === today
    )
    if (existing && existing.checkIn) {
      throw new ApiError("You have already checked in today.", "ALREADY_CHECKED_IN")
    }
    if (existing) {
      existing.checkIn = new Date().toISOString()
      existing.status = "present"
      return delay({ ...existing })
    }
    const record: AttendanceRecord = {
      id: nextId("att"),
      employeeId: me.id,
      date: today,
      checkIn: new Date().toISOString(),
      checkOut: null,
      status: "present",
      hoursWorked: 0,
    }
    mockDb.attendance.unshift(record)
    return delay({ ...record })
  },

  async checkOut(): Promise<AttendanceRecord> {
    const me = currentUser()
    const today = toISODate(new Date())
    const existing = mockDb.attendance.find(
      (r) => r.employeeId === me.id && r.date === today
    )
    if (!existing || !existing.checkIn || existing.checkOut) {
      throw new ApiError("You have not checked in yet.", "NOT_CHECKED_IN")
    }
    existing.checkOut = new Date().toISOString()
    const start = new Date(existing.checkIn).getTime()
    const end = new Date(existing.checkOut).getTime()
    existing.hoursWorked = Math.max(0, Math.round(((end - start) / 3_600_000) * 10) / 10)
    return delay({ ...existing })
  },

  // ---------- leaves ----------
  async listLeaves(params: {
    employeeId?: string
    status?: LeaveRequest["status"]
  }): Promise<LeaveRequest[]> {
    const me = currentUser()
    const employeeId =
      me.role === "employee" ? me.id : (params.employeeId ?? undefined)
    let rows = mockDb.leaves.filter((l) =>
      employeeId ? l.employeeId === employeeId : true
    )
    if (params.status) rows = rows.filter((l) => l.status === params.status)
    rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    return delay(rows.map((l) => ({ ...l })))
  },

  async createLeave(input: LeaveCreateInput): Promise<LeaveRequest> {
    const me = currentUser()
    if (input.endDate < input.startDate) {
      throw new ApiError(
        "End date cannot be before the start date.",
        "LEAVE_SUBMISSION_FAILED"
      )
    }
    const leave: LeaveRequest = {
      id: nextId("lv"),
      employeeId: me.id,
      type: input.type,
      startDate: input.startDate,
      endDate: input.endDate,
      days: countWeekdays(input.startDate, input.endDate),
      reason: input.reason,
      status: "pending",
      createdAt: new Date().toISOString(),
    }
    mockDb.leaves.unshift(leave)
    pushNotification(
      "usr-hr-1",
      "New leave request",
      `${me.employeeCode} requested ${leave.type} leave (${leave.days} day${leave.days > 1 ? "s" : ""}).`,
      "warning"
    )
    return delay({ ...leave })
  },

  async reviewLeave(id: string, input: LeaveReviewInput): Promise<LeaveRequest> {
    requireManager()
    const leave = mockDb.leaves.find((l) => l.id === id)
    if (!leave) throw new ApiError("Leave request not found.", "NOT_FOUND")
    leave.status = input.status
    leave.reviewerComment = input.comment ?? ""
    leave.reviewedBy = currentUser().email
    if (input.status === "approved") {
      const cursor = new Date(leave.startDate + "T00:00:00")
      const end = new Date(leave.endDate + "T00:00:00")
      while (cursor <= end) {
        if (!isWeekend(cursor)) {
          const iso = toISODate(cursor)
          const record = mockDb.attendance.find(
            (r) => r.employeeId === leave.employeeId && r.date === iso
          )
          if (record) {
            record.status = "leave"
            record.checkIn = null
            record.checkOut = null
            record.hoursWorked = 0
          } else {
            mockDb.attendance.push({
              id: nextId("att"),
              employeeId: leave.employeeId,
              date: iso,
              checkIn: null,
              checkOut: null,
              status: "leave",
              hoursWorked: 0,
            })
          }
        }
        cursor.setDate(cursor.getDate() + 1)
      }
    }
    pushNotification(
      leave.employeeId,
      `Leave ${input.status}`,
      `Your ${leave.type} leave (${leave.startDate} to ${leave.endDate}) was ${input.status}.`,
      input.status === "approved" ? "success" : "warning"
    )
    return delay({ ...leave })
  },

  // ---------- payroll ----------
  async listPayroll(employeeIdParam?: string): Promise<Payroll[]> {
    const me = currentUser()
    const employeeId =
      me.role === "employee" ? me.id : (employeeIdParam ?? me.id)
    const rows = mockDb.payroll
      .filter((p) => p.employeeId === employeeId)
      .sort((a, b) => b.month.localeCompare(a.month))
    return delay(rows.map((p) => ({ ...p })))
  },

  async updatePayroll(employeeId: string, patch: PayrollUpdate): Promise<Payroll> {
    requireManager()
    const month = toISODate(new Date()).slice(0, 7)
    let record = mockDb.payroll.find(
      (p) => p.employeeId === employeeId && p.month === month
    )
    if (!record) {
      record = {
        id: nextId("pay"),
        employeeId,
        month,
        baseSalary: 5000,
        allowances: 400,
        bonus: 0,
        deductions: 600,
        netPay: 4800,
        paymentDate: `${month}-28`,
      }
      mockDb.payroll.push(record)
    }
    Object.assign(record, patch)
    record.netPay =
      record.baseSalary + record.allowances + record.bonus - record.deductions
    pushNotification(
      employeeId,
      "Payroll updated",
      `Your salary details for ${month} were updated by HR.`,
      "info"
    )
    return delay({ ...record })
  },

  // ---------- notifications ----------
  async listNotifications(): Promise<NotificationItem[]> {
    const me = currentUser()
    const rows = mockDb.notifications.filter((n) => n.userId === me.id)
    rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    return delay(rows.map((n) => ({ ...n })))
  },

  async markNotificationAsRead(id: string): Promise<NotificationItem> {
    const me = currentUser()
    const item = mockDb.notifications.find((n) => n.id === id && n.userId === me.id)
    if (!item) throw new ApiError("Notification not found.", "NOT_FOUND")
    item.read = true
    return delay({ ...item })
  },


  // ---------- reports ----------
  async dashboardStats(): Promise<DashboardStats> {
    requireManager()
    const today = toISODate(new Date())
    const employees = mockDb.employees.filter((e) => e.role === "employee")
    const todayRecords = mockDb.attendance.filter((r) => r.date === today)
    const month = today.slice(0, 7)
    const monthlyPayrollTotal = mockDb.payroll
      .filter((p) => p.month === month)
      .reduce((sum, p) => sum + p.netPay, 0)
    return delay({
      totalEmployees: employees.length,
      presentToday: todayRecords.filter((r) => r.status === "present").length,
      onLeaveToday: todayRecords.filter((r) => r.status === "leave").length,
      pendingLeaveRequests: mockDb.leaves.filter((l) => l.status === "pending").length,
      monthlyPayrollTotal,
    })
  },

  async attendanceReport(days: number): Promise<AttendanceReportRow[]> {
    requireManager()
    const from = toISODate(addDays(new Date(), -days))
    const rowsByDate = new Map<string, AttendanceReportRow>()
    for (const r of mockDb.attendance) {
      if (r.date < from || r.date > toISODate(new Date())) continue
      let row = rowsByDate.get(r.date)
      if (!row) {
        row = { date: r.date, present: 0, absent: 0, halfDay: 0, onLeave: 0 }
        rowsByDate.set(r.date, row)
      }
      if (r.status === "present") row.present += 1
      else if (r.status === "absent") row.absent += 1
      else if (r.status === "half-day") row.halfDay += 1
      else row.onLeave += 1
    }
    const sorted = [...rowsByDate.values()].sort((a, b) => a.date.localeCompare(b.date))
    return delay(sorted)
  },

  async payrollReport(): Promise<PayrollReport> {
    requireManager()
    const month = toISODate(new Date()).slice(0, 7)
    const rows = mockDb.payroll.filter((p) => p.month === month)
    const byDepartmentMap = new Map<string, number>()
    for (const p of rows) {
      const emp = mockDb.employees.find((e) => e.id === p.employeeId)
      const dept = emp?.department ?? "Unknown"
      byDepartmentMap.set(dept, (byDepartmentMap.get(dept) ?? 0) + p.netPay)
    }
    return delay({
      month,
      totalBase: rows.reduce((s, p) => s + p.baseSalary, 0),
      totalAllowances: rows.reduce((s, p) => s + p.allowances, 0),
      totalBonus: rows.reduce((s, p) => s + p.bonus, 0),
      totalDeductions: rows.reduce((s, p) => s + p.deductions, 0),
      totalNet: rows.reduce((s, p) => s + p.netPay, 0),
      byDepartment: [...byDepartmentMap.entries()].map(([department, totalNet]) => ({
        department,
        totalNet,
      })),
    })
  },
}
