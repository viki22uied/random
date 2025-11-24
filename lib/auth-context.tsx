"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback, useEffect } from "react"
import { supabase } from "./hdims-supabase"

export type UserRole = "hospital" | "district" | "state" | "admin"

export interface User {
  id: string
  email: string
  name: string
  roles: UserRole[]
  currentRole: UserRole
  facilityId?: string
  districtId?: string
  stateId?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string, role: UserRole) => Promise<void>
  logout: () => void
  switchRole: (role: UserRole) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Role mapping between frontend and backend
const roleMapping: Record<UserRole, string> = {
  hospital: "hospital_user",
  district: "district_admin", 
  state: "state_admin",
  admin: "super_admin",
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        // Get user profile from users table
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (userData) {
          // Convert backend role to frontend role
          const backendToFrontendRole: Record<string, UserRole> = {
            "hospital_user": "hospital",
            "district_admin": "district", 
            "state_admin": "state",
            "super_admin": "admin",
          }

          const frontendRole = backendToFrontendRole[userData.role] || "hospital"
          
          setUser({
            id: userData.id,
            email: userData.email,
            name: userData.full_name,
            roles: [frontendRole],
            currentRole: frontendRole,
            facilityId: userData.facility_id,
            districtId: userData.district_id,
            stateId: userData.state_id,
          })
        }
      }
    }

    checkSession()

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUser(null)
        sessionStorage.removeItem("auth_user")
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = useCallback(async (email: string, password: string, role: UserRole) => {
    setIsLoading(true)
    try {
      // Hardcoded hospital staff credentials
      if (role === 'hospital') {
        const validHospitalCredentials = [
          { email: 'hospital1@hdims.in', password: 'Hospital123!', name: 'Dr. Rajesh Kumar' },
          { email: 'hospital2@hdims.in', password: 'Hospital123!', name: 'Dr. Priya Sharma' },
          { email: 'hospital3@hdims.in', password: 'Hospital123!', name: 'Dr. Vijay Kumar' },
          { email: 'hospital4@hdims.in', password: 'Hospital123!', name: 'Dr. Amit Singh' }
        ]

        const validUser = validHospitalCredentials.find(cred => cred.email === email && cred.password === password)
        
        if (!validUser) {
          throw new Error("Invalid hospital staff credentials. Use the provided credentials.")
        }

        // Create mock user object for hospital staff
        const userObj: User = {
          id: `hospital_${email.split('@')[0]}`,
          email: validUser.email,
          name: validUser.name,
          roles: [role],
          currentRole: role,
          facilityId: '770e8400-e29b-41d4-a716-446655440001', // Mumbai Central Hospital
          districtId: '660e8400-e29b-41d4-a716-446655440001', // Mumbai
          stateId: '550e8400-e29b-41d4-a716-446655440001', // Maharashtra
        }

        setUser(userObj)
        sessionStorage.setItem("auth_user", JSON.stringify(userObj))
        return
      }

      // For other roles (admin, state, district), use existing Supabase logic
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      if (!data.user) {
        throw new Error("Login failed")
      }

      // Get user profile from users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (userError || !userData) {
        throw new Error("User profile not found")
      }

      // Verify role matches
      const backendToFrontendRole: Record<string, UserRole> = {
        "hospital_user": "hospital",
        "district_admin": "district", 
        "state_admin": "state",
        "super_admin": "admin",
      }

      const expectedRole = backendToFrontendRole[userData.role]
      if (expectedRole !== role) {
        throw new Error(`Role mismatch. Expected ${role}, but user is ${expectedRole}`)
      }

      const userObj: User = {
        id: userData.id,
        email: userData.email,
        name: userData.full_name,
        roles: [role],
        currentRole: role,
        facilityId: userData.facility_id,
        districtId: userData.district_id,
        stateId: userData.state_id,
      }

      setUser(userObj)
      sessionStorage.setItem("auth_user", JSON.stringify(userObj))
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    sessionStorage.removeItem("auth_user")
  }, [])

  const switchRole = useCallback(
    (role: UserRole) => {
      if (user?.roles.includes(role)) {
        const updated = { ...user, currentRole: role }
        setUser(updated)
        sessionStorage.setItem("auth_user", JSON.stringify(updated))
      }
    },
    [user],
  )

  return <AuthContext.Provider value={{ user, isLoading, login, logout, switchRole }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
