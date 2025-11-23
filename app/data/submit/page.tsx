"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { PerformanceDataForm } from "@/components/forms/performance-data-form"
import { ProtectedRoute } from "@/components/protected-route"

export default function SubmitDataPage() {
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
    <ProtectedRoute allowedRoles={["hospital"]}>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <PerformanceDataForm />
      </div>
    </ProtectedRoute>
  )
}
