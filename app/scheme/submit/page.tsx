"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { SchemeTrackingForm } from "@/components/forms/scheme-tracking-form"
import { ProtectedRoute } from "@/components/protected-route"

export default function SubmitSchemePage() {
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

  useEffect(() => {
    document.title = 'Submit Scheme - HDIMS'
  }, [])

  return (
    <ProtectedRoute allowedRoles={["hospital"]}>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <SchemeTrackingForm />
      </div>
    </ProtectedRoute>
  )
}
