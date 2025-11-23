"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function Home() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Immediate redirect - no loading delay
    if (user) {
      router.push("/dashboard")
    } else {
      router.push("/login")
    }
  }, [user, router])

  // Show minimal loading state during redirect
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-muted rounded-full animate-spin border-t-accent" />
        <p className="text-sm text-muted-foreground font-body">Redirecting to login...</p>
      </div>
    </div>
  )
}
