import type { ReactNode } from "react"

export type StatusType = "success" | "pending" | "warning" | "error" | "info"

interface StatusBadgeProps {
  status: StatusType
  label: string
  icon?: ReactNode
  size?: "sm" | "md" | "lg"
}

const statusStyles: Record<StatusType, string> = {
  success: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  pending: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  warning: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800",
  error: "bg-destructive/10 text-destructive border-destructive/20",
  info: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
}

const sizeStyles: Record<string, string> = {
  sm: "px-2 py-1 text-xs",
  md: "px-2.5 py-1 text-sm",
  lg: "px-3 py-1.5 text-base",
}

export function StatusBadge({ status, label, icon, size = "md" }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold border ${statusStyles[status]} ${sizeStyles[size]}`}
    >
      {icon}
      {label}
    </span>
  )
}
