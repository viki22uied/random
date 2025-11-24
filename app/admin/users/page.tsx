"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Search, Edit2, Trash2, CheckCircle2, XCircle, UserPlus } from "lucide-react"
import { supabase, supabaseAdmin, db } from "@/lib/hdims-supabase"

interface User {
  id: string
  name: string
  email: string
  role: string
  facility: string
  status: "active" | "inactive"
  lastLogin: string
}

export default function UsersPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [showAddUser, setShowAddUser] = useState(false)
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "hospital_user",
    password: ""
  })

  // Fetch real users from database
  const fetchUsers = async () => {
    try {
      setLoading(true)
      const { data, error } = await db.select('users', {
        select: 'id, full_name, email, role, facility_id, district_id, state_id, is_active, created_at',
        order: { column: 'created_at', ascending: false }
      })

      if (error || !data) {
        console.error('Error fetching users:', error)
        return
      }

      // Transform data for frontend with proper typing
      const transformedUsers: User[] = data.map((user: any) => ({
        id: user.id,
        name: user.full_name,
        email: user.email,
        role: user.role.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
        facility: user.facility_id || 'Not Assigned',
        status: user.is_active ? 'active' : 'inactive',
        lastLogin: new Date(user.created_at).toLocaleDateString()
      }))

      setUsers(transformedUsers)
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

    fetchUsers()
  }, [user, router])

  // Add new user
  const handleAddUser = async () => {
    try {
      if (!newUser.name || !newUser.email || !newUser.password) {
        alert('Please fill in all fields')
        return
      }

      // Simple direct database insert (bypassing Supabase auth)
      const { error } = await db.insert('users', {
        id: crypto.randomUUID(),
        full_name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        is_active: true
      })

      if (error) {
        alert('Error adding user: ' + error.message)
        return
      }

      // Reset form and refresh
      setNewUser({ name: "", email: "", role: "hospital_user", password: "" })
      setShowAddUser(false)
      fetchUsers()
      alert('User created successfully!')

    } catch (error) {
      alert('Error: ' + (error as Error).message)
    }
  }

  // Delete user
  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (!confirm(`Are you sure you want to delete user ${userEmail}?`)) {
      return
    }

    try {
      // Delete from users table
      const { error: userError } = await db.delete('users', {
        eq: { id: userId }
      })

      if (userError) {
        alert('Error deleting user: ' + userError.message)
        return
      }

      // Delete from auth (using our admin client)
      const { error: authError } = await supabaseAdmin.deleteUser(userId)
      
      if (authError) {
        console.warn('Auth user deletion failed:', authError.message)
        // Still continue since database user is deleted
      }

      fetchUsers()
      alert('User deleted successfully!')

    } catch (error) {
      alert('Error: ' + (error as Error).message)
    }
  }

  // Toggle user status
  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await db.update('users', 
        { is_active: !currentStatus, updated_at: new Date().toISOString() },
        { eq: { id: userId } }
      )

      if (error) {
        alert('Error updating user status: ' + error.message)
        return
      }

      fetchUsers()
      alert(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully!`)

    } catch (error) {
      alert('Error: ' + (error as Error).message)
    }
  }

  if (!user) {
    return null
  }

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 overflow-auto p-4 md:p-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">User Management</h1>
              <p className="text-muted-foreground">Manage system users and permissions</p>
            </div>
            <Button 
              onClick={() => setShowAddUser(true)}
              className="bg-accent hover:bg-accent text-accent-foreground"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </div>

          {/* Add User Modal */}
          {showAddUser && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <Card className="w-full max-w-md p-6">
                <h3 className="text-lg font-semibold mb-4">Add New User</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Full Name</label>
                    <Input
                      value={newUser.name}
                      onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                      placeholder="Enter full name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <Input
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                      placeholder="Enter email"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Role</label>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="hospital_user">Hospital User</option>
                      <option value="district_admin">District Admin</option>
                      <option value="state_admin">State Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Password</label>
                    <Input
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                      placeholder="Enter password"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-6">
                  <Button onClick={handleAddUser} className="flex-1">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Create User
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddUser(false)} className="flex-1">
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
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Users Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-secondary/30">
                      <th className="text-left p-4 font-semibold text-sm">Name</th>
                      <th className="text-left p-4 font-semibold text-sm">Email</th>
                      <th className="text-left p-4 font-semibold text-sm">Role</th>
                      <th className="text-left p-4 font-semibold text-sm">Facility</th>
                      <th className="text-center p-4 font-semibold text-sm">Status</th>
                      <th className="text-left p-4 font-semibold text-sm">Last Login</th>
                      <th className="text-center p-4 font-semibold text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                          <p className="mt-2 text-muted-foreground">Loading users...</p>
                        </td>
                      </tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-muted-foreground">
                          No users found
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => (
                        <tr key={u.id} className="border-b border-border hover:bg-secondary/20 transition-colors">
                          <td className="p-4 font-medium">{u.name}</td>
                          <td className="p-4 text-sm text-muted-foreground">{u.email}</td>
                          <td className="p-4 text-sm">
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                              {u.role}
                            </span>
                          </td>
                          <td className="p-4 text-sm">{u.facility}</td>
                          <td className="p-4 text-center">
                            {u.status === "active" ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                                <CheckCircle2 className="w-3 h-3" />
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-500/10 text-gray-700 dark:text-gray-400">
                                <XCircle className="w-3 h-3" />
                                Inactive
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-sm text-muted-foreground">{u.lastLogin}</td>
                          <td className="p-4 text-center">
                            <div className="flex gap-2 justify-center">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={() => handleToggleStatus(u.id, u.status === 'active')}
                              >
                                {u.status === 'active' ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 hover:text-destructive"
                                onClick={() => handleDeleteUser(u.id, u.email)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
