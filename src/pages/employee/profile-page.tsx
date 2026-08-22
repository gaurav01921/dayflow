import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Briefcase, FileText, Mail, MapPin, Phone } from "lucide-react"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { PageHeader } from "@/components/shared/page-header"
import { Badge } from "@/components/ui/badge"
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
        title="My profile"
        description={
          manager
            ? "Your account details."
            : "You can edit your phone and address. HR manages job details."
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Personal details</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
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
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="text-muted-foreground absolute top-2.5 left-2.5 size-4" />
                    <Input id="email" className="pl-8" value={employee.email} disabled />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" {...form.register("address")} />
                {form.formState.errors.address ? (
                  <p className="text-destructive text-xs">
                    {form.formState.errors.address.message}
                  </p>
                ) : null}
              </div>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Saving…" : "Save changes"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Job details</CardTitle>
            <CardDescription>Managed by HR</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Employee ID" value={employee.employeeCode} />
            <Row
              label="Name"
              value={`${employee.firstName} ${employee.lastName}`}
            />
            <Row label="Department" value={employee.department} />
            <Row label="Position" value={employee.position} />
            <Row
              label="Employment"
              value={<Badge variant="secondary">{employee.employmentType}</Badge>}
            />
            <Row label="Joined" value={formatDate(employee.joinDate)} />
            <Row
              label="Role"
              value={<Badge variant="info">{employee.role.toUpperCase()}</Badge>}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Documents</CardTitle>
            <CardDescription>Files on record with HR</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {employee.documents.length === 0 ? (
              <p className="text-muted-foreground text-sm">No documents uploaded yet.</p>
            ) : (
              employee.documents.map((doc) => (
                <div key={doc.id} className="bg-muted/40 flex items-center gap-3 rounded-lg border px-3 py-2.5">
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

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b pb-2 last:border-b-0 last:pb-0">
      <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
        {label === "Department" || label === "Position" ? (
          <Briefcase className="size-3.5" />
        ) : label === "Joined" ? (
          <MapPin className="size-3.5" />
        ) : null}
        {label}
      </span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
