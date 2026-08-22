import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  Award,
  Banknote,
  BookOpen,
  Briefcase,
  Building2,
  CreditCard,
  DollarSign,
  Eye,
  EyeOff,
  FileText,
  Heart,
  KeyRound,
  Lock,
  Mail,
  MapPin,
  Phone,
  Plus,
  Save,
  ShieldCheck,
  Sparkles,
  User,
  UserCheck,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toUserMessage } from "@/lib/api-error"
import { formatCurrency, formatDate } from "@/lib/utils"
import { authService } from "@/services/authService"
import { employeeService } from "@/services/employeeService"
import { payrollService } from "@/services/payrollService"
import { isManagerRole, useAuthStore } from "@/stores/authStore"
import type { Payroll } from "@/types/api"

const contactSchema = z.object({
  phone: z.string().min(5, "Enter a valid phone number."),
  address: z.string().min(4, "Enter your address."),
})

type ContactFormValues = z.infer<typeof contactSchema>

const passwordSchema = z
  .object({
    temporaryPassword: z.string().min(1, "Current password is required."),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters.")
      .regex(/[A-Z]/, "Include an uppercase letter.")
      .regex(/[0-9]/, "Include a number."),
    confirmPassword: z.string().min(1, "Confirm password is required."),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })

type PasswordFormValues = z.infer<typeof passwordSchema>

interface CertificationItem {
  id: string
  name: string
  issuer: string
  date: string
}

