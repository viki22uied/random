// ============================================
// Real-time Updates for HDIMS
// ============================================

import { useEffect, useState } from 'react'
import { realtime, supabase } from '@/lib/hdims-supabase'
import { useAuth } from '@/lib/auth-context'

// Hook for real-time user updates
export const useRealtimeUsers = () => {
  const [users, setUsers] = useState<any[]>([])
  const { user } = useAuth()

  useEffect(() => {
    if (!user || user.currentRole !== 'admin') return

    // Subscribe to users table changes
    const subscription = realtime.subscribeToTable('users', (payload: any) => {
      console.log('Users table change:', payload)
      
      // Refresh users list
      fetchUsers()
    })

    // Initial fetch
    fetchUsers()

    return () => {
      realtime.unsubscribe(subscription)
    }
  }, [user])

  const fetchUsers = async () => {
    try {
      const { db } = await import('@/lib/hdims-supabase')
      const { data, error } = await db.select('users', {
        select: 'id, full_name, email, role, is_active, created_at',
        order: { column: 'created_at', ascending: false }
      })

      if (!error && data) {
        setUsers(data)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  return users
}

// Hook for real-time document uploads
export const useRealtimeDocuments = () => {
  const [documents, setDocuments] = useState<any[]>([])
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    // Subscribe to uploads table changes
    const subscription = realtime.subscribeToTable('uploads', (payload: any) => {
      console.log('Uploads table change:', payload)
      
      // Show notification for new uploads
      if (payload.eventType === 'INSERT' && payload.new) {
        const newDoc = payload.new
        if (user.currentRole === 'admin' || newDoc.uploaded_by === user.id) {
          // Show notification
          showNotification(`New document uploaded: ${newDoc.file_name}`)
        }
      }
      
      // Refresh documents list
      fetchDocuments()
    })

    // Initial fetch
    fetchDocuments()

    return () => {
      realtime.unsubscribe(subscription)
    }
  }, [user])

  const fetchDocuments = async () => {
    try {
      const { db } = await import('@/lib/hdims-supabase')
      const { data, error } = await db.select('uploads', {
        select: '*',
        order: { column: 'created_at', ascending: false },
        eq: user?.currentRole === 'admin' ? {} : { uploaded_by: user?.id }
      })

      if (!error && data) {
        setDocuments(data)
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
    }
  }

  return documents
}

// Hook for real-time performance data
export const useRealtimePerformanceData = () => {
  const [performanceData, setPerformanceData] = useState<any[]>([])
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    // Subscribe to performance_data table changes
    const subscription = realtime.subscribeToPerformanceData((payload: any) => {
      console.log('Performance data change:', payload)
      
      // Show notification for new submissions
      if (payload.eventType === 'INSERT' && payload.new) {
        const newData = payload.new
        if (user.currentRole === 'admin' || 
            (user.currentRole === 'district' && newData.district_id === user.districtId) ||
            (user.currentRole === 'state' && newData.state_id === user.stateId)) {
          showNotification(`New performance data submitted: ${newData.metric_key}`)
        }
      }
      
      // Refresh performance data
      fetchPerformanceData()
    })

    // Initial fetch
    fetchPerformanceData()

    return () => {
      realtime.unsubscribe(subscription)
    }
  }, [user])

  const fetchPerformanceData = async () => {
    try {
      const { db } = await import('@/lib/hdims-supabase')
      const { data, error } = await db.select('performance_data', {
        select: '*',
        order: { column: 'created_at', ascending: false },
        eq: user?.currentRole === 'admin' ? {} : 
            user?.currentRole === 'district' ? { district_id: user?.districtId } :
            user?.currentRole === 'state' ? { state_id: user?.stateId } :
            { facility_id: user?.facilityId }
      })

      if (!error && data) {
        setPerformanceData(data)
      }
    } catch (error) {
      console.error('Error fetching performance data:', error)
    }
  }

  return performanceData
}

