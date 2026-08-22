import type {
  AttendanceRecord,
  Employee,
  LeaveRequest,
  NotificationItem,
  Payroll,
  UserWithPassword,
} from "@/types/api"

export function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

export function isWeekend(date: Date): boolean {
  const day = date.getDay()
  return day === 0 || day === 6
}

export function countWeekdays(startISO: string, endISO: string): number {
  let count = 0
  const cursor = new Date(startISO + "T00:00:00")
  const end = new Date(endISO + "T00:00:00")
  while (cursor <= end) {
    if (!isWeekend(cursor)) count += 1
    cursor.setDate(cursor.getDate() + 1)
  }
  return Math.max(count, 1)
}

export interface MockDatabase {
  users: UserWithPassword[]
  employees: Employee[]
  attendance: AttendanceRecord[]
  leaves: LeaveRequest[]
  payroll: Payroll[]
  notifications: NotificationItem[]
}

const TODAY = new Date()

function seedEmployees(): { users: UserWithPassword[]; employees: Employee[] } {
  const raw = [
    {
      id: "usr-emp-1",
      code: "EMP001",
      first: "Aarav",
      last: "Mehta",
      email: "employee@dayflow.demo",
      dept: "Engineering",
      position: "Frontend Developer",
      type: "full-time" as const,
      base: 5800,
    },
    {
      id: "usr-emp-2",
      code: "EMP002",
      first: "Sofia",
      last: "Ramirez",
      email: "sofia.ramirez@dayflow.demo",
      dept: "Marketing",
      position: "Marketing Specialist",
      type: "full-time" as const,
      base: 4900,
    },
    {
      id: "usr-emp-3",
      code: "EMP003",
      first: "Liam",
      last: "Chen",
      email: "liam.chen@dayflow.demo",
      dept: "Engineering",
      position: "Backend Developer",
      type: "full-time" as const,
      base: 6400,
    },
    {
      id: "usr-emp-4",
      code: "EMP004",
      first: "Maya",
      last: "Patel",
      email: "maya.patel@dayflow.demo",
      dept: "Design",
      position: "UI/UX Designer",
      type: "full-time" as const,
      base: 5400,
    },
    {
      id: "usr-emp-5",
      code: "EMP005",
      first: "Noah",
      last: "Kim",
      email: "noah.kim@dayflow.demo",
      dept: "Sales",
      position: "Account Executive",
      type: "full-time" as const,
      base: 5200,
    },
    {
      id: "usr-emp-6",
      code: "EMP006",
      first: "Zara",
      last: "Ahmed",
      email: "zara.ahmed@dayflow.demo",
      dept: "Engineering",
      position: "QA Engineer",
      type: "contract" as const,
      base: 4600,
    },
    {
      id: "usr-emp-7",
      code: "EMP007",
      first: "Ethan",
      last: "Brown",
      email: "ethan.brown@dayflow.demo",
      dept: "Finance",
      position: "Payroll Officer",
      type: "part-time" as const,
      base: 3800,
    },
    {
      id: "usr-emp-8",
      code: "EMP008",
      first: "Ines",
      last: "Duarte",
      email: "ines.duarte@dayflow.demo",
      dept: "Design",
      position: "Brand Designer",
      type: "full-time" as const,
      base: 5000,
    },
  ]

  const users: UserWithPassword[] = [
    {
      id: "usr-hr-1",
      employeeCode: "HR001",
      email: "hr@dayflow.demo",
      role: "hr",
      emailVerified: true,
      password: "Demo@123",
    },
    ...raw.map((e) => ({
      id: e.id,
      employeeCode: e.code,
      email: e.email,
      role: "employee" as const,
      emailVerified: true,
      password: "Demo@123",
    })),
  ]

  const employees: Employee[] = raw.map((e, i) => ({
    id: e.id,
    employeeCode: e.code,
    firstName: e.first,
    lastName: e.last,
    email: e.email,
    phone: `+1 (555) 010-${1200 + i * 7}`,
    role: "employee",
    department: e.dept,
    position: e.position,
    employmentType: e.type,
    joinDate: toISODate(addDays(TODAY, -(400 + i * 90))),
    address:
      i % 2 === 0
        ? `${100 + i} Maple Street, Springfield`
        : `${200 + i} Oak Avenue, Rivertown`,
    documents: [
      {
        id: `doc-${i}-1`,
        name: "Employment Contract.pdf",
        category: "Contract",
        uploadedAt: toISODate(addDays(TODAY, -300)),
      },
      {
        id: `doc-${i}-2`,
        name: "ID Document.jpg",
        category: "Identity",
        uploadedAt: toISODate(addDays(TODAY, -299)),
      },
    ],
  }))

  employees.push({
    id: "usr-hr-1",
    employeeCode: "HR001",
    firstName: "Priya",
    lastName: "Sharma",
    email: "hr@dayflow.demo",
    phone: "+1 (555) 010-999",
    role: "hr",
    department: "People Ops",
    position: "HR Manager",
    employmentType: "full-time",
    joinDate: toISODate(addDays(TODAY, -900)),
    address: "12 Cedar Lane, Springfield",
    documents: [
      {
        id: "doc-hr-1",
        name: "Employment Contract.pdf",
        category: "Contract",
        uploadedAt: toISODate(addDays(TODAY, -899)),
      },
    ],
  })

  return { users, employees }
}

