import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import type { ReactNode } from "react"
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom"
import { Toaster } from "sonner"

import { AppShell } from "@/components/layout/app-shell"
import { ChangePasswordPage } from "@/pages/auth/change-password-page"
import { LoginPage } from "@/pages/auth/login-page"
import { SignupPage } from "@/pages/auth/signup-page"
import { VerifyEmailPage } from "@/pages/auth/verify-email-page"
import { EmployeeAttendancePage } from "@/pages/employee/attendance-page"
import { EmployeeDashboardPage } from "@/pages/employee/dashboard-page"
import { EmployeesDirectoryPage } from "@/pages/employee/employees-page"
import { EmployeePayrollPage } from "@/pages/employee/payroll-page"
import { EmployeeProfilePage } from "@/pages/employee/profile-page"
import { HrAttendancePage } from "@/pages/hr/attendance-page"
import { HrDashboardPage } from "@/pages/hr/dashboard-page"
import { HrEmployeesPage } from "@/pages/hr/employees-page"
import { HrLeavesPage } from "@/pages/hr/leaves-page"
import { HrPayrollPage } from "@/pages/hr/payroll-page"
import { HrReportsPage } from "@/pages/hr/reports-page"
import { MyLeavesPage } from "@/features/leave/my-leaves"
import { isManagerRole, useAuthStore } from "@/stores/authStore"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30s
      refetchOnWindowFocus: false,
    },
  },
})

function ProtectedRoute({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user)
  if (!user) {
    return <Navigate to="/login" replace />
  }
  if (user.mustChangePassword) {
    return <Navigate to="/change-password" replace />
  }
  return <>{children}</>
}

function ManagerRoute({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user)
  if (!isManagerRole(user?.role)) {
    return <Navigate to="/employee/employees" replace />
  }
  return <>{children}</>
}

function RoleHomeRedirect() {
  const user = useAuthStore((s) => s.user)
  if (!user) return <Navigate to="/login" replace />
  if (user.mustChangePassword) return <Navigate to="/change-password" replace />
  return <Navigate to={isManagerRole(user.role) ? "/hr/dashboard" : "/employee/employees"} replace />
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" richColors closeButton />
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/change-password" element={<ChangePasswordPage />} />

          {/* Root Redirect */}
          <Route path="/" element={<RoleHomeRedirect />} />

          {/* Protected Application Portal */}
          <Route
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            {/* Employee Portal */}
            <Route path="/employee/dashboard" element={<EmployeeDashboardPage />} />
            <Route path="/employee/employees" element={<EmployeesDirectoryPage />} />
            <Route path="/employee/profile" element={<EmployeeProfilePage />} />
            <Route path="/employee/profile/:id" element={<EmployeeProfilePage />} />
            <Route path="/employee/attendance" element={<EmployeeAttendancePage />} />
            <Route path="/employee/leave" element={<MyLeavesPage />} />
            <Route path="/employee/time-off" element={<MyLeavesPage />} />
            <Route path="/employee/payroll" element={<EmployeePayrollPage />} />

            {/* HR / Admin Portal */}
            <Route element={<ManagerRoute><Outlet /></ManagerRoute>}>
              <Route path="/hr/dashboard" element={<HrDashboardPage />} />
              <Route path="/hr/employees" element={<HrEmployeesPage />} />
              <Route path="/hr/profile" element={<EmployeeProfilePage />} />
              <Route path="/hr/profile/:id" element={<EmployeeProfilePage />} />
              <Route path="/hr/attendance" element={<HrAttendancePage />} />
              <Route path="/hr/leaves" element={<HrLeavesPage />} />
              <Route path="/hr/payroll" element={<HrPayrollPage />} />
              <Route path="/hr/reports" element={<HrReportsPage />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<RoleHomeRedirect />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
