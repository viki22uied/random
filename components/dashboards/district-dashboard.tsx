"use client"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Clock, Filter, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"

export function DistrictDashboard() {
  const { user } = useAuth()
  const router = useRouter()

  const stats = [
    { label: "Total Facilities", value: "42", color: "bg-primary/10" },
    { label: "Active Reports", value: "156", color: "bg-accent/10" },
    { label: "Pending Review", value: "12", color: "bg-amber-500/10" },
    { label: "Approval Rate", value: "92%", color: "bg-emerald-500/10" },
  ]

  const facilities = [
    {
      name: "City General Hospital",
      submissions: 28,
      pending: 2,
      approved: 26,
      status: "active",
    },
    {
      name: "District Primary Center",
      submissions: 15,
      pending: 1,
      approved: 14,
      status: "active",
    },
    {
      name: "Rural Clinic A",
      submissions: 8,
      pending: 3,
      approved: 5,
      status: "needs-review",
    },
    {
      name: "Rural Clinic B",
      submissions: 12,
      pending: 0,
      approved: 12,
      status: "active",
    },
  ]

  return (
    <div className="flex-1 overflow-auto p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">District Dashboard</h1>
        <p className="text-muted-foreground">
          District ID: <span className="font-semibold">DIST001</span>
        </p>
      </div>

      {/* Alert Banner */}
      <div className="mb-8 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg flex gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-amber-900 dark:text-amber-100">12 submissions pending review</p>
          <p className="text-sm text-amber-800 dark:text-amber-300">Review them to keep data flow smooth</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, idx) => (
          <Card key={idx}>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Action */}
      <div className="mb-8">
        <Button
          onClick={() => router.push("/review/queue")}
          className="bg-accent hover:bg-accent text-accent-foreground"
        >
          <Clock className="w-4 h-4 mr-2" />
          View Review Queue (12 Pending)
        </Button>
      </div>

      {/* Facilities Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle>Facilities Overview</CardTitle>
              <CardDescription>Monitor all facilities in the district</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 font-semibold">Facility</th>
                  <th className="text-center p-3 font-semibold">Submissions</th>
                  <th className="text-center p-3 font-semibold">Pending</th>
                  <th className="text-center p-3 font-semibold">Approved</th>
                  <th className="text-center p-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {facilities.map((facility, idx) => (
                  <tr key={idx} className="border-b border-border hover:bg-secondary/30 transition-colors">
                    <td className="p-3 font-medium">{facility.name}</td>
                    <td className="text-center p-3">{facility.submissions}</td>
                    <td className="text-center p-3">
                      <span className="font-semibold text-amber-600 dark:text-amber-400">{facility.pending}</span>
                    </td>
                    <td className="text-center p-3">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">{facility.approved}</span>
                    </td>
                    <td className="text-center p-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          facility.status === "active"
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                            : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                        }`}
                      >
                        {facility.status === "active" ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        {facility.status === "active" ? "Active" : "Needs Review"}
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
  )
}
