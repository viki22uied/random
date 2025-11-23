"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Filter, Plus } from "lucide-react"

interface Facility {
  id: string
  name: string
  type: string
  location: string
  staff: number
  submissions: number
  compliance: number
  status: "active" | "inactive"
}

export default function FacilitiesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [facilities, setFacilities] = useState<Facility[]>([])

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    setFacilities([
      {
        id: "FAC001",
        name: "City General Hospital",
        type: "Government Hospital",
        location: "City Center",
        staff: 145,
        submissions: 28,
        compliance: 96,
        status: "active",
      },
      {
        id: "FAC002",
        name: "District Primary Center",
        type: "Primary Health Center",
        location: "District HQ",
        staff: 32,
        submissions: 15,
        compliance: 88,
        status: "active",
      },
      {
        id: "FAC003",
        name: "Rural Clinic A",
        type: "Sub-center",
        location: "Village North",
        staff: 8,
        submissions: 8,
        compliance: 75,
        status: "active",
      },
      {
        id: "FAC004",
        name: "Rural Clinic B",
        type: "Sub-center",
        location: "Village South",
        staff: 7,
        submissions: 12,
        compliance: 92,
        status: "active",
      },
    ])
  }, [user, router])

  if (!user) {
    return null
  }

  return (
    <ProtectedRoute allowedRoles={["district"]}>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 overflow-auto p-4 md:p-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Facilities</h1>
              <p className="text-muted-foreground">Manage all facilities in your district</p>
            </div>
            <Button className="bg-accent hover:bg-accent text-accent-foreground">
              <Plus className="w-4 h-4 mr-2" />
              Add Facility
            </Button>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex gap-2 flex-wrap">
                <Button variant="default" size="sm">
                  All ({facilities.length})
                </Button>
                <Button variant="outline" size="sm">
                  Active ({facilities.filter((f) => f.status === "active").length})
                </Button>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Facilities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {facilities.map((facility) => (
              <Card key={facility.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <CardTitle className="text-lg">{facility.name}</CardTitle>
                      <CardDescription>{facility.type}</CardDescription>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        facility.status === "active"
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                          : "bg-gray-500/10 text-gray-700 dark:text-gray-400"
                      }`}
                    >
                      {facility.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {facility.location}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{facility.staff}</p>
                      <p className="text-xs text-muted-foreground">Staff</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{facility.submissions}</p>
                      <p className="text-xs text-muted-foreground">Reports</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-accent">{facility.compliance}%</p>
                      <p className="text-xs text-muted-foreground">Compliance</p>
                    </div>
                  </div>

                  {/* Compliance Bar */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Compliance Score</p>
                    <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-accent h-full rounded-full transition-all"
                        style={{ width: `${facility.compliance}%` }}
                      />
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={() => router.push(`/facilities/${facility.id}`)}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
