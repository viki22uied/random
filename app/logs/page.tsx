"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Filter, Download, Search } from "lucide-react"

interface SystemLog {
  id: string
  timestamp: string
  user: string
  action: string
  resource: string
  status: "success" | "error" | "warning"
  details: string
}

export default function LogsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [logs, setLogs] = useState<SystemLog[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    setLogs([
      {
        id: "LOG001",
        timestamp: "2024-12-15 02:45:30 PM",
        user: "admin@system.com",
        action: "User Created",
        resource: "User: rajesh@hospital.com",
        status: "success",
        details: "New hospital staff user created for City General Hospital",
      },
      {
        id: "LOG002",
        timestamp: "2024-12-15 02:30:15 PM",
        user: "priya@district.com",
        action: "Submission Approved",
        resource: "Submission: SUB001",
        status: "success",
        details: "Performance data approved for City General Hospital",
      },
      {
        id: "LOG003",
        timestamp: "2024-12-15 02:15:45 PM",
        user: "system",
        action: "Database Backup",
        resource: "Database: health_metrics_db",
        status: "success",
        details: "Scheduled daily backup completed successfully",
      },
      {
        id: "LOG004",
        timestamp: "2024-12-15 01:50:20 PM",
        user: "rajesh@hospital.com",
        action: "Data Submission",
        resource: "Submission: SUB005",
        status: "success",
        details: "Scheme tracking data submitted for review",
      },
      {
        id: "LOG005",
        timestamp: "2024-12-15 01:30:10 PM",
        user: "admin@system.com",
        action: "Permission Updated",
        resource: "User: priya@district.com",
        status: "warning",
        details: "Admin permissions granted",
      },
      {
        id: "LOG006",
        timestamp: "2024-12-15 01:15:05 PM",
        user: "arun@state.com",
        action: "Report Generated",
        resource: "Report: State_Analytics_Dec2024",
        status: "success",
        details: "Monthly state-level analytics report generated",
      },
    ])
  }, [user, router])

  if (!user) {
    return null
  }

  const filteredLogs = logs.filter(
    (log) =>
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
      case "error":
        return "bg-destructive/10 text-destructive"
      case "warning":
        return "bg-amber-500/10 text-amber-700 dark:text-amber-400"
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400"
    }
  }

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 overflow-auto p-4 md:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">System Logs</h1>
            <p className="text-muted-foreground">Monitor system activity and audit trail</p>
          </div>

          {/* Controls */}
          <div className="mb-6 flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Logs Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary/30">
                      <th className="text-left p-4 font-semibold">Timestamp</th>
                      <th className="text-left p-4 font-semibold">User</th>
                      <th className="text-left p-4 font-semibold">Action</th>
                      <th className="text-left p-4 font-semibold">Resource</th>
                      <th className="text-center p-4 font-semibold">Status</th>
                      <th className="text-left p-4 font-semibold">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map((log) => (
                      <tr key={log.id} className="border-b border-border hover:bg-secondary/20 transition-colors">
                        <td className="p-4 text-xs font-mono">{log.timestamp}</td>
                        <td className="p-4 font-medium">{log.user}</td>
                        <td className="p-4 font-medium">{log.action}</td>
                        <td className="p-4 text-muted-foreground text-xs">{log.resource}</td>
                        <td className="p-4 text-center">
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                              log.status,
                            )}`}
                          >
                            {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                          </span>
                        </td>
                        <td className="p-4 text-muted-foreground">{log.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
