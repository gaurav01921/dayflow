import type { SalaryCalculationInput, SalaryStructure } from "@/types/api"

export function calculateSalary(input: SalaryCalculationInput): SalaryStructure {
  const {
    monthlyWage,
    baseSalary,
    basicPercentage = 50,
    hraPercentage = 50,
    standardAllowance: rawStandardAllowance = 4167,
    performanceBonusPercentage = 8.33,
    ltaPercentage = 8.33,
    employeePfRate = 12,
    employerPfRate = 12,
    professionalTax: rawProfTax = 200,
  } = input

  const wage = Math.max(0, Math.round(monthlyWage ?? baseSalary ?? 5000))

  // Basic: 50% of Monthly Wage
  const basicSalary = Math.round(wage * (basicPercentage / 100))

  // HRA: 50% of Basic Salary
  const hra = Math.round(basicSalary * (hraPercentage / 100))

  // Performance Bonus: 8.33% of Basic Salary
  const performanceBonus = Math.round(basicSalary * (performanceBonusPercentage / 100))

  // LTA: 8.33% of Basic Salary
  const lta = Math.round(basicSalary * (ltaPercentage / 100))

  // Cap Standard Allowance so component sum does not exceed Monthly Wage
  const maxAvailableForAllowances = Math.max(0, wage - (basicSalary + hra + performanceBonus + lta))
  const standardAllowance = Math.min(rawStandardAllowance, maxAvailableForAllowances)

  // Fixed Allowance absorbs remaining wage (never negative)
  const fixedAllowance = Math.max(
    0,
    wage - (basicSalary + hra + standardAllowance + performanceBonus + lta)
  )

  const grossSalary = basicSalary + hra + standardAllowance + performanceBonus + lta + fixedAllowance

  // Employee PF & Employer PF calculated strictly from Basic Salary (12% default)
  const employeePf = Math.round(basicSalary * (employeePfRate / 100))
  const employerPf = Math.round(basicSalary * (employerPfRate / 100))

  const professionalTax = Math.max(0, Math.round(rawProfTax))
  const totalDeductions = employeePf + professionalTax

  const netSalary = Math.max(0, grossSalary - totalDeductions)

  return {
    monthlyWage: wage,
    basicSalary,
    hra,
    standardAllowance,
    performanceBonus,
    lta,
    fixedAllowance,
    grossSalary,
    providentFund: employeePf,
    employeePf,
    employerPf,
    professionalTax,
    totalDeductions,
    netSalary,
  }
}
