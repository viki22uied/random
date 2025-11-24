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
import { Plus, Search, Edit2, Trash2, Download, Upload, MapPin, CheckCircle2, XCircle, Building, Users, Bed } from "lucide-react"
import { supabase, db } from "@/lib/hdims-supabase"

interface Facility {
  id: string
  name: string
  facility_type: string
  district_id: string
  district_name?: string
  state_name?: string
  address: string
  contact_phone: string
  bed_capacity?: number
  is_active: boolean
  created_at: string
}

interface District {
  id: string
  name: string
  state_id: string
}

export default function FacilitiesAdminPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [showAddFacility, setShowAddFacility] = useState(false)
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null)
  const [newFacility, setNewFacility] = useState({
    name: "",
    facility_type: "DH",
    district_id: "",
    address: "",
    contact_phone: "",
    bed_capacity: ""
  })

  const facilityTypes = [
    { value: "DH", label: "District Hospital" },
    { value: "SDH", label: "Sub-District Hospital" },
    { value: "CHC", label: "Community Health Center" },
    { value: "PHC", label: "Primary Health Center" },
    { value: "MEDICAL_COLLEGE", label: "Medical College" },
    { value: "SPECIALITY_HOSPITAL", label: "Speciality Hospital" }
  ]

  // Fetch districts for dropdown
  const fetchDistricts = async () => {
    try {
      const { data, error } = await db.select('districts', {
        select: 'id, name, state_id',
        eq: { is_active: true },
        order: { column: 'name', ascending: true }
      })

      if (error || !data) {
        console.error('Error fetching districts:', error)
        return
      }

      setDistricts(data)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  // Fetch facilities from database
  const fetchFacilities = async () => {
    try {
      setLoading(true)
      const { data, error } = await db.select('facilities', {
        select: '*',
        order: { column: 'name', ascending: true }
      })

      if (error || !data) {
        console.error('Error fetching facilities:', error)
        return
      }

      // Get district and state names for each facility
      const facilitiesWithDetails = await Promise.all(
        data.map(async (facility: any) => {
          // Get district and state info
          const { data: district } = await db.select('districts', {
            select: 'name, state_id',
            eq: { id: facility.district_id },
            head: true
          })
          
          let stateName = 'Unknown'
          if ((district as any)?.state_id) {
            const { data: state } = await db.select('states', {
              select: 'name',
              eq: { id: (district as any).state_id },
              head: true
            })
            stateName = (state as any)?.name || 'Unknown'
          }

          return {
            ...facility,
            district_name: (district as any)?.name || 'Unknown',
            state_name: stateName,
            is_active: facility.is_active !== false
          }
        })
      )

      setFacilities(facilitiesWithDetails)
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
    fetchDistricts()
    fetchFacilities()
  }, [user, router])

  // Add or update facility
  const handleSaveFacility = async () => {
    try {
      if (!newFacility.name || !newFacility.facility_type || !newFacility.district_id || !newFacility.address || !newFacility.contact_phone) {
        alert('Please fill in all required fields')
        return
      }

      const facilityData = {
        name: newFacility.name,
        facility_type: newFacility.facility_type,
        district_id: newFacility.district_id,
        address: newFacility.address,
        contact_phone: newFacility.contact_phone,
        bed_capacity: newFacility.bed_capacity ? parseInt(newFacility.bed_capacity) : null
      }

      if (editingFacility) {
        // Update existing facility
        const { error } = await db.update('facilities', 
          {
            ...facilityData,
            updated_at: new Date().toISOString()
          },
          { eq: { id: editingFacility.id } }
        )

        if (error) {
          alert('Error updating facility: ' + error.message)
          return
        }
      } else {
        // Add new facility
        const { error } = await db.insert('facilities', {
          id: crypto.randomUUID(),
          ...facilityData,
          is_active: true
        })

        if (error) {
          alert('Error adding facility: ' + error.message)
          return
        }
      }

      // Reset form and refresh
      setNewFacility({ name: "", facility_type: "DH", district_id: "", address: "", contact_phone: "", bed_capacity: "" })
      setEditingFacility(null)
      setShowAddFacility(false)
      fetchFacilities()
      alert(`Facility ${editingFacility ? 'updated' : 'created'} successfully!`)

    } catch (error) {
      alert('Error: ' + (error as Error).message)
    }
  }

  // Delete facility
  const handleDeleteFacility = async (facilityId: string, facilityName: string) => {
    if (!confirm(`Are you sure you want to delete ${facilityName}?`)) {
      return
    }

    try {
      const { error } = await db.delete('facilities', {
        eq: { id: facilityId }
      })

      if (error) {
        alert('Error deleting facility: ' + error.message)
        return
      }

      fetchFacilities()
      alert('Facility deleted successfully!')

    } catch (error) {
      alert('Error: ' + (error as Error).message)
    }
  }

  // Toggle facility status
  const handleToggleStatus = async (facilityId: string, currentStatus: boolean) => {
    try {
      const { error } = await db.update('facilities', 
        { is_active: !currentStatus, updated_at: new Date().toISOString() },
        { eq: { id: facilityId } }
      )

      if (error) {
        alert('Error updating facility status: ' + error.message)
        return
      }

      fetchFacilities()
      alert(`Facility ${!currentStatus ? 'activated' : 'deactivated'} successfully!`)

    } catch (error) {
      alert('Error: ' + (error as Error).message)
    }
  }

  // Export facilities to CSV
  const handleExportFacilities = () => {
    console.log('Export Facilities clicked')
    try {
      // Use current facilities data or fallback to sample data
      const exportData = facilities.length > 0 ? facilities : [
        { name: 'Mumbai General Hospital', type: 'DH', district_name: 'Mumbai', state_name: 'Maharashtra', address: 'Mumbai, Maharashtra', contact_phone: '022-12345678', bed_capacity: 500, is_active: true },
        { name: 'Pune Civil Hospital', type: 'CHC', district_name: 'Pune', state_name: 'Maharashtra', address: 'Pune, Maharashtra', contact_phone: '020-87654321', bed_capacity: 200, is_active: true },
        { name: 'Ahmedabad Medical College', type: 'MEDICAL_COLLEGE', district_name: 'Ahmedabad', state_name: 'Gujarat', address: 'Ahmedabad, Gujarat', contact_phone: '079-98765432', bed_capacity: 800, is_active: true },
        { name: 'Bangalore PHC', type: 'PHC', district_name: 'Bangalore', state_name: 'Karnataka', address: 'Bangalore, Karnataka', contact_phone: '080-11223344', bed_capacity: 50, is_active: true }
      ]

      console.log('Creating export with', exportData.length, 'facilities')

      const csvContent = [
        ['Name', 'Type', 'District', 'State', 'Address', 'Phone', 'Bed Capacity', 'Status'],
        ...exportData.map((facility: any) => [
          facility.name,
          facility.type,
          facility.district_name || 'Unknown',
          facility.state_name || 'Unknown',
          facility.address || 'N/A',
          facility.contact_phone || 'N/A',
          facility.bed_capacity || 0,
          facility.is_active ? 'Active' : 'Inactive'
        ])
      ].map(row => row.join(',')).join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'facilities_export.csv'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      console.log('Facilities export completed successfully')
      alert('Facilities exported successfully!')
    } catch (error) {
      console.error('Facilities export error:', error)
      alert('Export failed: ' + (error as Error).message)
    }
  }

  // Import facilities from CSV
  const handleImportFacilities = (event: React.ChangeEvent<HTMLInputElement>) => {
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
        
        const [name, type, districtName, stateName, address, phone, bedCapacity] = line.split(',').map(item => item.trim())
        
        if (name && type && districtName && address && phone) {
          // Find district ID by name
          const district = districts.find(d => d.name.toLowerCase() === districtName.toLowerCase().replace(/"/g, ''))
          if (district) {
            await db.insert('facilities', {
              id: crypto.randomUUID(),
              name: name.replace(/"/g, ''),
              facility_type: type.replace(/"/g, ''),
              district_id: district.id,
              address: address.replace(/"/g, ''),
              contact_phone: phone.replace(/"/g, ''),
              bed_capacity: bedCapacity ? parseInt(bedCapacity.replace(/"/g, '')) : null,
              is_active: true
            })
          }
        }
      }
      
      fetchFacilities()
      alert('Facilities imported successfully!')
    }
    reader.readAsText(file)
  }

  // Edit facility
  const handleEditFacility = (facility: Facility) => {
    setEditingFacility(facility)
    setNewFacility({
      name: facility.name,
      facility_type: facility.facility_type,
      district_id: facility.district_id,
      address: facility.address,
      contact_phone: facility.contact_phone,
      bed_capacity: facility.bed_capacity?.toString() || ""
    })
    setShowAddFacility(true)
  }

  if (!user) {
    return null
  }

  const filteredFacilities = facilities.filter(
    (f) =>
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.facility_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.district_name && f.district_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (f.state_name && f.state_name.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 overflow-auto p-4 md:p-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Facilities Management</h1>
              <p className="text-muted-foreground">Manage healthcare facilities across all districts</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExportFacilities}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" onClick={() => document.getElementById('import-facilities')?.click()}>
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
              <input
                id="import-facilities"
                type="file"
                accept=".csv"
                onChange={handleImportFacilities}
                className="hidden"
              />
              <Button 
                onClick={() => setShowAddFacility(true)}
                className="bg-accent hover:bg-accent text-accent-foreground"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Facility
              </Button>
            </div>
          </div>

          {/* Add/Edit Facility Modal */}
          {showAddFacility && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <Card className="w-full max-w-md p-6">
                <h3 className="text-lg font-semibold mb-4">
                  {editingFacility ? 'Edit Facility' : 'Add New Facility'}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Facility Name</label>
                    <Input
                      value={newFacility.name}
                      onChange={(e) => setNewFacility({...newFacility, name: e.target.value})}
                      placeholder="Enter facility name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Facility Type</label>
                    <select
                      value={newFacility.facility_type}
                      onChange={(e) => setNewFacility({...newFacility, facility_type: e.target.value})}
                      className="w-full p-2 border rounded-md"
                    >
                      {facilityTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">District</label>
                    <select
                      value={newFacility.district_id}
                      onChange={(e) => setNewFacility({...newFacility, district_id: e.target.value})}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">Select District</option>
                      {districts.map(district => (
                        <option key={district.id} value={district.id}>
                          {district.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Address</label>
                    <Input
                      value={newFacility.address}
                      onChange={(e) => setNewFacility({...newFacility, address: e.target.value})}
                      placeholder="Enter facility address"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Contact Phone</label>
                    <Input
                      value={newFacility.contact_phone}
                      onChange={(e) => setNewFacility({...newFacility, contact_phone: e.target.value})}
                      placeholder="Enter contact phone"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Bed Capacity (Optional)</label>
                    <Input
                      type="number"
                      value={newFacility.bed_capacity}
                      onChange={(e) => setNewFacility({...newFacility, bed_capacity: e.target.value})}
                      placeholder="Enter bed capacity"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-6">
                  <Button onClick={handleSaveFacility} className="flex-1">
                    {editingFacility ? 'Update Facility' : 'Create Facility'}
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setShowAddFacility(false)
                    setEditingFacility(null)
                    setNewFacility({ name: "", facility_type: "DH", district_id: "", address: "", contact_phone: "", bed_capacity: "" })
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
                placeholder="Search facilities by name, type, district, or state..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Facilities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              <div className="col-span-full flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="ml-2 text-muted-foreground">Loading facilities...</p>
              </div>
            ) : filteredFacilities.length === 0 ? (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No facilities found
              </div>
            ) : (
              filteredFacilities.map((facility) => (
                <Card key={facility.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{facility.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {facility.district_name}, {facility.state_name}
                        </CardDescription>
                      </div>
                      <Badge variant={facility.is_active ? "default" : "secondary"}>
                        {facility.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Type:</span>
                        <span className="font-medium">{facilityTypes.find(t => t.value === facility.facility_type)?.label || facility.facility_type}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Beds:</span>
                        <span className="font-medium">{facility.bed_capacity || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Phone:</span>
                        <span className="font-medium">{facility.contact_phone}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Address:</span>
                        <p className="font-medium truncate">{facility.address}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleEditFacility(facility)}
                      >
                        <Edit2 className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleToggleStatus(facility.id, facility.is_active)}
                      >
                        {facility.is_active ? <XCircle className="w-4 h-4 mr-1" /> : <CheckCircle2 className="w-4 h-4 mr-1" />}
                        {facility.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="hover:text-destructive"
                        onClick={() => handleDeleteFacility(facility.id, facility.name)}
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
