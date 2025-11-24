// ============================================
// Export Utilities for HDIMS
// ============================================

// Export to PDF
export const exportToPDF = async (data: any[], filename: string = 'export.pdf') => {
  try {
    // For PDF export, we'll create a simple text-based report for now
    // In a production environment, you'd use libraries like jsPDF or Puppeteer
    
    let content = `${filename}\n${'='.repeat(50)}\n\n`
    content += `Generated: ${new Date().toLocaleString()}\n`
    content += `Total Records: ${data.length}\n\n`
    
    data.forEach((item, index) => {
      content += `${index + 1}. ${JSON.stringify(item, null, 2)}\n\n`
    })
    
    // Create blob and download
    const blob = new Blob([content], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename.replace('.pdf', '.txt') // For now, save as text
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    return { success: true }
  } catch (error) {
    console.error('PDF export error:', error)
    return { success: false, error: (error as Error).message }
  }
}

// Export to Excel/CSV
export const exportToExcel = async (data: any[], filename: string = 'export.csv') => {
  try {
    if (!data || data.length === 0) {
      throw new Error('No data to export')
    }
    
    // Get headers from first object
    const headers = Object.keys(data[0])
    
    // Create CSV content
    let csvContent = headers.join(',') + '\n'
    
    data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header]
        // Handle commas and quotes in values
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value || ''
      })
      csvContent += values.join(',') + '\n'
    })
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    return { success: true }
  } catch (error) {
    console.error('Excel export error:', error)
    return { success: false, error: (error as Error).message }
  }
}

// Export performance data
export const exportPerformanceData = async (filters: any = {}) => {
  try {
    const { db } = await import('@/lib/hdims-supabase')
    
    // Fetch performance data
    const { data, error } = await db.select('performance_data', {
      select: '*',
      eq: filters,
      order: { column: 'created_at', ascending: false }
    })
    
    if (error) {
      throw error
    }
    
    // Transform data for export
    const exportData = data?.map((item: any) => ({
      'Facility ID': item.facility_id,
      'Metric Key': item.metric_key,
      'Metric Value': item.metric_value,
      'Reporting Period': item.reporting_period,
      'Status': item.status,
      'Created At': new Date(item.created_at).toLocaleString(),
      'Updated At': new Date(item.updated_at).toLocaleString()
    }))
    
    return exportData
  } catch (error) {
    console.error('Error fetching performance data:', error)
    throw error
  }
}

// Export scheme data
export const exportSchemeData = async (filters: any = {}) => {
  try {
    const { db } = await import('@/lib/hdims-supabase')
    
    // Fetch scheme data
    const { data, error } = await db.select('scheme_tracking', {
      select: '*',
      eq: filters,
      order: { column: 'created_at', ascending: false }
    })
    
    if (error) {
      throw error
    }
    
    // Transform data for export
    const exportData = data?.map((item: any) => ({
      'Facility ID': item.facility_id,
      'Scheme Name': item.scheme_name,
      'Scheme Type': item.scheme_type,
      'Implementation Status': item.implementation_status,
      'Beneficiaries Count': item.beneficiaries_count,
      'Funding Amount': item.funding_amount,
      'Reporting Period': item.reporting_period,
      'Status': item.status,
      'Created At': new Date(item.created_at).toLocaleString(),
      'Updated At': new Date(item.updated_at).toLocaleString()
    }))
    
    return exportData
  } catch (error) {
    console.error('Error fetching scheme data:', error)
    throw error
  }
}

// Export user data (admin only)
export const exportUserData = async () => {
  try {
    const { db } = await import('@/lib/hdims-supabase')
    
    // Fetch user data
    const { data, error } = await db.select('users', {
      select: 'id, full_name, email, role, facility_id, district_id, state_id, is_active, created_at',
      order: { column: 'created_at', ascending: false }
    })
    
    if (error) {
      throw error
    }
    
    // Transform data for export
    const exportData = (data || []).map((item: any) => ({
      'User ID': item.id,
      'Full Name': item.full_name,
      'Email': item.email,
      'Role': item.role,
      'Facility ID': item.facility_id || 'N/A',
      'District ID': item.district_id || 'N/A',
      'State ID': item.state_id || 'N/A',
      'Active': item.is_active ? 'Yes' : 'No',
      'Created At': new Date(item.created_at).toLocaleString()
    }))
    
    return exportData
  } catch (error) {
    console.error('Error fetching user data:', error)
    throw error
  }
}

// Export audit logs (admin only)
export const exportAuditLogs = async (filters: any = {}) => {
  try {
    const { db } = await import('@/lib/hdims-supabase')
    
    // Fetch audit logs
    const { data, error } = await db.select('audit_logs', {
      select: '*',
      eq: filters,
      order: { column: 'created_at', ascending: false }
    })
    
    if (error) {
      throw error
    }
    
    // Transform data for export
    const exportData = (data || []).map((item: any) => ({
      'Action': item.action,
      'Table Name': item.table_name,
      'Record ID': item.record_id,
      'User ID': item.user_id,
      'Old Values': JSON.stringify(item.old_values || {}),
      'New Values': JSON.stringify(item.new_values || {}),
      'IP Address': item.ip_address || 'N/A',
      'User Agent': item.user_agent || 'N/A',
      'Created At': new Date(item.created_at).toLocaleString()
    }))
    
    return exportData
  } catch (error) {
    console.error('Error fetching audit logs:', error)
    throw error
  }
}
