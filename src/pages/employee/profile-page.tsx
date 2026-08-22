import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  Award,
  Banknote,
  BookOpen,
  Briefcase,
  DollarSign,
  FileText,
  Heart,
  Mail,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useParams } from "react-router-dom"
import { toast } from "sonner"
import { z } from "zod"

import { PageHeader } from "@/components/shared/page-header"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toUserMessage } from "@/lib/api-error"
import { formatCurrency, formatDate } from "@/lib/utils"
import { employeeService } from "@/services/employeeService"
import { payrollService } from "@/services/payrollService"
import type { Payroll } from "@/types/api"

const contactSchema = z.object({
  phone: z.string().min(5, "Enter a valid phone number."),
  address: z.string().min(4, "Enter your address."),
})

type ContactFormValues = z.infer<typeof contactSchema>

export function EmployeeProfilePage() {
  const { id } = useParams<{ id?: string }>()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState("profile")

  // Fetch employee details (by ID or current user)
  const { data: employee, isLoading: loadingEmployee } = useQuery({
    queryKey: ["employees", id ?? "me"],
    queryFn: () => employeeService.get(id),
  })

  // Fetch payroll info
  const { data: payrollList = [] } = useQuery({
    queryKey: ["payroll", id ?? "me"],
    queryFn: () => payrollService.list(id),
  })

  const latestPayroll: Payroll | undefined = payrollList[0]

  const contactForm = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { phone: "", address: "" },
  })

  useEffect(() => {
    if (employee) {
      contactForm.reset({
        phone: employee.phone ?? "",
        address: employee.address ?? "",
      })
    }
  }, [employee, contactForm])

  const updateContactMutation = useMutation({
    mutationFn: (values: ContactFormValues) =>
      employeeService.update(employee!.id, values),
    onSuccess: () => {
      toast.success("Contact information updated successfully.")
      void queryClient.invalidateQueries({ queryKey: ["employees"] })
    },
    onError: (e) => toast.error(toUserMessage(e)),
  })

  if (loadingEmployee) {
    return (
      <div className="space-y-6">
        <PageHeader title="Loading Profile..." />
        <Card className="h-64 animate-pulse bg-muted/40" />
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="space-y-6">
        <PageHeader title="Employee Not Found" />
        <Card className="p-8 text-center text-muted-foreground">
          The requested employee record could not be loaded.
        </Card>
      </div>
    )
  }

  const fullName = `${employee.firstName} ${employee.lastName}`
  const initials = `${employee.firstName?.[0] ?? ""}${employee.lastName?.[0] ?? ""}`.toUpperCase()

  // Base wage from payroll or fallback calculation
  const monthlyWage = latestPayroll?.baseSalary ?? 5000
  const yearlyWage = monthlyWage * 12

  // Computed salary components (standard HR model)
  const basicSalary = latestPayroll?.baseSalary ?? Math.round(monthlyWage * 0.5)
  const hra = latestPayroll?.allowances ?? Math.round(monthlyWage * 0.2)
  const standardAllowance = 200
  const performanceBonus = latestPayroll?.bonus ?? 300
  const lta = 150
  const fixedAllowance = 150

  const professionalTax = 200
  const providentFund = latestPayroll?.deductions ?? Math.round(basicSalary * 0.12)
  const totalDeductions = professionalTax + providentFund
  const totalGross = basicSalary + hra + standardAllowance + performanceBonus + lta + fixedAllowance
  const netWage = latestPayroll?.netPay ?? (totalGross - totalDeductions)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employee Profile"
        description="Comprehensive personal details, job specifications, and compensation overview."
      />

      {/* Top Profile Header Banner */}
      <Card className="overflow-hidden border-border/80 shadow-sm">
        <div className="bg-linear-to-r from-primary/10 via-primary/5 to-accent/20 p-6 border-b border-border/50">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-5">
              <Avatar className="size-20 border-3 border-background shadow-md">
                <AvatarImage src={employee.avatarUrl} alt={fullName} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                  {initials || "DF"}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-bold tracking-tight text-foreground">{fullName}</h2>
                  <Badge variant="info" className="uppercase text-[10px] font-semibold tracking-wider">
                    {employee.role}
                  </Badge>
                  <Badge variant="secondary" className="capitalize text-[11px]">
                    {employee.employmentType}
                  </Badge>
                </div>
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <span>{employee.position}</span>
                  <span>·</span>
                  <span className="text-foreground font-semibold">{employee.department}</span>
                </p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-1">
                  <span className="font-mono bg-background/80 border border-border px-2 py-0.5 rounded font-semibold text-foreground">
                    {employee.employeeCode}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="size-3" /> {employee.email}
                  </span>
                  {employee.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="size-3" /> {employee.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabbed Navigation: My Profile, Private Info, Salary Info */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-md h-10 p-1">
          <TabsTrigger value="profile" className="text-xs sm:text-sm font-medium">
            <User className="size-4 mr-1.5 hidden sm:inline" />
            My Profile
          </TabsTrigger>
          <TabsTrigger value="private" className="text-xs sm:text-sm font-medium">
            <ShieldCheck className="size-4 mr-1.5 hidden sm:inline" />
            Private Info
          </TabsTrigger>
          <TabsTrigger value="salary" className="text-xs sm:text-sm font-medium">
            <Banknote className="size-4 mr-1.5 hidden sm:inline" />
            Salary Info
          </TabsTrigger>
        </TabsList>

        {/* ================= TAB 1: MY PROFILE / ABOUT & RESUME ================= */}
        <TabsContent value="profile" className="space-y-6 mt-0">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
              {/* About Section */}
              <Card className="border-border/80 shadow-xs">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <BookOpen className="size-4 text-primary" /> About
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground leading-relaxed">
                  Dedicated {employee.position} with a strong track record of driving innovation and excellence
                  in {employee.department}. Passionate about building seamless user experiences, collaborating across
                  multidisciplinary teams, and contributing to scalable company initiatives at DayFlow.
                </CardContent>
              </Card>

              {/* What I love about my job */}
              <Card className="border-border/80 shadow-xs">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Heart className="size-4 text-rose-500" /> What I Love About My Job
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <p>
                    • Working with an ambitious, forward-thinking team solving challenging organizational problems.
                  </p>
                  <p>
                    • Continuous learning opportunities and the supportive culture within {employee.department}.
                  </p>
                  <p>
                    • Being able to make an immediate positive impact on workplace efficiency and employee happiness.
                  </p>
                </CardContent>
              </Card>

              {/* Interests & Hobbies */}
              <Card className="border-border/80 shadow-xs">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Sparkles className="size-4 text-amber-500" /> Interests & Hobbies
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2 text-xs">
                  {["Open Source", "UI/UX Design", "Tech Podcasts", "Photography", "Running & Fitness", "Reading"].map(
                    (hobby) => (
                      <span
                        key={hobby}
                        className="bg-muted/80 text-foreground border border-border/60 px-3 py-1 rounded-full font-medium"
                      >
                        {hobby}
                      </span>
                    )
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {/* Skills Tags */}
              <Card className="border-border/80 shadow-xs">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Award className="size-4 text-primary" /> Skills & Competencies
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {[
                    "TypeScript",
                    "React 19",
                    "Tailwind CSS",
                    "UI Architecture",
                    "HR Management",
                    "Team Leadership",
                    "API Integration",
                    "Problem Solving",
                  ].map((skill) => (
                    <Badge key={skill} variant="secondary" className="px-2.5 py-1 text-xs">
                      {skill}
                    </Badge>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Specs */}
              <Card className="border-border/80 shadow-xs">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Briefcase className="size-4 text-primary" /> Job Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <div className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-muted-foreground">Department</span>
                    <span className="font-semibold text-foreground">{employee.department}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-muted-foreground">Position</span>
                    <span className="font-semibold text-foreground">{employee.position}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-muted-foreground">Joining Date</span>
                    <span className="font-semibold text-foreground">{formatDate(employee.joinDate)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Employment Type</span>
                    <span className="font-semibold capitalize text-foreground">{employee.employmentType}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ================= TAB 2: PRIVATE INFO ================= */}
        <TabsContent value="private" className="space-y-6 mt-0">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Contact Details Form */}
            <Card className="lg:col-span-2 border-border/80 shadow-xs">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Personal & Contact Information</CardTitle>
                <CardDescription>
                  Update your contact phone number and address. HR administers official role specifications.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  className="space-y-4"
                  onSubmit={contactForm.handleSubmit((v) => updateContactMutation.mutate(v))}
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="text-muted-foreground absolute top-2.5 left-2.5 size-4" />
                        <Input id="phone" className="pl-8" {...contactForm.register("phone")} />
                      </div>
                      {contactForm.formState.errors.phone ? (
                        <p className="text-destructive text-xs">
                          {contactForm.formState.errors.phone.message}
                        </p>
                      ) : null}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="work-email">Work Email</Label>
                      <div className="relative">
                        <Mail className="text-muted-foreground absolute top-2.5 left-2.5 size-4" />
                        <Input id="work-email" className="pl-8" value={employee.email} disabled />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Residential Address</Label>
                    <div className="relative">
                      <MapPin className="text-muted-foreground absolute top-2.5 left-2.5 size-4" />
                      <Input id="address" className="pl-8" {...contactForm.register("address")} />
                    </div>
                    {contactForm.formState.errors.address ? (
                      <p className="text-destructive text-xs">
                        {contactForm.formState.errors.address.message}
                      </p>
                    ) : null}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3 pt-2">
                    <div className="space-y-1">
                      <span className="text-muted-foreground text-xs">Gender</span>
                      <p className="text-sm font-medium text-foreground">Not Specified</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground text-xs">Nationality</span>
                      <p className="text-sm font-medium text-foreground">Global Citizen</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground text-xs">Marital Status</span>
                      <p className="text-sm font-medium text-foreground">Single</p>
                    </div>
                  </div>

                  <Button type="submit" disabled={updateContactMutation.isPending} className="gap-2 mt-2">
                    <Save className="size-4" />
                    {updateContactMutation.isPending ? "Saving Changes…" : "Save Changes"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Documents on Record */}
            <Card className="border-border/80 shadow-xs">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Documents on Record</CardTitle>
                <CardDescription>Official verified certificates & files</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {employee.documents.length === 0 ? (
                  <p className="text-muted-foreground text-sm py-4 text-center">No documents uploaded yet.</p>
                ) : (
                  employee.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="bg-muted/40 hover:bg-muted/70 flex items-center gap-3 rounded-lg border border-border/60 px-3.5 py-2.5 transition-colors"
                    >
                      <FileText className="text-primary size-4 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{doc.name}</p>
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
        </TabsContent>

        {/* ================= TAB 3: SALARY INFO ================= */}
        <TabsContent value="salary" className="space-y-6 mt-0">
          {/* Note Banner per wireframe */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-start gap-3">
            <DollarSign className="size-5 text-primary shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-semibold text-foreground">Compensation Information</p>
              <p className="text-muted-foreground">
                Salary breakdown is structured according to company payroll policy. Standard components are
                allocated automatically based on agreed wage baselines.
              </p>
            </div>
          </div>

          {/* Top Wage Tiles */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-border/80 shadow-xs">
              <CardContent className="p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Monthly Wage</p>
                <p className="text-2xl font-bold tracking-tight text-foreground mt-1 tabular-nums">
                  {formatCurrency(monthlyWage)}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Base gross monthly</p>
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-xs">
              <CardContent className="p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Yearly Wage</p>
                <p className="text-2xl font-bold tracking-tight text-foreground mt-1 tabular-nums">
                  {formatCurrency(yearlyWage)}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Annualized package (CTC)</p>
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-xs">
              <CardContent className="p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Work Schedule</p>
                <p className="text-2xl font-bold tracking-tight text-foreground mt-1">5 Days / Wk</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">8 Hours / Day standard</p>
              </CardContent>
            </Card>

            <Card className="border-primary/40 bg-primary/5 shadow-xs">
              <CardContent className="p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">Calculated Net Pay</p>
                <p className="text-2xl font-bold tracking-tight text-primary mt-1 tabular-nums">
                  {formatCurrency(netWage)}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Take-home post deductions</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Salary Components Breakdown */}
            <Card className="border-border/80 shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center justify-between">
                  <span>Salary Components</span>
                  <Badge variant="success" className="text-[10px]">Earnings</Badge>
                </CardTitle>
                <CardDescription>Monthly earnings and allowance distribution</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-1.5 border-b border-border/50">
                  <div>
                    <p className="font-medium">Basic Salary</p>
                    <p className="text-muted-foreground text-xs">50% of monthly wage</p>
                  </div>
                  <span className="font-semibold tabular-nums">{formatCurrency(basicSalary)}</span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-border/50">
                  <div>
                    <p className="font-medium">House Rent Allowance (HRA)</p>
                    <p className="text-muted-foreground text-xs">Housing subsidy allowance</p>
                  </div>
                  <span className="font-semibold tabular-nums">{formatCurrency(hra)}</span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-border/50">
                  <div>
                    <p className="font-medium">Standard Allowance</p>
                    <p className="text-muted-foreground text-xs">Statutory standard allowance</p>
                  </div>
                  <span className="font-semibold tabular-nums">{formatCurrency(standardAllowance)}</span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-border/50">
                  <div>
                    <p className="font-medium">Performance Bonus</p>
                    <p className="text-muted-foreground text-xs">Performance incentive</p>
                  </div>
                  <span className="font-semibold tabular-nums">{formatCurrency(performanceBonus)}</span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-border/50">
                  <div>
                    <p className="font-medium">Leave Travel Allowance (LTA)</p>
                    <p className="text-muted-foreground text-xs">Travel assistance allocation</p>
                  </div>
                  <span className="font-semibold tabular-nums">{formatCurrency(lta)}</span>
                </div>

                <div className="flex justify-between items-center py-1.5">
                  <div>
                    <p className="font-medium">Fixed Special Allowance</p>
                    <p className="text-muted-foreground text-xs">Company special allowance</p>
                  </div>
                  <span className="font-semibold tabular-nums">{formatCurrency(fixedAllowance)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Deductions Breakdown */}
            <Card className="border-border/80 shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center justify-between">
                  <span>Statutory Deductions</span>
                  <Badge variant="destructive" className="text-[10px]">Deductions</Badge>
                </CardTitle>
                <CardDescription>Taxes and retirement contributions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <div>
                    <p className="font-medium">Provident Fund (PF)</p>
                    <p className="text-muted-foreground text-xs">12% contribution on Basic Salary</p>
                  </div>
                  <span className="font-semibold text-destructive tabular-nums">
                    −{formatCurrency(providentFund)}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <div>
                    <p className="font-medium">Professional Tax</p>
                    <p className="text-muted-foreground text-xs">State statutory professional tax</p>
                  </div>
                  <span className="font-semibold text-destructive tabular-nums">
                    −{formatCurrency(professionalTax)}
                  </span>
                </div>

                {/* Net Summary Box */}
                <div className="bg-muted/40 border border-border/60 rounded-xl p-4 space-y-2 mt-4">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Total Gross Earnings:</span>
                    <span className="font-semibold text-foreground">{formatCurrency(totalGross)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Total Deductions:</span>
                    <span className="font-semibold text-destructive">−{formatCurrency(totalDeductions)}</span>
                  </div>
                  <div className="border-t border-border/60 pt-2 flex justify-between text-sm font-bold text-foreground">
                    <span>Net Monthly Take-Home:</span>
                    <span className="text-primary">{formatCurrency(netWage)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default EmployeeProfilePage
