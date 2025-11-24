import type { ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"

interface StatCardProps {
  label: string
  value: string | number
  icon?: ReactNode
  trend?: {
    value: number
    direction: "up" | "down"
  }
  color?: "primary" | "accent" | "success" | "warning"
}

const colorStyles: Record<string, string> = {
  primary: "bg-primary/10",
  accent: "bg-accent/10",
  success: "bg-emerald-500/10",
  warning: "bg-amber-500/10",
}

const trendColorStyles: Record<string, string> = {
  up: "text-emerald-600 dark:text-emerald-400",
  down: "text-destructive",
}

export function StatCard({ label, value, icon, trend, color = "primary" }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-1">{label}</p>
            <p className="text-2xl md:text-3xl font-bold">{value}</p>
          </div>
          {icon && <div className={`${colorStyles[color]} p-2 rounded-lg flex-shrink-0`}>{icon}</div>}
        </div>

        {trend && (
          <div className={`flex items-center gap-1 text-sm font-semibold ${trendColorStyles[trend.direction]}`}>
            {trend.direction === "up" ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {Math.abs(trend.value)}%
          </div>
        )}
      </CardContent>
    </Card>
  )
}
