"use client"

import type React from "react"

import { useAuth, type UserRole } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    if (!allowedRoles.includes(user.currentRole)) {
      router.push("/dashboard")
      return
    }
  }, [user, allowedRoles, router])

  if (!user || !allowedRoles.includes(user.currentRole)) {
    return null
  }

  return <>{children}</>
}
