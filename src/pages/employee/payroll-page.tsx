import { useQuery } from "@tanstack/react-query"
import { Banknote } from "lucide-react"

import { PageHeader } from "@/components/shared/page-header"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { payrollService } from "@/services/payrollService"
import type { Payroll } from "@/types/api"

export function EmployeePayrollPage() {
  const { data: payslips = [], isLoading } = useQuery({
    queryKey: ["payroll", "me"],
    queryFn: () => payrollService.list(),
  })

  const latest: Payroll | undefined = payslips[0]

  return (
    <>
      <PageHeader
        title="Payroll"
        description="Your salary details are read-only. Contact HR for corrections."
      />

      {latest ? (
        <div className="grid gap-4 sm:grid-cols-4">
          <SummaryTile label="Base salary" value={formatCurrency(latest.baseSalary)} />
          <SummaryTile label="Allowances" value={formatCurrency(latest.allowances)} />
          <SummaryTile label="Bonus" value={formatCurrency(latest.bonus)} />
          <SummaryTile
            label="Net pay · latest"
            value={formatCurrency(latest.netPay)}
            hint={`Month ${latest.month}`}
            highlight
          />
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Salary slips</CardTitle>
          <CardDescription>Last months on record</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground py-6 text-center text-sm">Loading…</p>
          ) : payslips.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <Banknote className="text-muted-foreground size-6" />
              <p className="text-sm font-medium">No payroll records yet</p>
              <p className="text-muted-foreground text-sm">
                Your first payslip will appear here after HR processes payroll.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="text-muted-foreground px-3 py-2 font-medium">Month</th>
                    <th className="text-muted-foreground px-3 py-2 font-medium">Base</th>
                    <th className="text-muted-foreground px-3 py-2 font-medium">Allowances</th>
                    <th className="text-muted-foreground px-3 py-2 font-medium">Bonus</th>
                    <th className="text-muted-foreground px-3 py-2 font-medium">Deductions</th>
                    <th className="text-muted-foreground px-3 py-2 font-medium">Net pay</th>
                    <th className="text-muted-foreground px-3 py-2 font-medium">Paid on</th>
                  </tr>
                </thead>
                <tbody>
                  {(payslips as Payroll[]).map((p) => (
                    <tr key={p.id} className="hover:bg-muted/50 border-b last:border-0">
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
                      <td className="text-muted-foreground px-3 py-2.5">{p.paymentDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}

function SummaryTile({
  label,
  value,
  hint,
  highlight = false,
}: {
  label: string
  value: string
  hint?: string
  highlight?: boolean
}) {
  return (
    <Card className="gap-0 py-0">
      <CardContent className={`rounded-xl px-4 py-4 ${highlight ? "bg-primary/5" : ""}`}>
        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">{label}</p>
        <p className="mt-1 text-lg font-semibold tabular-nums">{value}</p>
        {hint ? <p className="text-muted-foreground text-xs">{hint}</p> : null}
      </CardContent>
    </Card>
  )
}
