"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, Download, Filter, Calendar } from "lucide-react"

export default function AnalyticsPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/login")
    }
  }, [user, router])

  if (!user) {
    return null
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 overflow-auto p-4 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Analytics & Reports</h1>
          <p className="text-muted-foreground">Performance metrics and data insights</p>
        </div>

        {/* Controls */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            Last 30 Days
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm" className="ml-auto bg-transparent">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Submissions", value: "2,456", change: "+12%" },
            { label: "Approval Rate", value: "94%", change: "+2%" },
            { label: "Avg. Review Time", value: "2.4 hrs", change: "-0.3 hrs" },
            { label: "Data Quality Score", value: "8.9/10", change: "+0.3" },
          ].map((metric, idx) => (
            <Card key={idx}>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground mb-1">{metric.label}</p>
                <div className="flex items-baseline justify-between">
                  <p className="text-2xl font-bold">{metric.value}</p>
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{metric.change}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Submission Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Submission Trends</CardTitle>
              <CardDescription>Weekly submission volume</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-secondary/20 rounded-lg flex items-end justify-around p-4">
                {[40, 65, 55, 70, 60, 75, 85].map((height, idx) => (
                  <div
                    key={idx}
                    className="flex-1 bg-accent rounded-t-lg mx-1 hover:opacity-80 transition-opacity"
                    style={{ height: `${(height / 100) * 200}px` }}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-4 text-xs text-muted-foreground">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
            </CardContent>
          </Card>

          {/* Submission Status */}
          <Card>
            <CardHeader>
              <CardTitle>Submission Status Distribution</CardTitle>
              <CardDescription>Current state breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { label: "Approved", value: 1856, color: "bg-emerald-500" },
                  { label: "Pending Review", value: 380, color: "bg-amber-500" },
                  { label: "Corrected", value: 156, color: "bg-blue-500" },
                  { label: "Rejected", value: 64, color: "bg-destructive" },
                ].map((item, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">{item.label}</span>
                      <span className="text-sm font-semibold">{item.value}</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                      <div
                        className={`${item.color} h-full rounded-full`}
                        style={{ width: `${(item.value / 2500) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Program Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Program Performance Comparison</CardTitle>
            <CardDescription>Key metrics by program</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 font-semibold">Program</th>
                    <th className="text-center p-3 font-semibold">Reports</th>
                    <th className="text-center p-3 font-semibold">Compliance</th>
                    <th className="text-center p-3 font-semibold">Avg Score</th>
                    <th className="text-center p-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: "Maternal Health", reports: 456, compliance: 94, score: 8.8 },
                    { name: "Child Immunization", reports: 512, compliance: 96, score: 9.1 },
                    { name: "Disease Prevention", reports: 389, compliance: 91, score: 8.5 },
                    { name: "Nutrition Program", reports: 445, compliance: 89, score: 8.3 },
                  ].map((program, idx) => (
                    <tr key={idx} className="border-b border-border hover:bg-secondary/30 transition-colors">
                      <td className="p-3 font-medium">{program.name}</td>
                      <td className="text-center p-3">{program.reports}</td>
                      <td className="text-center p-3">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 bg-secondary rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-accent h-full rounded-full"
                              style={{ width: `${program.compliance}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold">{program.compliance}%</span>
                        </div>
                      </td>
                      <td className="text-center p-3 font-semibold">{program.score}/10</td>
                      <td className="text-center p-3">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Good
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
