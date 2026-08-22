import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { Banknote, Pencil } from "lucide-react"
import { toast } from "sonner"

import { PageHeader } from "@/components/shared/page-header"
import { LoadingState } from "@/components/shared/loading-state"
import { EmptyState } from "@/components/shared/empty-state"
import { ErrorState } from "@/components/shared/error-state"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { payrollService } from "@/services/payrollService"
import { employeeService } from "@/services/employeeService"
import { toUserMessage } from "@/lib/api-error"
import { formatCurrency } from "@/lib/utils"
import { toISODate } from "@/mocks/mockDb"
import type { Employee, Payroll, PayrollUpdate } from "@/types/api"

export function HrPayrollPage() {
  const queryClient = useQueryClient()
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("all")
  const [editingPayroll, setEditingPayroll] = useState<Payroll | null>(null)
  const [editForm, setEditForm] = useState<PayrollUpdate>({})

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: employeeService.list,
  })

  const employeeMap = new Map<string, Employee>(
    employees.map((e) => [e.id, e]),
  )

  // Fetch payroll for all employees or a specific one
  const {
    data: payroll = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["payroll", selectedEmployeeId],
    queryFn: () =>
      selectedEmployeeId === "all"
        ? Promise.all(
            employees
              .filter((e) => e.role === "employee")
              .map((e) => payrollService.list(e.id)),
          ).then((results) => results.flat())
        : payrollService.list(selectedEmployeeId),
    enabled: selectedEmployeeId === "all" ? employees.length > 0 : true,
  })

  const updateMutation = useMutation({
    mutationFn: ({ employeeId, patch }: { employeeId: string; patch: PayrollUpdate }) =>
      payrollService.update(employeeId, patch),
    onSuccess: () => {
      toast.success("Payroll updated.")
      void queryClient.invalidateQueries({ queryKey: ["payroll"] })
      setEditingPayroll(null)
    },
    onError: (e) => toast.error(toUserMessage(e)),
  })

  const currentMonth = toISODate(new Date()).slice(0, 7)
  const currentMonthPayroll = payroll.filter((p) => p.month === currentMonth)
  const totalNet = currentMonthPayroll.reduce((sum, p) => sum + p.netPay, 0)
  const totalDeductions = currentMonthPayroll.reduce((sum, p) => sum + p.deductions, 0)

  function openEdit(p: Payroll) {
    setEditingPayroll(p)
    setEditForm({
      baseSalary: p.baseSalary,
      allowances: p.allowances,
      bonus: p.bonus,
      deductions: p.deductions,
    })
  }

  if (error) return <ErrorState error={error} onRetry={() => refetch()} />

  return (
    <>
      <PageHeader
        title="Payroll"
        description="Manage salary and payroll for all employees."
      />

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="gap-0 py-0">
          <CardContent className="px-5 py-4">
            <p className="text-muted-foreground text-xs font-medium uppercase">Total Net Pay</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{formatCurrency(totalNet)}</p>
            <p className="text-muted-foreground text-xs">Current month ({currentMonth})</p>
          </CardContent>
        </Card>
        <Card className="gap-0 py-0">
          <CardContent className="px-5 py-4">
            <p className="text-muted-foreground text-xs font-medium uppercase">Total Deductions</p>
            <p className="text-destructive mt-1 text-2xl font-semibold tabular-nums">
              {formatCurrency(totalDeductions)}
            </p>
          </CardContent>
        </Card>
        <Card className="gap-0 py-0">
          <CardContent className="px-5 py-4">
            <p className="text-muted-foreground text-xs font-medium uppercase">Employees Paid</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{currentMonthPayroll.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Employee filter */}
      <div className="flex items-center gap-3">
        <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="All employees" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All employees</SelectItem>
            {employees
              .filter((e) => e.role === "employee")
              .map((emp) => (
                <SelectItem key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName} ({emp.employeeCode})
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <LoadingState label="Loading payroll data…" />
      ) : payroll.length === 0 ? (
        <EmptyState
          icon={Banknote}
          title="No payroll records"
          description="No payroll data found for the selected employee."
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Payroll Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="text-muted-foreground px-3 py-2 font-medium">Employee</th>
                    <th className="text-muted-foreground px-3 py-2 font-medium">Month</th>
                    <th className="text-muted-foreground px-3 py-2 font-medium">Base</th>
                    <th className="text-muted-foreground px-3 py-2 font-medium">Allowances</th>
                    <th className="text-muted-foreground px-3 py-2 font-medium">Bonus</th>
                    <th className="text-muted-foreground px-3 py-2 font-medium">Deductions</th>
                    <th className="text-muted-foreground px-3 py-2 font-medium">Net Pay</th>
                    <th className="text-muted-foreground px-3 py-2 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {payroll.map((p) => {
                    const emp = employeeMap.get(p.employeeId)
                    return (
                      <tr key={p.id} className="hover:bg-muted/50 border-b last:border-0">
                        <td className="px-3 py-2.5">
                          <div>
                            <p className="font-medium">
                              {emp ? `${emp.firstName} ${emp.lastName}` : p.employeeId}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              {emp?.employeeCode ?? "—"}
                            </p>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 font-medium">{p.month}</td>
                        <td className="px-3 py-2.5 tabular-nums">{formatCurrency(p.baseSalary)}</td>
                        <td className="px-3 py-2.5 tabular-nums">{formatCurrency(p.allowances)}</td>
                        <td className="px-3 py-2.5 tabular-nums">{formatCurrency(p.bonus)}</td>
                        <td className="text-destructive px-3 py-2.5 tabular-nums">
                          −{formatCurrency(p.deductions)}
                        </td>
                        <td className="px-3 py-2.5 font-semibold tabular-nums">
                          {formatCurrency(p.netPay)}
                        </td>
                        <td className="px-3 py-2.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEdit(p)}
                          >
                            <Pencil /> Edit
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit dialog */}
      <Dialog open={!!editingPayroll} onOpenChange={(open) => !open && setEditingPayroll(null)}>
        <DialogContent>
          {editingPayroll ? (
            <>
              <DialogHeader>
                <DialogTitle>Update Payroll</DialogTitle>
                <DialogDescription>
                  {editingPayroll.month} — {employeeMap.get(editingPayroll.employeeId)?.firstName}{" "}
                  {employeeMap.get(editingPayroll.employeeId)?.lastName}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Base Salary</Label>
                  <Input
                    type="number"
                    value={editForm.baseSalary ?? 0}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, baseSalary: Number(e.target.value) }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Allowances</Label>
                  <Input
                    type="number"
                    value={editForm.allowances ?? 0}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, allowances: Number(e.target.value) }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Bonus</Label>
                  <Input
                    type="number"
                    value={editForm.bonus ?? 0}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, bonus: Number(e.target.value) }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Deductions</Label>
                  <Input
                    type="number"
                    value={editForm.deductions ?? 0}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, deductions: Number(e.target.value) }))
                    }
                  />
                </div>
              </div>
              {editingPayroll && (
                <p className="text-muted-foreground text-sm">
                  Net pay:{" "}
                  <span className="text-foreground font-semibold">
                    {formatCurrency(
                      (editForm.baseSalary ?? 0) +
                        (editForm.allowances ?? 0) +
                        (editForm.bonus ?? 0) -
                        (editForm.deductions ?? 0),
                    )}
                  </span>
                </p>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditingPayroll(null)}>
                  Cancel
                </Button>
                <Button
                  disabled={updateMutation.isPending}
                  onClick={() =>
                    updateMutation.mutate({
                      employeeId: editingPayroll.employeeId,
                      patch: editForm,
                    })
                  }
                >
                  {updateMutation.isPending ? "Saving…" : "Save changes"}
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  )
}