export function EmployeeProfilePage() {
  const { id } = useParams<{ id?: string }>()
  const currentUser = useAuthStore((s) => s.user)
  const token = useAuthStore((s) => s.token)
  const setAuth = useAuthStore((s) => s.setAuth)
  const queryClient = useQueryClient()

  const isViewOnly = !!id && id !== currentUser?.id
  const [activeTab, setActiveTab] = useState("resume")

  // Interactive Skills State
  const [skills, setSkills] = useState<string[]>([
    "TypeScript",
    "React 19",
    "Tailwind CSS",
    "UI Architecture",
    "HR Management",
    "Team Leadership",
    "API Integration",
    "Problem Solving",
  ])
  const [addSkillOpen, setAddSkillOpen] = useState(false)
  const [newSkillText, setNewSkillText] = useState("")

  // Interactive Certifications State
  const [certifications, setCertifications] = useState<CertificationItem[]>([
    {
      id: "cert-1",
      name: "AWS Certified Solutions Architect",
      issuer: "Amazon Web Services",
      date: "2025-04-10",
    },
    {
      id: "cert-2",
      name: "React & TypeScript Specialist",
      issuer: "Meta Frontend Guild",
      date: "2024-11-20",
    },
  ])
  const [addCertOpen, setAddCertOpen] = useState(false)
  const [certName, setCertName] = useState("")
  const [certIssuer, setCertIssuer] = useState("")

  // Password Visibility States for Security Tab
  const [showCurrentPass, setShowCurrentPass] = useState(false)
  const [showNewPass, setShowNewPass] = useState(false)
  const [showConfirmPass, setShowConfirmPass] = useState(false)

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

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { temporaryPassword: "", newPassword: "", confirmPassword: "" },
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

  const changePasswordMutation = useMutation({
    mutationFn: (values: PasswordFormValues) =>
      authService.changePassword({
        temporaryPassword: values.temporaryPassword,
        newPassword: values.newPassword,
      }),
    onSuccess: ({ user: updatedUser }) => {
      if (token) {
        setAuth({ ...updatedUser, mustChangePassword: false }, token)
      }
      toast.success("Password changed successfully!")
      passwordForm.reset()
    },
    onError: (e) => toast.error(toUserMessage(e)),
  })

  const handleAddSkill = () => {
    if (!newSkillText.trim()) return
    if (skills.includes(newSkillText.trim())) {
      toast.error("Skill already exists in your list.")
      return
    }
    setSkills([...skills, newSkillText.trim()])
    setNewSkillText("")
    setAddSkillOpen(false)
    toast.success("Skill added!")
  }

  const handleAddCertification = () => {
    if (!certName.trim() || !certIssuer.trim()) {
      toast.error("Certification title and issuer are required.")
      return
    }
    setCertifications([
      ...certifications,
      {
        id: `cert-${Date.now()}`,
        name: certName.trim(),
        issuer: certIssuer.trim(),
        date: new Date().toISOString().slice(0, 10),
      },
    ])
    setCertName("")
    setCertIssuer("")
    setAddCertOpen(false)
    toast.success("Certification added!")
  }

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

  // Use the persisted payroll structure so the profile and payroll use one source of truth.
  const monthlyWage = latestPayroll?.salaryStructure?.monthlyWage ?? latestPayroll?.baseSalary ?? 5000
  const yearlyWage = monthlyWage * 12
  const salary = latestPayroll?.salaryStructure ?? payrollService.calculateSalary({ monthlyWage })
  const {
    basicSalary,
    hra,
    standardAllowance,
    performanceBonus,
    lta,
    fixedAllowance,
    grossSalary: totalGross,
    professionalTax,
    employeePf: providentFund,
    totalDeductions,
  } = salary
  const netWage = latestPayroll?.netPay ?? salary.netSalary

  return (
    <div className="space-y-6">
      <PageHeader
        title={isViewOnly ? `${fullName} — Employee Details` : "My Profile"}
        description={
          isViewOnly
            ? "View-only details, skills, and employment specifications."
            : "Manage your personal information, view compensation, and update security credentials."
        }
      />

      {/* Top Profile Header Banner matching reference design */}
      <Card className="overflow-hidden border-border/80 shadow-sm">
        <div className="bg-linear-to-r from-primary/10 via-primary/5 to-accent/20 p-6 border-b border-border/50">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
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
                  {isViewOnly ? (
                    <Badge variant="outline" className="text-[10px] uppercase font-semibold text-muted-foreground">
                      View Only
                    </Badge>
                  ) : null}
                </div>

                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <span>{employee.position}</span>
                  <span>·</span>
                  <span className="text-foreground font-semibold">{employee.department}</span>
                </p>

                {/* Extended Details Grid: Company, Department, Manager, Location */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-muted-foreground pt-2">
                  <div>
                    <span className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground/80 block">Company</span>
                    <span className="font-semibold text-foreground flex items-center gap-1">
                      <Building2 className="size-3 text-primary" /> Odoo India
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground/80 block">Department</span>
                    <span className="font-semibold text-foreground flex items-center gap-1">
                      <Briefcase className="size-3 text-primary" /> {employee.department}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground/80 block">Manager</span>
                    <span className="font-semibold text-foreground flex items-center gap-1">
                      <UserCheck className="size-3 text-primary" /> Priya Sharma
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground/80 block">Location</span>
                    <span className="font-semibold text-foreground flex items-center gap-1">
                      <MapPin className="size-3 text-primary" /> Springfield HQ
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-start sm:items-end gap-1.5 border-t sm:border-t-0 sm:border-l border-border/60 pt-3 sm:pt-0 sm:pl-6 text-xs text-muted-foreground shrink-0">
              <span className="font-mono bg-background/80 border border-border px-2.5 py-1 rounded font-semibold text-foreground text-sm">
                ID: {employee.employeeCode}
              </span>
              <span className="flex items-center gap-1 pt-1">
                <Mail className="size-3.5" /> {employee.email}
              </span>
              {employee.phone ? (
                <span className="flex items-center gap-1">
                  <Phone className="size-3.5" /> {employee.phone}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </Card>

      {/* 4-Tab Navigation: Resume, Private Info, Salary Info, Security */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className={`grid w-full max-w-xl h-10 p-1 ${isManagerRole(currentUser?.role) ? "grid-cols-4" : "grid-cols-3"}`}>
          <TabsTrigger value="resume" className="text-xs sm:text-sm font-medium">
            <User className="size-4 mr-1.5 hidden sm:inline" />
            Resume
          </TabsTrigger>
          <TabsTrigger value="private" className="text-xs sm:text-sm font-medium">
            <ShieldCheck className="size-4 mr-1.5 hidden sm:inline" />
            Private Info
          </TabsTrigger>
          {isManagerRole(currentUser?.role) ? (
            <TabsTrigger value="salary" className="text-xs sm:text-sm font-medium">
              <Banknote className="size-4 mr-1.5 hidden sm:inline" />
              Salary Info
            </TabsTrigger>
          ) : null}
          <TabsTrigger value="security" className="text-xs sm:text-sm font-medium">
            <KeyRound className="size-4 mr-1.5 hidden sm:inline" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* ================= TAB 1: RESUME (About, Job Love, Skills, Certifications) ================= */}
        <TabsContent value="resume" className="space-y-6 mt-0">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
              {/* About Section */}
              <Card className="border-border/80 shadow-xs">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <BookOpen className="size-4 text-primary" /> About Me
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground leading-relaxed">
                  Dedicated {employee.position} with a strong track record of driving innovation and excellence
                  in {employee.department} at Odoo India. Passionate about building seamless user experiences, collaborating across
                  multidisciplinary teams, and contributing to scalable HRMS initiatives at DayFlow.
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
                    • Continuous learning opportunities and the supportive engineering culture within {employee.department}.
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
                    <Sparkles className="size-4 text-amber-500" /> Interests &amp; Hobbies
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
              {/* Interactive Skills Card */}
              <Card className="border-border/80 shadow-xs">
                <CardHeader className="pb-3 flex-row items-center justify-between">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Award className="size-4 text-primary" /> Skills
                  </CardTitle>
                  {!isViewOnly ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={() => setAddSkillOpen(true)}
                    >
                      <Plus className="size-3" /> Add Skill
                    </Button>
                  ) : null}
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="px-2.5 py-1 text-xs">
                      {skill}
                    </Badge>
                  ))}
                </CardContent>
              </Card>

              {/* Interactive Certifications Card */}
              <Card className="border-border/80 shadow-xs">
                <CardHeader className="pb-3 flex-row items-center justify-between">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <FileText className="size-4 text-primary" /> Certifications
                  </CardTitle>
                  {!isViewOnly ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={() => setAddCertOpen(true)}
                    >
                      <Plus className="size-3" /> Add Cert
                    </Button>
                  ) : null}
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  {certifications.map((cert) => (
                    <div key={cert.id} className="rounded-lg bg-muted/40 border border-border/60 p-2.5 space-y-1">
                      <p className="font-semibold text-foreground text-sm">{cert.name}</p>
                      <div className="flex justify-between text-muted-foreground">
                        <span>{cert.issuer}</span>
                        <span>{cert.date}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ================= TAB 2: PRIVATE INFO (Contact & Bank Details) ================= */}
        <TabsContent value="private" className="space-y-6 mt-0">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Contact Details Card */}
            <Card className="lg:col-span-2 border-border/80 shadow-xs">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold">Personal &amp; Contact Information</CardTitle>
                  {isViewOnly ? (
                    <Badge variant="secondary" className="text-[10px] uppercase font-semibold tracking-wider">
                      View Only Mode
                    </Badge>
                  ) : null}
                </div>
                <CardDescription>
                  {isViewOnly
                    ? "Employee contact information on record."
                    : "Update your contact phone number and address. HR administers official role specifications."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isViewOnly ? (
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1">
                        <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
                          <Phone className="size-3.5" /> Phone Number
                        </span>
                        <p className="text-sm font-medium text-foreground">{employee.phone || "—"}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
                          <Mail className="size-3.5" /> Work Email
                        </span>
                        <p className="text-sm font-medium text-foreground">{employee.email}</p>
                      </div>
                    </div>

                    <div className="space-y-1 border-t border-border/40 pt-3">
                      <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
                        <MapPin className="size-3.5" /> Residential Address
                      </span>
                      <p className="text-sm font-medium text-foreground">{employee.address || "—"}</p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3 border-t border-border/40 pt-3">
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
                  </div>
                ) : (
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
                )}
              </CardContent>
            </Card>

            {/* Bank & Statutory Details Card */}
            <Card className="border-border/80 shadow-xs">
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <CreditCard className="size-4 text-primary" /> Bank &amp; Statutory Details
                </CardTitle>
                <CardDescription>Verified payroll disbursement information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">Bank Name</span>
                  <span className="font-semibold text-foreground">HDFC Bank Ltd.</span>
                </div>

                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">Account Number</span>
                  <span className="font-mono font-semibold text-foreground">•••• •••• 4821</span>
                </div>

                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">IFSC Code</span>
                  <span className="font-mono font-semibold text-foreground">HDFC0001234</span>
                </div>

                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">PAN No</span>
                  <span className="font-mono font-semibold text-foreground">ABCDE1234F</span>
                </div>

                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">UAN No</span>
                  <span className="font-mono font-semibold text-foreground">100987654321</span>
                </div>

                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">System Employee ID</span>
                  <span className="font-mono font-semibold text-primary">{employee.employeeCode}</span>
                </div>
              </CardContent>
            </Card>

            {/* Documents on Record */}
            <Card className="lg:col-span-3 border-border/80 shadow-xs">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Documents on Record</CardTitle>
                <CardDescription>Official verified certificates &amp; identity records</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {employee.documents.length === 0 ? (
                  <p className="text-muted-foreground text-sm py-4">No documents uploaded yet.</p>
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

        {/* ================= TAB 3: SALARY INFO (Read-Only Compensation Overview) ================= */}
        <TabsContent value="salary" className="space-y-6 mt-0">
          {/* Read Only Notice Banner */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-start gap-3">
            <DollarSign className="size-5 text-primary shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-semibold text-foreground flex items-center gap-2">
                Compensation Information
                <Badge variant="outline" className="text-[10px]">Read Only</Badge>
              </p>
              <p className="text-muted-foreground">
                Salary breakdown is structured according to company payroll policy. Employees can view their own wage details; Admin manages payroll updates.
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
                <p className="text-2xl font-bold tracking-tight text-foreground mt-1">
                  {employee.workingSchedule?.workingDaysPerWeek ?? 5} Days / Wk
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {employee.workingSchedule?.expectedHoursPerDay ?? 8} Hours / Day standard
                </p>
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

        {/* ================= TAB 4: SECURITY (Password Update & Account Security) ================= */}
        <TabsContent value="security" className="space-y-6 mt-0">
          {isViewOnly ? (
            <Card className="border-border/80 shadow-xs p-8 text-center text-muted-foreground">
              Security settings can only be managed by the account holder.
            </Card>
          ) : (
            <Card className="border-border/80 shadow-xs max-w-xl">
              <CardHeader>
                <div className="flex items-center gap-2 text-primary">
                  <KeyRound className="size-5" />
                  <CardTitle className="text-base font-semibold">Account Security &amp; Password</CardTitle>
                </div>
                <CardDescription>
                  Update your account password. Use a strong password containing uppercase letters, numbers, and symbols.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  className="space-y-4"
                  onSubmit={passwordForm.handleSubmit((v) => changePasswordMutation.mutate(v))}
                >
                  <div className="space-y-1.5">
                    <Label htmlFor="sec-temp">Current / Temporary Password</Label>
                    <div className="relative">
                      <Lock className="text-muted-foreground absolute top-2.5 left-3 size-4" />
                      <Input
                        id="sec-temp"
                        type={showCurrentPass ? "text" : "password"}
                        className="pl-9 pr-10 h-10 font-mono"
                        {...passwordForm.register("temporaryPassword")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPass((v) => !v)}
                        className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        {showCurrentPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                    {passwordForm.formState.errors.temporaryPassword ? (
                      <p className="text-destructive text-xs">
                        {passwordForm.formState.errors.temporaryPassword.message}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="sec-new">New Password</Label>
                    <div className="relative">
                      <Lock className="text-muted-foreground absolute top-2.5 left-3 size-4" />
                      <Input
                        id="sec-new"
                        type={showNewPass ? "text" : "password"}
                        className="pl-9 pr-10 h-10 font-mono"
                        {...passwordForm.register("newPassword")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass((v) => !v)}
                        className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        {showNewPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                    {passwordForm.formState.errors.newPassword ? (
                      <p className="text-destructive text-xs">
                        {passwordForm.formState.errors.newPassword.message}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="sec-confirm">Confirm New Password</Label>
                    <div className="relative">
                      <Lock className="text-muted-foreground absolute top-2.5 left-3 size-4" />
                      <Input
                        id="sec-confirm"
                        type={showConfirmPass ? "text" : "password"}
                        className="pl-9 pr-10 h-10 font-mono"
                        {...passwordForm.register("confirmPassword")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPass((v) => !v)}
                        className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        {showConfirmPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                    {passwordForm.formState.errors.confirmPassword ? (
                      <p className="text-destructive text-xs">
                        {passwordForm.formState.errors.confirmPassword.message}
                      </p>
                    ) : null}
                  </div>

                  <Button
                    type="submit"
                    disabled={changePasswordMutation.isPending}
                    className="gap-2 mt-2"
                  >
                    <Save className="size-4" />
                    {changePasswordMutation.isPending ? "Updating Password…" : "Update Password"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Skill Dialog */}
      <Dialog open={addSkillOpen} onOpenChange={setAddSkillOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Add New Skill</DialogTitle>
            <DialogDescription>Enter a skill to feature on your profile.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <Label htmlFor="skill-input">Skill Name</Label>
            <Input
              id="skill-input"
              placeholder="e.g. Next.js, GraphQL, Node.js"
              value={newSkillText}
              onChange={(e) => setNewSkillText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0 pt-3">
            <Button variant="outline" onClick={() => setAddSkillOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSkill}>Add Skill</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Certification Dialog */}
      <Dialog open={addCertOpen} onOpenChange={setAddCertOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>Add Certification</DialogTitle>
            <DialogDescription>Add a verified professional certification record.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="cert-name">Certification Title</Label>
              <Input
                id="cert-name"
                placeholder="e.g. AWS Certified Developer"
                value={certName}
                onChange={(e) => setCertName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cert-issuer">Issuing Organization</Label>
              <Input
                id="cert-issuer"
                placeholder="e.g. Amazon Web Services, Meta"
                value={certIssuer}
                onChange={(e) => setCertIssuer(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0 pt-3">
            <Button variant="outline" onClick={() => setAddCertOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCertification}>Add Certification</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default EmployeeProfilePage
