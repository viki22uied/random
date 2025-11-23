"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Edit2, Trash2, MapPin } from "lucide-react"

interface Facility {
  id: string
  name: string
  type: string
  district: string
  state: string
  location: string
  staff: number
  status: "active" | "pending"
}

export default function FacilitiesAdminPage() {
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
        district: "District 1",
        state: "State A",
        location: "City Center",
        staff: 145,
        status: "active",
      },
      {
        id: "FAC002",
        name: "District Primary Center",
        type: "Primary Health Center",
        district: "District 1",
        state: "State A",
        location: "District HQ",
        staff: 32,
        status: "active",
      },
      {
        id: "FAC003",
        name: "Rural Clinic A",
        type: "Sub-center",
        district: "District 2",
        state: "State A",
        location: "Village North",
        staff: 8,
        status: "active",
      },
    ])
  }, [user, router])

  if (!user) {
    return null
  }

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 overflow-auto p-4 md:p-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Facility Management</h1>
              <p className="text-muted-foreground">Create and manage healthcare facilities</p>
            </div>
            <Button className="bg-accent hover:bg-accent text-accent-foreground">
              <Plus className="w-4 h-4 mr-2" />
              Add Facility
            </Button>
          </div>

          {/* Facilities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {facilities.map((facility) => (
              <Card key={facility.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{facility.name}</CardTitle>
                      <CardDescription>{facility.type}</CardDescription>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
                        facility.status === "active"
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                          : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                      }`}
                    >
                      {facility.status === "active" ? "Active" : "Pending"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {facility.location}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">District:</span>
                      <span className="font-medium">{facility.district}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">State:</span>
                      <span className="font-medium">{facility.state}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Staff:</span>
                      <span className="font-medium">{facility.staff}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 hover:text-destructive bg-transparent">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
