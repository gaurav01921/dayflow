import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { FileText, Mail, Phone } from "lucide-react"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { EmployeeDetailsCard } from "@/features/employees/employee-details-card"
import { toUserMessage } from "@/lib/api-error"
import { formatDate } from "@/lib/utils"
import { employeeService } from "@/services/employeeService"
import { isManagerRole, useAuthStore } from "@/stores/authStore"

const schema = z.object({
  phone: z.string().min(5, "Enter a valid phone number."),
  address: z.string().min(4, "Enter your address."),
})

type FormValues = z.infer<typeof schema>

export function EmployeeProfilePage() {
  const user = useAuthStore((s) => s.user)
  const queryClient = useQueryClient()

  const { data: employee } = useQuery({
    queryKey: ["employees", "me"],
    queryFn: () => employeeService.get(),
  })

  const manager = isManagerRole(user?.role)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { phone: "", address: "" },
  })

  useEffect(() => {
    if (employee) {
      form.reset({ phone: employee.phone ?? "", address: employee.address ?? "" })
    }
  }, [employee, form])

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      employeeService.update(employee!.id, values),
    onSuccess: () => {
      toast.success("Profile updated.")
      void queryClient.invalidateQueries({ queryKey: ["employees"] })
    },
    onError: (e) => toast.error(toUserMessage(e)),
  })

  if (!employee) return null

  return (
    <>
      <PageHeader
        title="My Profile"
        description={
          manager
            ? "Your account details."
            : "Update your contact information. HR manages job details and role parameters."
        }
      />

      <EmployeeDetailsCard employee={employee} />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Update Contact Details</CardTitle>
            <CardDescription>Keep your personal phone number and home address updated.</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="text-muted-foreground absolute top-2.5 left-2.5 size-4" />
                    <Input id="phone" className="pl-8" {...form.register("phone")} />
                  </div>
                  {form.formState.errors.phone ? (
                    <p className="text-destructive text-xs">
                      {form.formState.errors.phone.message}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Work Email</Label>
                  <div className="relative">
                    <Mail className="text-muted-foreground absolute top-2.5 left-2.5 size-4" />
                    <Input id="email" className="pl-8" value={employee.email} disabled />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Residential Address</Label>
                <Input id="address" {...form.register("address")} />
                {form.formState.errors.address ? (
                  <p className="text-destructive text-xs">
                    {form.formState.errors.address.message}
                  </p>
                ) : null}
              </div>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Saving…" : "Save Changes"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Documents on Record</CardTitle>
            <CardDescription>HR records and verified certificates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {employee.documents.length === 0 ? (
              <p className="text-muted-foreground text-sm">No documents uploaded yet.</p>
            ) : (
              employee.documents.map((doc) => (
                <div key={doc.id} className="bg-muted/30 flex items-center gap-3 rounded-lg border border-border/50 px-3 py-2.5">
                  <FileText className="text-primary size-4 shrink-0" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{doc.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {doc.category} · {formatDate(doc.uploadedAt)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
