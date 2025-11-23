"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { User, Mail, Lock, Building, AlertCircle, ArrowLeft, MapPin } from "lucide-react"
import { supabase } from "@/lib/hdims-supabase"

export default function SignUpPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: searchParams.get('email') || "",
    password: "",
    confirmPassword: "",
    state: "",
    district: "",
    facilityId: ""
  })

  useEffect(() => {
    // Pre-fill email from URL params
    const email = searchParams.get('email')
    if (email) {
      setFormData(prev => ({ ...prev, email }))
    }
  }, [searchParams])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Validation
    if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("All fields are required")
      setIsLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      setIsLoading(false)
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address")
      setIsLoading(false)
      return
    }

    try {
      // Step 1: Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: 'hospital_user'
          }
        }
      })

      if (authError) {
        throw new Error("Failed to create account: " + authError.message)
      }

      // Step 2: Create user profile in database
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user?.id,
          email: formData.email,
          full_name: formData.fullName,
          role: 'hospital_user',
          state_name: formData.state,
          district_name: formData.district,
          is_active: true,
          created_at: new Date().toISOString()
        })

      if (profileError) {
        throw new Error("Account created but profile setup failed: " + profileError.message)
      }

      setSuccess(true)
      
      // Auto-login after successful signup
      setTimeout(() => {
        router.push('/login')
      }, 2000)

    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred during signup")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background flex items-center justify-center p-4 md:p-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl -z-10 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse" />

        <div className="w-full max-w-md fade-in">
          <Card className="border-border/50 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-green-600 font-heading">✅ Account Created!</CardTitle>
              <CardDescription className="font-body">
                Your hospital staff account has been created successfully.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-4 font-caption">
                Redirecting to login page...
              </p>
              <Button 
                onClick={() => router.push('/login')}
                className="w-full font-poppins"
              >
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
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
                <User className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-2xl font-heading">Create Account</CardTitle>
              </div>
            </div>
            <CardDescription>
              Sign up as Hospital Staff for HDIMS
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-sm font-subheading flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Full Name
                </label>
                <Input
                  name="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="h-10 font-body"
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-subheading flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </label>
                <Input
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="h-10 font-body"
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-sm font-subheading flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Password
                </label>
                <Input
                  name="password"
                  type="password"
                  placeholder="Create a password (min 6 chars)"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="h-10 font-body"
                  required
                />
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-sm font-subheading flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Confirm Password
                </label>
                <Input
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="h-10 font-body"
                  required
                />
              </div>

              {/* State Selection */}
              <div className="space-y-2">
                <label className="text-sm font-subheading flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  State
                </label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="w-full h-10 px-3 py-2 border border-border rounded-md bg-background font-body"
                  required
                >
                  <option value="">Select State</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="West Bengal">West Bengal</option>
                </select>
              </div>

              {/* District Selection */}
              <div className="space-y-2">
                <label className="text-sm font-subheading flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  District
                </label>
                <select
                  name="district"
                  value={formData.district}
                  onChange={handleInputChange}
                  className="w-full h-10 px-3 py-2 border border-border rounded-md bg-background font-body"
                  required
                >
                  <option value="">Select District</option>
                  <option value="Central Delhi">Central Delhi</option>
                  <option value="North Delhi">North Delhi</option>
                  <option value="South Delhi">South Delhi</option>
                  <option value="East Delhi">East Delhi</option>
                  <option value="West Delhi">West Delhi</option>
                  <option value="New Delhi">New Delhi</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Pune">Pune</option>
                  <option value="Bangalore">Bangalore</option>
                  <option value="Chennai">Chennai</option>
                  <option value="Kolkata">Kolkata</option>
                </select>
              </div>

              {/* Facility Information */}
              <div className="space-y-2">
                <label className="text-sm font-subheading flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Facility ID
                </label>
                <Input
                  name="facilityId"
                  type="text"
                  placeholder="FAC001 (Default)"
                  value={formData.facilityId}
                  onChange={handleInputChange}
                  className="h-10 font-body"
                />
                <p className="text-xs text-muted-foreground font-caption">
                  Leave blank to use default facility ID
                </p>
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
                disabled={isLoading}
                className="w-full h-10 bg-accent hover:bg-accent/90 text-accent-foreground font-poppins"
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>

              {/* Back to Login */}
              <div className="text-center">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => router.push('/login')}
                  className="text-sm text-muted-foreground hover:text-foreground font-body"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Button>
              </div>

              {/* Info */}
              <div className="bg-muted/50 rounded-lg p-3 text-xs text-center">
                <p className="font-medium font-poppins">Hospital Staff Registration</p>
                <p className="text-muted-foreground mt-1 font-caption">
                  Your account will be tracked by the system administrator
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