// Hook for real-time scheme data
export const useRealtimeSchemeData = () => {
  const [schemeData, setSchemeData] = useState<any[]>([])
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    // Subscribe to scheme_tracking table changes
    const subscription = realtime.subscribeToSchemeData((payload: any) => {
      console.log('Scheme data change:', payload)
      
      // Show notification for new submissions
      if (payload.eventType === 'INSERT' && payload.new) {
        const newData = payload.new
        if (user.currentRole === 'admin' || 
            (user.currentRole === 'district' && newData.district_id === user.districtId) ||
            (user.currentRole === 'state' && newData.state_id === user.stateId)) {
          showNotification(`New scheme data submitted: ${newData.scheme_name}`)
        }
      }
      
      // Refresh scheme data
      fetchSchemeData()
    })

    // Initial fetch
    fetchSchemeData()

    return () => {
      realtime.unsubscribe(subscription)
    }
  }, [user])

  const fetchSchemeData = async () => {
    try {
      const { db } = await import('@/lib/hdims-supabase')
      const { data, error } = await db.select('scheme_tracking', {
        select: '*',
        order: { column: 'created_at', ascending: false },
        eq: user?.currentRole === 'admin' ? {} : 
            user?.currentRole === 'district' ? { district_id: user?.districtId } :
            user?.currentRole === 'state' ? { state_id: user?.stateId } :
            { facility_id: user?.facilityId }
      })

      if (!error && data) {
        setSchemeData(data)
      }
    } catch (error) {
      console.error('Error fetching scheme data:', error)
    }
  }

  return schemeData
}

// Hook for real-time audit logs
export const useRealtimeAuditLogs = () => {
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const { user } = useAuth()

  useEffect(() => {
    if (!user || user.currentRole !== 'admin') return

    // Subscribe to audit_logs table changes
    const subscription = realtime.subscribeToTable('audit_logs', (payload: any) => {
      console.log('Audit logs change:', payload)
      
      // Refresh audit logs
      fetchAuditLogs()
    })

    // Initial fetch
    fetchAuditLogs()

    return () => {
      realtime.unsubscribe(subscription)
    }
  }, [user])

  const fetchAuditLogs = async () => {
    try {
      const { db } = await import('@/lib/hdims-supabase')
      const { data, error } = await db.select('audit_logs', {
        select: '*',
        order: { column: 'created_at', ascending: false }
      })

      if (!error && data) {
        setAuditLogs(data)
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error)
    }
  }

  return auditLogs
}

// Simple notification system
const showNotification = (message: string) => {
  // Create a simple notification
  const notification = document.createElement('div')
  notification.className = 'fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse'
  notification.textContent = message
  document.body.appendChild(notification)
  
  // Remove after 3 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification)
    }
  }, 3000)
}

// Hook for real-time dashboard stats
export const useRealtimeDashboardStats = () => {
  const [stats, setStats] = useState({
    users: 0,
    facilities: 0,
    pendingReviews: 0,
    recentActivity: 0
  })
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    // Subscribe to multiple tables
    const subscriptions: any[] = []

    // Users table
    const usersSub = realtime.subscribeToTable('users', () => {
      updateStats()
    })
    subscriptions.push(usersSub)

    // Performance data table
    const performanceSub = realtime.subscribeToPerformanceData(() => {
      updateStats()
    })
    subscriptions.push(performanceSub)

    // Scheme data table
    const schemeSub = realtime.subscribeToSchemeData(() => {
      updateStats()
    })
    subscriptions.push(schemeSub)

    // Initial fetch
    updateStats()

    return () => {
      subscriptions.forEach((sub: any) => realtime.unsubscribe(sub))
    }
  }, [user])

  const updateStats = async () => {
    try {
      const { db } = await import('@/lib/hdims-supabase')
      
      // Get users count
      const { data: users } = await db.select('users', { select: 'id' })
      
      // Get facilities count
      const { data: facilities } = await db.select('facilities', { select: 'id' })
      
      // Get pending reviews
      const { data: pending } = await db.select('performance_data', { 
        select: 'id',
        eq: { status: 'submitted' }
      })
      
      // Get recent activity (last 24 hours)
      const { data: recent } = await db.select('performance_data', {
        select: 'id',
        eq: {
          created_at: `gte.${new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()}`
        }
      })

      setStats({
        users: users?.length || 0,
        facilities: facilities?.length || 0,
        pendingReviews: pending?.length || 0,
        recentActivity: recent?.length || 0
      })
    } catch (error) {
      console.error('Error updating stats:', error)
    }
  }

  return stats
}
