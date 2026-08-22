import { Badge } from "@/components/ui/badge"

type PillKey =
  | "present"
  | "absent"
  | "half-day"
  | "leave"
  | "pending"
  | "approved"
  | "rejected"

const PILL_CONFIG: Record<PillKey, { label: string; variant: "success" | "warning" | "info" | "destructive" }> = {
  present: { label: "Present", variant: "success" },
  absent: { label: "Absent", variant: "destructive" },
  "half-day": { label: "Half-day", variant: "warning" },
  leave: { label: "Leave", variant: "info" },
  pending: { label: "Pending", variant: "warning" },
  approved: { label: "Approved", variant: "success" },
  rejected: { label: "Rejected", variant: "destructive" },
}

export function StatusPill({ status }: { status: PillKey }) {
  const config = PILL_CONFIG[status]
  return <Badge variant={config.variant}>{config.label}</Badge>
}
