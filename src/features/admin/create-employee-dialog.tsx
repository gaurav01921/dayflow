import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Check, Copy, KeyRound, Shield, UserPlus } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/components/ui/button"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toUserMessage } from "@/lib/api-error"
import { authService } from "@/services/authService"
import type { CreateEmployeeInput, CreateEmployeeResult, EmploymentType } from "@/types/api"

const schema = z.object({
  companyName: z.string().min(2, "Company name is required."),
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  email: z.string().email("Enter a valid email address."),
  phone: z.string().optional(),
  department: z.string().min(1, "Department is required."),
  position: z.string().min(1, "Position is required."),
  role: z.enum(["employee", "hr"] as const),
  employmentType: z.enum(["full-time", "part-time", "contract"] as const),
})

type FormValues = z.infer<typeof schema>

interface CreateEmployeeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateEmployeeDialog({ open, onOpenChange }: CreateEmployeeDialogProps) {
  const queryClient = useQueryClient()
  const [createdResult, setCreatedResult] = useState<CreateEmployeeResult | null>(null)
  const [copiedId, setCopiedId] = useState(false)
  const [copiedPass, setCopiedPass] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      companyName: "Odoo India",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      department: "Engineering",
      position: "Software Engineer",
      role: "employee",
      employmentType: "full-time",
    },
  })

  const role = watch("role")
  const employmentType = watch("employmentType")

  const createMutation = useMutation({
    mutationFn: authService.createEmployee,
    onSuccess: (result) => {
      setCreatedResult(result)
      toast.success(`Employee account created for ${result.employee.firstName}!`)
      void queryClient.invalidateQueries({ queryKey: ["employees"] })
    },
    onError: (e) => toast.error(toUserMessage(e)),
  })

  const onSubmit = handleSubmit((values) => {
    createMutation.mutate(values as unknown as CreateEmployeeInput)
  })

  const handleClose = () => {
    reset()
    setCreatedResult(null)
    setCopiedId(false)
    setCopiedPass(false)
    onOpenChange(false)
  }

  const copyToClipboard = (text: string, type: "id" | "pass") => {
    void navigator.clipboard.writeText(text)
    if (type === "id") {
      setCopiedId(true)
      setTimeout(() => setCopiedId(false), 2000)
    } else {
      setCopiedPass(true)
      setTimeout(() => setCopiedPass(false), 2000)
    }
    toast.success("Copied to clipboard!")
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[560px]">
        {createdResult ? (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <Shield className="size-5" />
                <DialogTitle>Employee Account Created</DialogTitle>
              </div>
              <DialogDescription>
                Provide these credentials to the employee. They will be required to change their temporary password on first login.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-3">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Employee Name
                  </p>
                  <p className="text-base font-bold text-foreground">
                    {createdResult.employee.firstName} {createdResult.employee.lastName} ({createdResult.employee.email})
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 pt-1">
                  <div className="rounded-lg bg-background/80 p-3 border border-border/60">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      System Login ID
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <code className="text-base font-mono font-bold text-primary">
                        {createdResult.loginId}
                      </code>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        onClick={() => copyToClipboard(createdResult.loginId, "id")}
                      >
                        {copiedId ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-lg bg-background/80 p-3 border border-border/60">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Temporary Password
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <code className="text-base font-mono font-bold text-amber-600 dark:text-amber-400">
                        {createdResult.temporaryPassword}
                      </code>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        onClick={() => copyToClipboard(createdResult.temporaryPassword, "pass")}
                      >
                        {copiedPass ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
                <p className="font-semibold text-foreground flex items-center gap-1.5">
                  <KeyRound className="size-3.5 text-primary" /> First-Login Workflow Note
                </p>
                <p className="mt-1">
                  When the employee signs in using this Login ID and Temporary Password, the system will automatically prompt them to set a new secure password before granting access to their dashboard.
                </p>
              </div>
            </div>

            <DialogFooter className="pt-3">
              <Button onClick={handleClose} className="w-full sm:w-auto">
                Done & Close
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2 text-primary">
                <UserPlus className="size-5" />
                <DialogTitle>Create Employee Account</DialogTitle>
              </div>
              <DialogDescription>
                Register a new team member. Login ID and a temporary password will be generated automatically.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={onSubmit} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="companyName" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Company Name
                </Label>
                <Input id="companyName" {...register("companyName")} />
                {errors.companyName ? (
                  <p className="text-destructive text-xs">{errors.companyName.message}</p>
                ) : null}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    First Name
                  </Label>
                  <Input id="firstName" placeholder="Aarav" {...register("firstName")} />
                  {errors.firstName ? (
                    <p className="text-destructive text-xs">{errors.firstName.message}</p>
                  ) : null}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="lastName" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Last Name
                  </Label>
                  <Input id="lastName" placeholder="Mehta" {...register("lastName")} />
                  {errors.lastName ? (
                    <p className="text-destructive text-xs">{errors.lastName.message}</p>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Work Email
                  </Label>
                  <Input id="email" type="email" placeholder="aarav@company.com" {...register("email")} />
                  {errors.email ? (
                    <p className="text-destructive text-xs">{errors.email.message}</p>
                  ) : null}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Phone (Optional)
                  </Label>
                  <Input id="phone" placeholder="+1 (555) 010-1234" {...register("phone")} />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="department" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Department
                  </Label>
                  <Input id="department" placeholder="Engineering" {...register("department")} />
                  {errors.department ? (
                    <p className="text-destructive text-xs">{errors.department.message}</p>
                  ) : null}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="position" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Position / Title
                  </Label>
                  <Input id="position" placeholder="Frontend Developer" {...register("position")} />
                  {errors.position ? (
                    <p className="text-destructive text-xs">{errors.position.message}</p>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Role Access
                  </Label>
                  <Select value={role} onValueChange={(v) => setValue("role", v as FormValues["role"])}>
                    <SelectTrigger className="w-full h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="hr">HR / Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Employment Type
                  </Label>
                  <Select value={employmentType} onValueChange={(v) => setValue("employmentType", v as EmploymentType)}>
                    <SelectTrigger className="w-full h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0 pt-2">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create Employee Account"}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
