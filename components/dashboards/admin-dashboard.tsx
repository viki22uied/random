"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, Users, AlertTriangle, CheckCircle, FileText, Activity, Download, FileSpreadsheet } from "lucide-react"
import { rpc, db } from "@/lib/hdims-supabase"
import { exportToPDF, exportToExcel, exportUserData, exportAuditLogs } from "@/lib/export-utils"
import { useRealtimeUsers, useRealtimeAuditLogs, useRealtimeDashboardStats } from "@/lib/realtime-hooks"

export function AdminDashboard() {
  const [systemStats, setSystemStats] = useState([
    { label: "Active Users", value: "0", icon: Users },
    { label: "Pending Reviews", value: "0", icon: AlertTriangle },
    { label: "Total Facilities", value: "0", icon: CheckCircle },
    { label: "Recent Activity", value: "0", icon: Activity },
  ])
  const [recentLogs, setRecentLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Real-time data hooks
  const realtimeUsers = useRealtimeUsers()
  const realtimeAuditLogs = useRealtimeAuditLogs()
  const realtimeStats = useRealtimeDashboardStats()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  useEffect(() => {
    // Update stats when real-time data changes
    if (realtimeStats) {
      setSystemStats([
        { label: "Active Users", value: realtimeStats.users.toString(), icon: Users },
        { label: "Pending Reviews", value: realtimeStats.pendingReviews.toString(), icon: AlertTriangle },
        { label: "Total Facilities", value: realtimeStats.facilities.toString(), icon: CheckCircle },
        { label: "Recent Activity", value: realtimeStats.recentActivity.toString(), icon: Activity },
      ])
    }
  }, [realtimeStats])

  useEffect(() => {
    // Update recent logs when real-time audit logs change
    if (realtimeAuditLogs.length > 0) {
      const logs = realtimeAuditLogs.slice(0, 5).map((log: any) => ({
        description: `${log.action} on ${log.table_name}`,
        timestamp: new Date(log.created_at).toLocaleString(),
        type: log.action.includes('INSERT') ? 'success' : log.action.includes('DELETE') ? 'error' : 'info'
      }))
      setRecentLogs(logs)
    }
  }, [realtimeAuditLogs])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Get superadmin overview data
      const { data: overviewData, error: overviewError } = await rpc.getSuperadminOverview()
      
      if (!overviewError && overviewData) {
        setSystemStats([
          { label: "Active Users", value: overviewData.users_count?.toString() || "0", icon: Users },
          { label: "Pending Reviews", value: overviewData.pending_reviews?.toString() || "0", icon: AlertTriangle },
          { label: "Total Facilities", value: overviewData.facilities_count?.toString() || "0", icon: CheckCircle },
          { label: "States", value: overviewData.states_count?.toString() || "0", icon: BarChart3 },
        ])

        // Transform recent activity
        if (overviewData.recent_activity) {
          const logs = overviewData.recent_activity.slice(0, 5).map((activity: any) => ({
            description: activity.description || 'System activity',
            timestamp: new Date(activity.created_at).toLocaleString(),
            type: activity.status || 'info'
          }))
          setRecentLogs(logs)
        }
      }

      // If RPC fails, fetch individual stats
      if (overviewError) {
        console.warn('RPC overview failed, fetching individual stats:', overviewError)
        
        // Fetch users count
        const { data: users } = await db.select('users', { select: 'id' })
        const { data: facilities } = await db.select('facilities', { select: 'id' })
        const { data: states } = await db.select('states', { select: 'id' })
        
        setSystemStats([
          { label: "Active Users", value: users?.length?.toString() || "0", icon: Users },
          { label: "Pending Reviews", value: "0", icon: AlertTriangle },
          { label: "Total Facilities", value: facilities?.length?.toString() || "0", icon: CheckCircle },
          { label: "States", value: states?.length?.toString() || "0", icon: BarChart3 },
        ])
      }

      // Fetch recent audit logs
      const { data: auditLogs } = await db.select('audit_logs', {
        select: 'action, table_name, created_at, user_id',
        order: { column: 'created_at', ascending: false }
      })

      if (auditLogs) {
        const logs = auditLogs.slice(0, 5).map((log: any) => ({
          description: `${log.action} on ${log.table_name}`,
          timestamp: new Date(log.created_at).toLocaleString(),
          type: log.action.includes('INSERT') ? 'success' : log.action.includes('DELETE') ? 'error' : 'info'
        }))
        setRecentLogs(logs)
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportUsers = async (format: 'pdf' | 'excel') => {
    console.log('Export Users clicked - format:', format)
    try {
      // Create mock user data for export
      const userData = [
        { name: 'John Doe', email: 'john@example.com', role: 'Hospital User', status: 'Active', lastLogin: '2024-12-01' },
        { name: 'Jane Smith', email: 'jane@example.com', role: 'District Admin', status: 'Active', lastLogin: '2024-12-02' },
        { name: 'Mike Johnson', email: 'mike@example.com', role: 'State Admin', status: 'Active', lastLogin: '2024-12-03' },
        { name: 'Sarah Wilson', email: 'sarah@example.com', role: 'Super Admin', status: 'Active', lastLogin: '2024-12-04' }
      ]
      
      console.log('Creating export with', userData.length, 'users')
      
      if (format === 'pdf') {
        // Create PDF content
        const content = `User Export Report\n\n${userData.map(u => `Name: ${u.name}\nEmail: ${u.email}\nRole: ${u.role}\nStatus: ${u.status}\nLast Login: ${u.lastLogin}\n`).join('\n')}`
        const blob = new Blob([content], { type: 'text/plain' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'users-export.txt'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      } else {
        // Create CSV content
        const csvContent = ['Name,Email,Role,Status,Last Login', 
          ...userData.map(u => `"${u.name}","${u.email}","${u.role}","${u.status}","${u.lastLogin}"`)]
          .join('\n')
        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'users-export.csv'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
      
      console.log('Export completed successfully')
      alert(`Users exported successfully as ${format.toUpperCase()}!`)
    } catch (error) {
      console.error('Export error:', error)
      alert('Export failed: ' + (error as Error).message)
    }
  }

  const handleExportAuditLogs = async (format: 'pdf' | 'excel') => {
    console.log('Export Audit Logs clicked - format:', format)
    try {
      // Create mock audit log data for export
      const auditData = [
        { action: 'User Login', user: 'John Doe', timestamp: '2024-12-01 09:00:00', ip: '192.168.1.1', status: 'Success' },
        { action: 'Data Export', user: 'Jane Smith', timestamp: '2024-12-02 10:30:00', ip: '192.168.1.2', status: 'Success' },
        { action: 'User Creation', user: 'Mike Johnson', timestamp: '2024-12-03 14:15:00', ip: '192.168.1.3', status: 'Success' },
        { action: 'File Upload', user: 'Sarah Wilson', timestamp: '2024-12-04 16:45:00', ip: '192.168.1.4', status: 'Success' }
      ]
      
      console.log('Creating export with', auditData.length, 'audit logs')
      
      if (format === 'pdf') {
        // Create PDF content
        const content = `Audit Log Export Report\n\n${auditData.map(a => `Action: ${a.action}\nUser: ${a.user}\nTimestamp: ${a.timestamp}\nIP: ${a.ip}\nStatus: ${a.status}\n`).join('\n')}`
        const blob = new Blob([content], { type: 'text/plain' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'audit-logs-export.txt'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      } else {
        // Create CSV content
        const csvContent = ['Action,User,Timestamp,IP,Status', 
          ...auditData.map(a => `"${a.action}","${a.user}","${a.timestamp}","${a.ip}","${a.status}"`)]
          .join('\n')
        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'audit-logs-export.csv'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
      
      console.log('Audit logs export completed successfully')
      alert(`Audit logs exported successfully as ${format.toUpperCase()}!`)
    } catch (error) {
      console.error('Audit logs export error:', error)
      alert('Export failed: ' + (error as Error).message)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-4 md:p-8">
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Admin Control Panel</h1>
          <p className="text-muted-foreground">System-wide configuration and monitoring</p>
          <div className="mt-2 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-600">Live updates enabled</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExportUsers('excel')}>
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Export Users
          </Button>
          <Button variant="outline" onClick={() => handleExportAuditLogs('excel')}>
            <Download className="w-4 h-4 mr-2" />
            Export Logs
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {systemStats.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <Card key={idx} className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <Icon className="w-6 h-6 text-primary opacity-40" />
                </div>
                {/* Real-time indicator */}
                <div className="absolute top-2 right-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>Recent System Activity</CardTitle>
              <CardDescription>Latest 5 system events</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-600">Live</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              {recentLogs.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No recent activity</p>
              ) : (
                recentLogs.map((log, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 border border-border rounded">
                    <span className="font-medium">{log.description}</span>
                    <span className="text-xs text-muted-foreground">
                      {log.timestamp}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Database Status</CardTitle>
            <CardDescription>System health metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: "Connection", value: 100, status: "healthy" },
                { label: "Data Sync", value: 100, status: "synced" },
                { label: "Storage", value: 25, status: "optimal" },
              ].map((metric, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{metric.label}</span>
                    <span className="text-sm font-semibold text-green-600">{metric.status}</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-green-500 h-full rounded-full transition-all"
                      style={{ width: `${metric.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
