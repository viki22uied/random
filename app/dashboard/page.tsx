"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { HospitalDashboard } from "@/components/dashboards/hospital-dashboard"
import { DistrictDashboard } from "@/components/dashboards/district-dashboard"
import { StateDashboard } from "@/components/dashboards/state-dashboard"
import { AdminDashboard } from "@/components/dashboards/admin-dashboard"

export default function DashboardPage() {
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

  const dashboardComponent = {
    hospital: <HospitalDashboard />,
    district: <DistrictDashboard />,
    state: <StateDashboard />,
    admin: <AdminDashboard />,
  }[user.currentRole]

  return (
    <div className="flex flex-col md:flex-row h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto w-full md:w-auto">{dashboardComponent}</main>
    </div>
  )
}
