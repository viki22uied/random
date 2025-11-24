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

  return (
    <ProtectedRoute allowedRoles={["hospital"]}>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <SchemeTrackingForm />
      </div>
    </ProtectedRoute>
  )
}

export const metadata = {
  title: 'Submit Scheme - HDIMS',
  description: 'Submit scheme tracking data for healthcare programs',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}
