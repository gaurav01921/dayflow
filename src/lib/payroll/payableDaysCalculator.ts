import type {
  AttendanceRecord,
  FullPayrollCalculationInput,
  FullPayrollCalculationResult,
  LeaveRequest,
  PayableDaysInput,
  PayableDaysResult,
} from "@/types/api"
import { calculateSalary } from "./salaryCalculator"

export function calculatePayableDays(input: PayableDaysInput): PayableDaysResult {
  const workingDays = input.workingDays ?? input.totalWorkingDays ?? 22
  const presentDays = input.presentDays ?? 0
  const paidLeaveDays = input.paidLeaveDays ?? input.leaveDays ?? 0
  const unpaidLeaveDays = input.unpaidLeaveDays ?? input.unpaidDays ?? 0
  const missingAttendanceDays = input.missingAttendanceDays ?? 0

  const totalWorkingDays = Math.max(0, workingDays)
  const validPresent = Math.max(0, presentDays)
  const validPaidLeave = Math.max(0, paidLeaveDays)
  const validUnpaidLeave = Math.max(0, unpaidLeaveDays)
  const validMissing = Math.max(0, missingAttendanceDays)

  // Present + Paid Leave = Payable Days
  const payableDays = Math.min(totalWorkingDays, validPresent + validPaidLeave)
  const unpaidDays = validUnpaidLeave
  const missingDays = validMissing

  const payableRatio = totalWorkingDays > 0 ? payableDays / totalWorkingDays : 1

  return {
    workingDays: totalWorkingDays,
    presentDays: validPresent,
    paidLeaveDays,
    unpaidLeaveDays: validUnpaidLeave,
    missingAttendanceDays: validMissing,
    payableDays,
    unpaidDays,
    missingDays,
    payableRatio,
    deductionAmount: 0,
  } as PayableDaysResult & { paidLeaveDays?: number; unpaidLeaveDays?: number; missingAttendanceDays?: number; missingDays?: number }
}

export function summarizeAttendanceAndLeaves(
  workingDays: number,
  attendanceRecords: AttendanceRecord[],
  leaveRequests: LeaveRequest[]
): PayableDaysResult {
  const dateStatusMap = new Map<string, "paidLeave" | "unpaidLeave" | "present" | "missing">()

  // Process approved leaves first
  const approvedLeaves = leaveRequests.filter((l) => l.status === "approved")
  for (const leave of approvedLeaves) {
    const start = new Date(leave.startDate)
    const end = new Date(leave.endDate)
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay()
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        const dateStr = d.toISOString().slice(0, 10)
        dateStatusMap.set(dateStr, leave.type === "unpaid" ? "unpaidLeave" : "paidLeave")
      }
    }
  }

  // Process attendance records for dates not already marked as leave
  for (const att of attendanceRecords) {
    if (!dateStatusMap.has(att.date)) {
      if (att.status === "present" || att.status === "half-day") {
        dateStatusMap.set(att.date, "present")
      } else if (att.status === "leave") {
        dateStatusMap.set(att.date, "paidLeave")
      }
    }
  }

  let presentDays = 0
  let paidLeaveDays = 0
  let unpaidLeaveDays = 0

  for (const status of dateStatusMap.values()) {
    if (status === "present") presentDays++
    else if (status === "paidLeave") paidLeaveDays++
    else if (status === "unpaidLeave") unpaidLeaveDays++
  }

  const accountedDays = presentDays + paidLeaveDays + unpaidLeaveDays
  const missingAttendanceDays = Math.max(0, workingDays - accountedDays)

  return calculatePayableDays({
    workingDays,
    presentDays,
    paidLeaveDays,
    unpaidLeaveDays,
    missingAttendanceDays,
  })
}

export function calculateFullPayroll(
  input: FullPayrollCalculationInput
): FullPayrollCalculationResult {
  const monthlyWage = input.monthlyWage ?? input.baseSalary ?? 5000
  const salaryStructure = calculateSalary({
    monthlyWage,
    baseSalary: input.baseSalary ?? monthlyWage,
    ...input.salaryConfig,
  })

  const payableDaysResult = calculatePayableDays({
    workingDays: input.workingDays ?? input.totalWorkingDays ?? 22,
    presentDays: input.presentDays ?? 0,
    paidLeaveDays: input.paidLeaveDays ?? input.leaveDays ?? 0,
    unpaidLeaveDays: input.unpaidLeaveDays ?? input.unpaidDays ?? 0,
    missingAttendanceDays: input.missingAttendanceDays ?? 0,
  })

  const grossSalary = salaryStructure.grossSalary ?? (salaryStructure.basicSalary + salaryStructure.hra)
  const netSalary = salaryStructure.netSalary ?? grossSalary
  const payableRatio = payableDaysResult.payableRatio ?? 1

  const proratedGrossSalary = Math.round(grossSalary * payableRatio)
  const proratedNetSalary = Math.round(netSalary * payableRatio)

  return {
    baseSalary: input.baseSalary ?? monthlyWage,
    allowances: input.allowances ?? salaryStructure.standardAllowance,
    bonus: input.bonus ?? salaryStructure.performanceBonus,
    deductions: input.deductions ?? (salaryStructure.totalDeductions ?? 0),
    netPay: proratedNetSalary,
    salaryStructure,
    payableDaysResult,
    payableDaysDetails: payableDaysResult,
    proratedGrossSalary,
    proratedNetSalary,
  } as FullPayrollCalculationResult & { proratedGrossSalary?: number; proratedNetSalary?: number }
}
