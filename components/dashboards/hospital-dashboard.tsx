"use client"

import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, FileText, Upload, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"

export function HospitalDashboard() {
  const { user } = useAuth()
  const router = useRouter()

  const stats = [
    {
      label: "Submitted Reports",
      value: "24",
      icon: FileText,
      color: "bg-accent/10",
    },
    {
      label: "Pending Review",
      value: "3",
      icon: AlertCircle,
      color: "bg-amber-500/10",
    },
    {
      label: "Approved",
      value: "21",
      icon: TrendingUp,
      color: "bg-emerald-500/10",
    },
    {
      label: "Files Uploaded",
      value: "12",
      icon: Upload,
      color: "bg-primary/10",
    },
  ]

  return (
    <div className="w-full flex-1 overflow-auto">
      <div className="p-4 md:p-8 space-y-6 md:space-y-8">
        {/* Header */}
        <div className="fade-in">
          <h1 className="text-2xl md:text-4xl font-bold mb-2 transition-all duration-300">
            Welcome, {user?.name?.split(" ")[0]}
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Facility ID: <span className="font-semibold">{user?.facilityId}</span>
          </p>
        </div>

        {/* Stats Grid - Fully Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {stats.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <Card
                key={idx}
                style={{ animationDelay: `${idx * 50}ms` }}
                className="card-hover fade-in cursor-pointer transition-all duration-300"
              >
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs md:text-sm text-muted-foreground truncate">{stat.label}</p>
                      <p className="text-xl md:text-2xl font-bold mt-1">{stat.value}</p>
                    </div>
                    <div
                      className={`${stat.color} p-2 md:p-3 rounded-lg flex-shrink-0 transition-all duration-300 hover:scale-110`}
                    >
                      <Icon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {[
            {
              title: "Submit Performance Data",
              description: "Enter facility-level metrics and performance indicators",
              action: "Submit Data",
              href: "/data/submit",
              bgClass: "bg-accent/5",
            },
            {
              title: "Submit Scheme Tracking",
              description: "Report beneficiary counts and fund utilization",
              action: "Submit Scheme",
              href: "/scheme/submit",
              bgClass: "bg-primary/5",
            },
          ].map((card, idx) => (
            <Card
              key={idx}
              style={{ animationDelay: `${(idx + stats.length) * 50}ms` }}
              className="card-hover fade-in transition-all duration-300"
            >
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">{card.title}</CardTitle>
                <CardDescription className="text-xs md:text-sm">{card.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => router.push(card.href)}
                  className={`w-full h-10 transition-all duration-200 btn-micro ${
                    idx === 0
                      ? "bg-accent hover:bg-accent/90 text-accent-foreground"
                      : "bg-primary hover:bg-primary/90 text-primary-foreground"
                  }`}
                >
                  {card.action}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <Card className="fade-in transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Recent Submissions</CardTitle>
            <CardDescription className="text-xs md:text-sm">Your last 5 submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...Array(5)].map((_, idx) => (
                <div
                  key={idx}
                  style={{ animationDelay: `${(idx + stats.length + 2) * 30}ms` }}
                  className="flex flex-col md:flex-row md:items-center md:justify-between p-3 md:p-4 border border-border rounded-lg hover:bg-secondary/30 transition-all duration-200 fade-in gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm md:text-base truncate">Performance Data - Week {52 - idx}</p>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      {new Date(Date.now() - idx * 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 whitespace-nowrap transition-all duration-200 hover:bg-emerald-500/20">
                    Approved
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
