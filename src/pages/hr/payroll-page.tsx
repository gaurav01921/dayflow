import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  Banknote,
  DollarSign,
  Edit,
  TrendingDown,
  TrendingUp,
} from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"

import { StatCard } from "@/components/dashboard/stat-card"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SearchBar } from "@/components/ui/search-bar"
import { formatCurrency } from "@/lib/utils"
import { employeeService } from "@/services/employeeService"
import { payrollService } from "@/services/payrollService"
import { reportService } from "@/services/reportService"
import type { Employee, Payroll } from "@/types/api"

export function HrPayrollPage() {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState("")
  const [editingPayroll, setEditingPayroll] = useState<{
    employee: Employee
    payroll: Payroll
  } | null>(null)

  const [baseSalaryInput, setBaseSalaryInput] = useState<number>(0)
  const [allowancesInput, setAllowancesInput] = useState<number>(0)
  const [bonusInput, setBonusInput] = useState<number>(0)
  const [deductionsInput, setDeductionsInput] = useState<number>(0)

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: employeeService.list,
  })

  const { data: payrollReport } = useQuery({
    queryKey: ["reports", "payroll"],
    queryFn: () => reportService.payrollReport(),
  })

  const { data: allPayroll = [], isLoading: loadingPayroll } = useQuery({
    queryKey: ["payroll", "all"],
    queryFn: () => payrollService.list("all"),
  })

  const employeeMap = useMemo(() => {
    const map = new Map<string, Employee>()
    for (const emp of employees) {
      map.set(emp.id, emp)
    }
    return map
  }, [employees])

  const updateMutation = useMutation({
    mutationFn: ({
      employeeId,
      patch,
    }: {
      employeeId: string
      patch: { baseSalary: number; allowances: number; bonus: number; deductions: number }
    }) => payrollService.update(employeeId, patch),
    onSuccess: () => {
      toast.success("Payroll details updated successfully.")
      void queryClient.invalidateQueries({ queryKey: ["payroll"] })
      void queryClient.invalidateQueries({ queryKey: ["reports"] })
      setEditingPayroll(null)
    },
    onError: () => toast.error("Failed to update payroll record."),
  })

  const handleEditClick = (emp: Employee, p: Payroll) => {
    setEditingPayroll({ employee: emp, payroll: p })
    setBaseSalaryInput(p.baseSalary)
    setAllowancesInput(p.allowances)
    setBonusInput(p.bonus)
    setDeductionsInput(p.deductions)
  }

  const handleSaveEdit = () => {
    if (!editingPayroll) return
    updateMutation.mutate({
      employeeId: editingPayroll.employee.id,
      patch: {
        baseSalary: Number(baseSalaryInput),
        allowances: Number(allowancesInput),
        bonus: Number(bonusInput),
        deductions: Number(deductionsInput),
      },
    })
  }

  const filteredPayroll = useMemo(() => {
    return allPayroll.filter((p) => {
      const emp = employeeMap.get(p.employeeId)
      const empName = emp ? `${emp.firstName} ${emp.lastName}` : p.employeeId
      const empCode = emp ? emp.employeeCode : ""
      const search = searchTerm.toLowerCase()

      return (
        empName.toLowerCase().includes(search) ||
        empCode.toLowerCase().includes(search) ||
        p.month.includes(search)
      )
    })
  }, [allPayroll, employeeMap, searchTerm])

  const totals = useMemo(() => {
    const totalBase = payrollReport?.totalBase ?? allPayroll.reduce((sum, p) => sum + p.baseSalary, 0)
    const totalNet = payrollReport?.totalNet ?? allPayroll.reduce((sum, p) => sum + p.netPay, 0)
    const totalAllowances = payrollReport?.totalAllowances ?? allPayroll.reduce((sum, p) => sum + p.allowances, 0)
    const totalDeductions = payrollReport?.totalDeductions ?? allPayroll.reduce((sum, p) => sum + p.deductions, 0)

    return { totalBase, totalNet, totalAllowances, totalDeductions }
  }, [payrollReport, allPayroll])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workforce Payroll & Compensation"
        description="Oversee company wage distributions, adjust salary components, and verify monthly payslips."
      />

      {/* Edit Payroll Dialog */}
      <Dialog open={!!editingPayroll} onOpenChange={(open) => !open && setEditingPayroll(null)}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Adjust Salary Components</DialogTitle>
            <DialogDescription>
              Update compensation baseline for {editingPayroll?.employee.firstName}{" "}
              {editingPayroll?.employee.lastName} ({editingPayroll?.employee.employeeCode})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="baseSalary">Base Salary ($)</Label>
              <Input
                id="baseSalary"
                type="number"
                value={baseSalaryInput}
                onChange={(e) => setBaseSalaryInput(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="allowances">Allowances ($)</Label>
              <Input
                id="allowances"
                type="number"
                value={allowancesInput}
                onChange={(e) => setAllowancesInput(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bonus">Bonus / Incentives ($)</Label>
              <Input
                id="bonus"
                type="number"
                value={bonusInput}
                onChange={(e) => setBonusInput(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deductions">Deductions (Tax, PF) ($)</Label>
              <Input
                id="deductions"
                type="number"
                value={deductionsInput}
                onChange={(e) => setDeductionsInput(Number(e.target.value))}
              />
            </div>

            <div className="rounded-lg bg-primary/10 p-3 text-xs flex justify-between items-center text-primary font-medium">
              <span>Estimated Net Take-Home:</span>
              <span className="text-base font-bold text-foreground">
                {formatCurrency(baseSalaryInput + allowancesInput + bonusInput - deductionsInput)}
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingPayroll(null)}>
              Cancel
            </Button>
            <Button disabled={updateMutation.isPending} onClick={handleSaveEdit}>
              {updateMutation.isPending ? "Saving Changes…" : "Save Adjustment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Summary KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Net Payroll"
          value={formatCurrency(totals.totalNet)}
          hint="Net monthly company outflow"
          icon={Banknote}
          tone="primary"
        />
        <StatCard
          title="Base Salaries"
          value={formatCurrency(totals.totalBase)}
          hint="Contracted base wage total"
          icon={DollarSign}
          tone="info"
        />
        <StatCard
          title="Total Allowances"
          value={formatCurrency(totals.totalAllowances)}
          hint="HRA & bonus allocations"
          icon={TrendingUp}
          tone="success"
        />
        <StatCard
          title="Total Deductions"
          value={formatCurrency(totals.totalDeductions)}
          hint="Tax & retirement withholdings"
          icon={TrendingDown}
          tone="destructive"
        />
      </div>

      {/* Payroll Ledger Table */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
          <div>
            <CardTitle className="text-base font-semibold">Monthly Payroll Ledger</CardTitle>
            <CardDescription>Records of all active employee wage slips</CardDescription>
          </div>

          <SearchBar
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClear={() => setSearchTerm("")}
            placeholder="Search employee, ID, or month…"
            className="w-full sm:w-64"
          />
        </CardHeader>

        <CardContent>
          {loadingPayroll ? (
            <p className="text-muted-foreground py-10 text-center text-sm">Loading payroll records…</p>
          ) : filteredPayroll.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <Banknote className="text-muted-foreground size-8" />
              <p className="text-sm font-semibold">No payroll records match your search</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <th className="px-4 py-3">Employee</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">Month</th>
                    <th className="px-4 py-3">Base</th>
                    <th className="px-4 py-3">Allowances</th>
                    <th className="px-4 py-3">Bonus</th>
                    <th className="px-4 py-3">Deductions</th>
                    <th className="px-4 py-3">Net Pay</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredPayroll.map((p) => {
                    const emp = employeeMap.get(p.employeeId)
                    const empName = emp ? `${emp.firstName} ${emp.lastName}` : p.employeeId
                    const empCode = emp ? emp.employeeCode : ""
                    const dept = emp ? emp.department : "—"

                    return (
                      <tr key={p.id} className="transition-colors hover:bg-muted/40">
                        <td className="px-4 py-3.5">
                          <div>
                            <p className="font-semibold text-foreground">{empName}</p>
                            <p className="font-mono text-xs text-muted-foreground">{empCode}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-muted-foreground text-xs">{dept}</td>
                        <td className="px-4 py-3.5 font-medium text-foreground">{p.month}</td>
                        <td className="px-4 py-3.5 tabular-nums">{formatCurrency(p.baseSalary)}</td>
                        <td className="px-4 py-3.5 tabular-nums text-success">+{formatCurrency(p.allowances)}</td>
                        <td className="px-4 py-3.5 tabular-nums">{formatCurrency(p.bonus)}</td>
                        <td className="px-4 py-3.5 tabular-nums text-destructive">−{formatCurrency(p.deductions)}</td>
                        <td className="px-4 py-3.5 tabular-nums font-bold text-foreground">
                          {formatCurrency(p.netPay)}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          {emp ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs gap-1"
                              onClick={() => handleEditClick(emp, p)}
                            >
                              <Edit className="size-3.5" /> Adjust
                            </Button>
                          ) : null}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default HrPayrollPage
