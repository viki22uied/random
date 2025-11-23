"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth, type UserRole } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

const roleOptions: { value: UserRole; label: string; description: string }[] = [
  {
    value: "hospital",
    label: "Hospital Staff",
    description: "Sign in or sign up for hospital data management",
  },
  {
    value: "district",
    label: "District Admin",
    description: "Review and approve submissions",
  },
  {
    value: "state",
    label: "State Admin",
    description: "View aggregated analytics",
  },
  {
    value: "admin",
    label: "Super Admin",
    description: "Manage system and users",
  },
]

export function LoginForm() {
  const router = useRouter()
  const { login, isLoading } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [error, setError] = useState("")
  const [loginMode, setLoginMode] = useState<'personal' | 'shared'>('shared')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("Email and password are required")
      return
    }

    if (!selectedRole) {
      setError("Please select your role")
      return
    }

    try {
      await login(email, password, selectedRole)
      router.push("/dashboard")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login failed"
      
      // Only redirect to sign-up if it's specifically a "user not found" error for hospital staff
      if (selectedRole === 'hospital' && errorMessage.includes("User account not found")) {
        router.push(`/signup?email=${encodeURIComponent(email)}&role=hospital`)
      } else {
        setError(errorMessage)
      }
    }
  }

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role)
    // Switch to personal email mode for hospital staff
    if (role === 'hospital') {
      setLoginMode('personal')
    } else {
      // For other roles, use shared credentials
      if (role === 'admin') setEmail('admin@hdims.gov.in')
      if (role === 'state') setEmail('state@hdims.gov.in')
      if (role === 'district') setEmail('district@hdims.gov.in')
      setLoginMode('shared')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background flex items-center justify-center p-4 md:p-6">
      {/* Background accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse" />

      <div className="w-full max-w-md fade-in">
        <Card className="border-border/50 shadow-lg">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2 mb-4 transition-transform duration-300 hover:scale-105">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center transition-all duration-300 hover:shadow-lg">
                <svg className="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m7 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <CardTitle className="text-2xl font-heading">Health Metrics</CardTitle>
              </div>
            </div>
            <CardDescription>Manage facility performance data securely</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-subheading block">
                  Email Address 
                  {selectedRole === 'hospital' && loginMode === 'personal' && (
                    <span className="text-xs text-muted-foreground ml-2">(Your personal email)</span>
                  )}
                </label>
                <Input
                  type="email"
                  placeholder={
                    selectedRole === 'hospital' && loginMode === 'personal'
                      ? "Enter your personal email"
                      : "Enter your email"
                  }
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={selectedRole !== 'hospital' && loginMode === 'shared'}
                  className={`h-10 font-body transition-all duration-200 focus:ring-2 focus:ring-offset-1 ${
                    selectedRole !== 'hospital' && loginMode === 'shared'
                      ? 'bg-muted/50 cursor-not-allowed'
                      : ''
                  }`}
                />
                {selectedRole !== 'hospital' && loginMode === 'shared' && (
                  <p className="text-xs text-muted-foreground font-caption">
                    Shared credentials are used for this role
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-sm font-subheading block">Password</label>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 font-body transition-all duration-200 focus:ring-2 focus:ring-offset-1"
                />
              </div>

              {/* Role Selection - REQUIRED */}
              <div className="space-y-3 pt-2">
                <label className="text-sm font-subheading block">
                  Select Your Role <span className="text-destructive">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {roleOptions.map((option, idx) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleRoleChange(option.value)}
                      style={{ animationDelay: `${idx * 50}ms` }}
                      className={`p-3 md:p-4 rounded-lg border-2 text-left transition-all duration-200 hover:scale-105 active:scale-95 fade-in ${
                        selectedRole === option.value
                          ? "border-accent bg-accent/10 shadow-md"
                          : "border-border/50 hover:border-border hover:shadow-sm"
                      }`}
                    >
                      <div className="font-medium text-sm font-poppins">{option.label}</div>
                      <div className="text-xs text-muted-foreground font-caption">{option.description}</div>
                      {option.value === 'hospital' && (
                        <div className="text-xs text-primary mt-1 font-caption">Sign in or create account</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive fade-in">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span className="font-body">{error}</span>
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                disabled={isLoading || !selectedRole}
                className="w-full h-10 bg-accent hover:bg-accent/90 text-accent-foreground btn-micro disabled:opacity-50 font-poppins"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>

              {/* Sign-up Link */}
              {selectedRole === 'hospital' && (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground font-body">
                    New hospital staff?{' '}
                    <button
                      type="button"
                      onClick={() => router.push('/signup')}
                      className="text-primary hover:underline font-subheading"
                    >
                      Create an account
                    </button>
                  </p>
                </div>
              )}

              {/* Demo note */}
              <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                <p className="text-xs font-medium text-center font-poppins">Login Credentials:</p>
                <div className="text-xs space-y-1 font-caption">
                  <div><strong>Super Admin:</strong> admin@hdims.gov.in / Admin123!</div>
                  <div><strong>State Admin:</strong> state@hdims.gov.in / State123!</div>
                  <div><strong>District Admin:</strong> district@hdims.gov.in / District123!</div>
                </div>
                
                <div className="border-t pt-2 mt-2">
                  <p className="text-xs font-semibold text-center text-primary font-poppins">🏥 Hospital Staff</p>
                  <p className="text-xs text-center mt-1 font-subheading">
                    <strong>Sign in or create new account</strong>
                  </p>
                  <p className="text-xs text-center text-muted-foreground font-caption">
                    • Use your email and password<br/>
                    • New users can sign up for free<br/>
                    • Super admin can track all users
                  </p>
                </div>
                
                <p className="text-xs text-center text-primary font-caption">
                  👤 Individual tracking for hospital staff
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
