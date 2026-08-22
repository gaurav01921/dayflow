# DayFlow API Contract

Single source of truth for the mock layer (`src/mocks/mockApi.ts`) and the future real backend.
All request/response bodies are JSON. All timestamps are ISO 8601 strings. Dates without time are `YYYY-MM-DD`.

## Conventions

### Success envelope

```json
{ "success": true, "data": { ... } }
```

### Error envelope (always HTTP 4xx/5xx)

```json
{
  "success": false,
  "message": "Leave request could not be submitted",
  "code": "LEAVE_SUBMISSION_FAILED"
}
```

Common error codes: `UNAUTHORIZED`, `FORBIDDEN`, `INVALID_CREDENTIALS`, `NOT_FOUND`,
`EMAIL_EXISTS`, `INVALID_INPUT`, `ALREADY_CHECKED_IN`, `NOT_CHECKED_IN`, `LEAVE_SUBMISSION_FAILED`.

### Roles & authorization

| Role | Access |
| --- | --- |
| `employee` | Own profile, own attendance (+ check in/out), own leaves (+ create), own payroll (read-only), own notifications |
| `hr` | Everything employees can do on their own account + all employees, all attendance, all leaves (+ review), all payroll (+ update), reports |
| `admin` | Same as `hr` |

`VITE_USE_MOCKS=true` routes every service call to the in-memory mock API; `false` uses Axios against `VITE_API_BASE_URL`. Response shapes must stay identical.

---

## Auth

### POST /auth/signup

Request:

```json
{ "employeeCode": "EMP011", "email": "new@dayflow.demo", "password": "Demo@123", "role": "employee" }
```

Response `201` → `{ token, user }` where `user = { id, employeeCode, email, role, emailVerified: false }`

Errors: `EMAIL_EXISTS`, `EMPLOYEE_CODE_EXISTS`, `INVALID_INPUT`
Role: public

### POST /auth/login

Request: `{ "email": "hr@dayflow.demo", "password": "Demo@123" }`
Response `200` → `{ token, user }`
Errors: `INVALID_CREDENTIALS`, `UNAUTHORIZED` (email not verified)
Role: public

### POST /auth/verify-email

Request: `{ "email": "...", "code": "123456" }`
Response `200` → `{ user }` with `emailVerified: true`
Errors: `NOT_FOUND`, `INVALID_INPUT` (wrong code)
Role: public. Mock accepts code `123456`.

---

## Employees

### GET /employees
Response `200` → `Employee[]` (includes optional `workingSchedule: { workingDaysPerWeek, expectedHoursPerDay, breakMinutes }`)
Role: `hr`, `admin`

### GET /employees/:id
Response `200` → `Employee`
Errors: `NOT_FOUND`, `FORBIDDEN` (employees may only fetch self)
Role: any authenticated (self), `hr`/`admin` (anyone)

### PATCH /employees/:id
Request: partial `EmployeeUpdate` (supports `workingSchedule`). Employees may change only `phone`, `address`, `avatarUrl`; HR/admin may change all fields.
Response `200` → updated `Employee`
Errors: `NOT_FOUND`, `FORBIDDEN`, `INVALID_INPUT`

---

## Attendance

### GET /attendance?employeeId=&from=&to=
Query: `employeeId` optional for hr/admin; employees are forced to self. `range` shorthand supported by UI (`week`, `month`) and expanded client-side into `from`/`to`.
Response `200` → `AttendanceRecord[]` sorted by date desc
Errors: `UNAUTHORIZED`
Role: any authenticated

### POST /attendance/check-in
Request: `{}` (employee inferred from session)
Response `201` → today's `AttendanceRecord` with `checkIn` set, `status: "present"`
Errors: `ALREADY_CHECKED_IN`
Role: any authenticated

### POST /attendance/check-out
Request: `{}`
Response `200` → updated `AttendanceRecord` with `checkOut` + `hoursWorked`
Errors: `NOT_CHECKED_IN`
Role: any authenticated

---

## Leaves

### GET /leaves?employeeId=&status=
HR/admin get all; employees forced to self.
Response `200` → `LeaveRequest[]` sorted by createdAt desc

### POST /leaves
Request: `{ "type": "sick", "startDate": "2026-08-24", "endDate": "2026-08-25", "reason": "Flu" }`
Response `201` → created `LeaveRequest` with `status: "pending"`, `days` computed server-side
Errors: `LEAVE_SUBMISSION_FAILED`, `INVALID_INPUT` (end < start)
Role: any authenticated

### PATCH /leaves/:id
Request: `{ "status": "approved" | "rejected", "comment": "Enjoy!" }`
Response `200` → updated `LeaveRequest` (+ `reviewerComment`, `reviewedBy`). Approval marks matching attendance dates as `"leave"` and creates a notification for the employee.
Errors: `NOT_FOUND`, `FORBIDDEN`, `INVALID_INPUT`
Role: `hr`, `admin`

---

## Payroll & Salary Engine

### GET /payroll/:employeeId
Response `200` → `Payroll[]` (includes calculated `salaryStructure` breakdown and `payableDaysDetails`). Employees: self only.
Role: any authenticated

### PUT /payroll/:employeeId
Request: `{ baseSalary?, allowances?, bonus?, deductions?, salaryConfig? }` applied to current month record.
When `salaryConfig` is provided (`monthlyWage`, `basicPercentage`, `hraPercentage`, `standardAllowance`, `performanceBonusPercentage`, `ltaPercentage`, `employeePfRate`, `employerPfRate`, `professionalTax`), salary components and deductions are automatically recalculated server-side.
Response `200` → updated `Payroll` (netPay recomputed). Creates a notification for the employee.
Errors: `NOT_FOUND`, `FORBIDDEN`, `INVALID_INPUT`
Role: `hr`, `admin`

---

## Notifications

### GET /notifications
Response `200` → `NotificationItem[]` for session user, newest first
Role: any authenticated

---

## Reports (hr/admin)

### GET /reports/attendance?days=14
Response `200` → `AttendanceReportRow[]`

### GET /reports/payroll?month=YYYY-MM
Response `200` → `PayrollReport`

### GET /reports/dashboard-stats
Response `200` → `DashboardStats`