function seedAttendance(employeeIds: string[]): AttendanceRecord[] {
  const records: AttendanceRecord[] = []
  for (let offset = 14; offset >= 1; offset--) {
    const date = addDays(TODAY, -offset)
    if (isWeekend(date)) continue
employeeIds.forEach((empId, _idx) => {
      const roll = (_idx * 7 + offset * 3) % 17
      let status: AttendanceRecord["status"] = "present"
      if (roll === 3) status = "half-day"
      else if (roll === 8) status = "absent"
      else if (roll === 12 || empId === "usr-emp-3" && offset <= 3) status = "leave"
      const checkedIn = status === "present" || status === "half-day"
      records.push({
        id: `att-${empId}-${toISODate(date)}`,
        employeeId: empId,
        date: toISODate(date),
        checkIn: checkedIn ? new Date(date.setHours(9, 2 + _idx)).toISOString() : null,
        checkOut: checkedIn ? new Date(date.setHours(status === "half-day" ? 13 : 17, 30)).toISOString() : null,
        status,
        hoursWorked: status === "present" ? 8 : status === "half-day" ? 4 : 0,
      })
    })
  }
  // Today: everyone present except demo employee (so check-in works live in the demo).
  const todayISO = toISODate(TODAY)
  const now = new Date()
  employeeIds.forEach((empId) => {
    if (empId === "usr-emp-1") return
    records.push({
      id: `att-${empId}-${todayISO}`,
      employeeId: empId,
      date: todayISO,
      checkIn: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 5).toISOString(),
      checkOut: null,
      status: "present",
      hoursWorked: 0,
    })
  })
  return records
}

function seedLeaves(): LeaveRequest[] {
  return [
    {
      id: "lv-1",
      employeeId: "usr-emp-3",
      type: "sick",
      startDate: toISODate(addDays(TODAY, -4)),
      endDate: toISODate(addDays(TODAY, -3)),
      days: 2,
      reason: "Flu, doctor advised rest.",
      status: "approved",
      reviewerComment: "Get well soon.",
      reviewedBy: "Priya Sharma",
      createdAt: toISODate(addDays(TODAY, -5)),
    },
    {
      id: "lv-2",
      employeeId: "usr-emp-2",
      type: "unpaid",
      startDate: toISODate(addDays(TODAY, -10)),
      endDate: toISODate(addDays(TODAY, -9)),
      days: 2,
      reason: "Personal errands out of town.",
      status: "rejected",
      reviewerComment: "Team launch week — please reschedule.",
      reviewedBy: "Priya Sharma",
      createdAt: toISODate(addDays(TODAY, -13)),
    },
    {
      id: "lv-3",
      employeeId: "usr-emp-5",
      type: "paid",
      startDate: toISODate(addDays(TODAY, 7)),
      endDate: toISODate(addDays(TODAY, 11)),
      days: 5,
      reason: "Family vacation.",
      status: "pending",
      createdAt: toISODate(addDays(TODAY, -1)),
    },
    {
      id: "lv-4",
      employeeId: "usr-emp-4",
      type: "sick",
      startDate: toISODate(addDays(TODAY, 1)),
      endDate: toISODate(addDays(TODAY, 1)),
      days: 1,
      reason: "Dental appointment.",
      status: "pending",
      createdAt: toISODate(addDays(TODAY, -2)),
    },
    {
      id: "lv-5",
      employeeId: "usr-emp-1",
      type: "paid",
      startDate: toISODate(addDays(TODAY, -20)),
      endDate: toISODate(addDays(TODAY, -20)),
      days: 1,
      reason: "Family function.",
      status: "approved",
      reviewerComment: "Approved.",
      reviewedBy: "Priya Sharma",
      createdAt: toISODate(addDays(TODAY, -24)),
    },
  ]
}

