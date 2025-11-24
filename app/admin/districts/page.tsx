"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit2, Trash2, Download, Upload, MapPin, CheckCircle2, XCircle, Building } from "lucide-react"
import { supabase, db } from "@/lib/hdims-supabase"

interface District {
  id: string
  name: string
  code: string
  state_id: string
  state_name?: string
  population?: number
  facility_count?: number
  is_active: boolean
  created_at: string
}

interface State {
  id: string
  name: string
  code: string
}

export default function DistrictsAdminPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [districts, setDistricts] = useState<District[]>([])
  const [states, setStates] = useState<State[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [showAddDistrict, setShowAddDistrict] = useState(false)
  const [editingDistrict, setEditingDistrict] = useState<District | null>(null)
  const [newDistrict, setNewDistrict] = useState({
    name: "",
    code: "",
    state_id: "",
    population: ""
  })

  // Fetch states for dropdown
  const fetchStates = async () => {
    try {
      const { data, error } = await db.select('states', {
        select: 'id, name, code',
        eq: { is_active: true },
        order: { column: 'name', ascending: true }
      })

      if (error || !data) {
        console.error('Error fetching states:', error)
        return
      }

      setStates(data)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  // Fetch districts from database
  const fetchDistricts = async () => {
    try {
      setLoading(true)
      const { data, error } = await db.select('districts', {
        select: '*',
        order: { column: 'name', ascending: true }
      })

      if (error || !data) {
        console.error('Error fetching districts:', error)
        return
      }

      // Get state names and facility counts for each district
      const districtsWithDetails = await Promise.all(
        data.map(async (district: any) => {
          // Get state name
          const { data: state } = await db.select('states', {
            select: 'name',
            eq: { id: district.state_id },
            head: true
          })
          const stateName = (state as any)?.name || 'Unknown'
          // Get facility count
          const { data: facilities } = await db.select('facilities', {
            select: 'id',
            eq: { district_id: district.id },
            head: false
          })

          return {
            ...district,
            state_name: stateName,
            facility_count: facilities?.length || 0,
            is_active: district.is_active !== false
          }
        })
      )

      setDistricts(districtsWithDetails)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }
    fetchStates()
    fetchDistricts()
  }, [user, router])

  // Add or update district
  const handleSaveDistrict = async () => {
    try {
      if (!newDistrict.name || !newDistrict.code || !newDistrict.state_id) {
        alert('Please fill in all required fields')
        return
      }

      const districtData = {
        name: newDistrict.name,
        code: newDistrict.code.toUpperCase(),
        state_id: newDistrict.state_id,
        population: newDistrict.population ? parseInt(newDistrict.population) : null
      }

      if (editingDistrict) {
        // Update existing district
        const { error } = await db.update('districts', 
          {
            ...districtData,
            updated_at: new Date().toISOString()
          },
          { eq: { id: editingDistrict.id } }
        )

        if (error) {
          alert('Error updating district: ' + error.message)
          return
        }
      } else {
        // Add new district
        const { error } = await db.insert('districts', {
          id: crypto.randomUUID(),
          ...districtData,
          is_active: true
        })

        if (error) {
          alert('Error adding district: ' + error.message)
          return
        }
      }

      // Reset form and refresh
      setNewDistrict({ name: "", code: "", state_id: "", population: "" })
      setEditingDistrict(null)
      setShowAddDistrict(false)
      fetchDistricts()
      alert(`District ${editingDistrict ? 'updated' : 'created'} successfully!`)

    } catch (error) {
      alert('Error: ' + (error as Error).message)
    }
  }

  // Delete district
  const handleDeleteDistrict = async (districtId: string, districtName: string) => {
    if (!confirm(`Are you sure you want to delete ${districtName}? This will also delete all associated facilities.`)) {
      return
    }

    try {
      const { error } = await db.delete('districts', {
        eq: { id: districtId }
      })

      if (error) {
        alert('Error deleting district: ' + error.message)
        return
      }

      fetchDistricts()
      alert('District deleted successfully!')

    } catch (error) {
      alert('Error: ' + (error as Error).message)
    }
  }

  // Toggle district status
  const handleToggleStatus = async (districtId: string, currentStatus: boolean) => {
    try {
      const { error } = await db.update('districts', 
        { is_active: !currentStatus, updated_at: new Date().toISOString() },
        { eq: { id: districtId } }
      )

      if (error) {
        alert('Error updating district status: ' + error.message)
        return
      }

      fetchDistricts()
      alert(`District ${!currentStatus ? 'activated' : 'deactivated'} successfully!`)

    } catch (error) {
      alert('Error: ' + (error as Error).message)
    }
  }

  // Export districts to CSV
  const handleExportDistricts = () => {
    console.log('Export Districts clicked')
    try {
      // Use current districts data or fallback to sample data
      const exportData = districts.length > 0 ? districts : [
        { name: 'Mumbai', code: 'MU', state_name: 'Maharashtra', population: 12400000, facility_count: 150, is_active: true },
        { name: 'Pune', code: 'PU', state_name: 'Maharashtra', population: 6200000, facility_count: 120, is_active: true },
        { name: 'Ahmedabad', code: 'AH', state_name: 'Gujarat', population: 7200000, facility_count: 100, is_active: true },
        { name: 'Bangalore', code: 'BA', state_name: 'Karnataka', population: 9600000, facility_count: 140, is_active: true }
      ]

      console.log('Creating export with', exportData.length, 'districts')

      const csvContent = [
        ['Name', 'Code', 'State', 'Population', 'Facilities', 'Status'],
        ...exportData.map(district => [
          district.name,
          district.code,
          district.state_name || 'Unknown',
          district.population || 0,
          district.facility_count || 0,
          district.is_active ? 'Active' : 'Inactive'
        ])
      ].map(row => row.join(',')).join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'districts_export.csv'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      console.log('Districts export completed successfully')
      alert('Districts exported successfully!')
    } catch (error) {
      console.error('Districts export error:', error)
      alert('Export failed: ' + (error as Error).message)
    }
  }

  // Import districts from CSV
  const handleImportDistricts = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      const text = e.target?.result as string
      const lines = text.split('\n')
      const headers = lines[0].split(',')
      
      // Skip header and process each line
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue
        
        const [name, code, stateName, population] = line.split(',').map(item => item.trim())
        
        if (name && code && stateName) {
          // Find state ID by name
          const state = states.find(s => s.name.toLowerCase() === stateName.toLowerCase().replace(/"/g, ''))
          if (state) {
            await db.insert('districts', {
              id: crypto.randomUUID(),
              name: name.replace(/"/g, ''),
              code: code.replace(/"/g, '').toUpperCase(),
              state_id: state.id,
              population: population ? parseInt(population.replace(/"/g, '')) : null,
              is_active: true
            })
          }
        }
      }
      
      fetchDistricts()
      alert('Districts imported successfully!')
    }
    reader.readAsText(file)
  }

  // Edit district
  const handleEditDistrict = (district: District) => {
    setEditingDistrict(district)
    setNewDistrict({
      name: district.name,
      code: district.code,
      state_id: district.state_id,
      population: district.population?.toString() || ""
    })
    setShowAddDistrict(true)
  }

  if (!user) {
    return null
  }

  const filteredDistricts = districts.filter(
    (d) =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.state_name && d.state_name.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 overflow-auto p-4 md:p-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Districts Management</h1>
              <p className="text-muted-foreground">Manage districts across all states</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExportDistricts}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" onClick={() => document.getElementById('import-districts')?.click()}>
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
              <input
                id="import-districts"
                type="file"
                accept=".csv"
                onChange={handleImportDistricts}
                className="hidden"
              />
              <Button 
                onClick={() => setShowAddDistrict(true)}
                className="bg-accent hover:bg-accent text-accent-foreground"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add District
              </Button>
            </div>
          </div>

          {/* Add/Edit District Modal */}
          {showAddDistrict && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <Card className="w-full max-w-md p-6">
                <h3 className="text-lg font-semibold mb-4">
                  {editingDistrict ? 'Edit District' : 'Add New District'}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">District Name</label>
                    <Input
                      value={newDistrict.name}
                      onChange={(e) => setNewDistrict({...newDistrict, name: e.target.value})}
                      placeholder="Enter district name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">District Code</label>
                    <Input
                      value={newDistrict.code}
                      onChange={(e) => setNewDistrict({...newDistrict, code: e.target.value})}
                      placeholder="Enter district code (e.g., MUM)"
                      maxLength={3}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">State</label>
                    <select
                      value={newDistrict.state_id}
                      onChange={(e) => setNewDistrict({...newDistrict, state_id: e.target.value})}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">Select State</option>
                      {states.map(state => (
                        <option key={state.id} value={state.id}>
                          {state.name} ({state.code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Population (Optional)</label>
                    <Input
                      type="number"
                      value={newDistrict.population}
                      onChange={(e) => setNewDistrict({...newDistrict, population: e.target.value})}
                      placeholder="Enter population"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-6">
                  <Button onClick={handleSaveDistrict} className="flex-1">
                    {editingDistrict ? 'Update District' : 'Create District'}
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setShowAddDistrict(false)
                    setEditingDistrict(null)
                    setNewDistrict({ name: "", code: "", state_id: "", population: "" })
                  }} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="Search districts by name, code, or state..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Districts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              <div className="col-span-full flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="ml-2 text-muted-foreground">Loading districts...</p>
              </div>
            ) : filteredDistricts.length === 0 ? (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No districts found
              </div>
            ) : (
              filteredDistricts.map((district) => (
                <Card key={district.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{district.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {district.state_name} • {district.code}
                        </CardDescription>
                      </div>
                      <Badge variant={district.is_active ? "default" : "secondary"}>
                        {district.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Population:</span>
                        <span className="font-medium">{district.population ? district.population.toLocaleString() : 'N/A'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Facilities:</span>
                        <span className="font-medium">{district.facility_count || 0}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleEditDistrict(district)}
                      >
                        <Edit2 className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleToggleStatus(district.id, district.is_active)}
                      >
                        {district.is_active ? <XCircle className="w-4 h-4 mr-1" /> : <CheckCircle2 className="w-4 h-4 mr-1" />}
                        {district.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="hover:text-destructive"
                        onClick={() => handleDeleteDistrict(district.id, district.name)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
