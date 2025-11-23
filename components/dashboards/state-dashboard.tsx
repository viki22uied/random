"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function StateDashboard() {
  const metrics = [
    { label: "Total Districts", value: "28", trend: "+2" },
    { label: "Total Facilities", value: "1,240", trend: "+45" },
    { label: "Data Compliance", value: "94%", trend: "+3%" },
    { label: "Performance Score", value: "8.7/10", trend: "+0.2" },
  ]

  return (
    <div className="flex-1 p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">State Analytics Dashboard</h1>
        <p className="text-muted-foreground">Aggregated health performance metrics across all districts</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metrics.map((metric, idx) => (
          <Card key={idx}>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-1">{metric.label}</p>
              <div className="flex items-baseline justify-between">
                <p className="text-2xl font-bold">{metric.value}</p>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{metric.trend}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Districts</CardTitle>
            <CardDescription>Based on compliance and data quality</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...Array(5)].map((_, idx) => (
                <div key={idx} className="flex items-center justify-between p-2">
                  <span className="text-sm font-medium">District {idx + 1}</span>
                  <div className="w-32 bg-secondary rounded-full h-2 overflow-hidden">
                    <div className="bg-accent h-full rounded-full" style={{ width: `${95 - idx * 3}%` }} />
                  </div>
                  <span className="text-sm font-semibold">{95 - idx * 3}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Scheme Performance</CardTitle>
            <CardDescription>Welfare scheme utilization rates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: "Maternal Health", rate: 87 },
                { name: "Child Nutrition", rate: 92 },
                { name: "Immunization", rate: 88 },
                { name: "Disease Prevention", rate: 81 },
              ].map((scheme, idx) => (
                <div key={idx} className="flex items-center justify-between p-2">
                  <span className="text-sm font-medium">{scheme.name}</span>
                  <span className="text-sm font-semibold">{scheme.rate}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