function seedPayroll(
  employees: Employee[],
  bases: Map<string, number>
): Payroll[] {
  const records: Payroll[] = []
  for (let m = 3; m >= 1; m--) {
    const monthDate = new Date(TODAY.getFullYear(), TODAY.getMonth() - (m - 1), 15)
    const month = monthDate.toISOString().slice(0, 7)
    employees.forEach((emp) => {
      if (emp.role !== "employee") return
      const base = bases.get(emp.id) ?? 5000
      const allowances = 350 + ((base % 400))
      const bonus = emp.id === "usr-emp-1" && m === 1 ? 500 : 0
      const deductions = Math.round(base * 0.12)
      records.push({
        id: `pay-${emp.id}-${month}`,
        employeeId: emp.id,
        month,
        baseSalary: base,
        allowances,
        bonus,
        deductions,
        netPay: base + allowances + bonus - deductions,
        paymentDate: `${month}-28`,
      })
    })
  }
  return records
}

function seedNotifications(): NotificationItem[] {
  return [
    {
      id: "nt-1",
      userId: "usr-emp-1",
      title: "Welcome to DayFlow",
      message: "Your account is ready. Explore your dashboard.",
      type: "info",
      read: false,
      createdAt: toISODate(addDays(TODAY, -30)),
    },
    {
      id: "nt-2",
      userId: "usr-emp-1",
      title: "Payslip available",
      message: "Your payslip for this month has been published.",
      type: "success",
      read: false,
      createdAt: toISODate(addDays(TODAY, -3)),
    },
    {
      id: "nt-3",
      userId: "usr-hr-1",
      title: "Pending leave requests",
      message: "2 leave requests are waiting for your review.",
      type: "warning",
      read: false,
      createdAt: toISODate(addDays(TODAY, -1)),
    },
    {
      id: "nt-4",
      userId: "usr-hr-1",
      title: "Payroll draft ready",
      message: "Review this month's payroll before the 28th.",
      type: "info",
      read: true,
      createdAt: toISODate(addDays(TODAY, -2)),
    },
  ]
}

function seed(): MockDatabase {
  const { users, employees } = seedEmployees()
  const employeeUserIds = users.filter((u) => u.role === "employee").map((u) => u.id)
  const bases = new Map<string, number>()
  employees.forEach((e) => {
    if (e.role === "employee") {
      const match = seedEmployeesRawBase(e.employeeCode)
      bases.set(e.id, match)
    }
  })
  return {
    users,
    employees,
    attendance: seedAttendance(employeeUserIds),
    leaves: seedLeaves(),
    payroll: seedPayroll(employees, bases),
    notifications: seedNotifications(),
  }
}

const BASES_BY_CODE: Record<string, number> = {
  EMP001: 5800,
  EMP002: 4900,
  EMP003: 6400,
  EMP004: 5400,
  EMP005: 5200,
  EMP006: 4600,
  EMP007: 3800,
  EMP008: 5000,
}

function seedEmployeesRawBase(code: string): number {
  return BASES_BY_CODE[code] ?? 5000
}

export const mockDb: MockDatabase = seed()

let counter = 100
export function nextId(prefix: string): string {
  counter += 1
  return `${prefix}-${counter}`
}
