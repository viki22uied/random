// Mock data for various components

export interface UploadFile {
  id: string
  name: string
  type: 'pdf' | 'image' | 'excel' | 'word' | 'zip'
  size: string
  sizeBytes: number
  date: string
  uploadTime: string
  status: 'Active' | 'Processing' | 'Archived'
  category: 'performance' | 'scheme' | 'infrastructure' | 'training' | 'monthly_report' | 'other'
  description?: string
  uploadedBy?: string
}

export const mockUploads: UploadFile[] = [
  // Latest uploads first
  {
    id: '1',
    name: 'Performance_Report_Week52_Dec2024.pdf',
    type: 'pdf',
    size: '2.4 MB',
    sizeBytes: 2516582,
    date: '2024-12-24',
    uploadTime: '10:30 AM',
    status: 'Active',
    category: 'performance',
    description: 'Weekly performance metrics for December 2024',
    uploadedBy: 'Dr. Rajesh Kumar'
  },
  {
    id: '2',
    name: 'PM_JAY_Beneficiary_List_Dec2024.xlsx',
    type: 'excel',
    size: '1.2 MB',
    sizeBytes: 1258291,
    date: '2024-12-23',
    uploadTime: '3:45 PM',
    status: 'Active',
    category: 'scheme',
    description: 'PM-JAY scheme beneficiary details for December',
    uploadedBy: 'Dr. Priya Sharma'
  },
  {
    id: '3',
    name: 'Facility_Infrastructure_Photos_Dec2024.zip',
    type: 'zip',
    size: '8.7 MB',
    sizeBytes: 9123840,
    date: '2024-12-22',
    uploadTime: '11:20 AM',
    status: 'Active',
    category: 'infrastructure',
    description: 'Hospital building and equipment photos',
    uploadedBy: 'Dr. Vijay Kumar'
  },
  {
    id: '4',
    name: 'Staff_Training_Certificate_Dec2024.pdf',
    type: 'pdf',
    size: '856 KB',
    sizeBytes: 876544,
    date: '2024-12-21',
    uploadTime: '2:15 PM',
    status: 'Active',
    category: 'training',
    description: 'Training completion certificates',
    uploadedBy: 'Dr. Amit Singh'
  },
  {
    id: '5',
    name: 'Monthly_Health_Report_November2024.docx',
    type: 'word',
    size: '3.1 MB',
    sizeBytes: 3251847,
    date: '2024-12-20',
    uploadTime: '9:30 AM',
    status: 'Active',
    category: 'monthly_report',
    description: 'November monthly health report',
    uploadedBy: 'Dr. Rajesh Kumar'
  },
  {
    id: '6',
    name: 'Emergency_Cases_Statistics_Dec2024.pdf',
    type: 'pdf',
    size: '1.5 MB',
    sizeBytes: 1572864,
    date: '2024-12-19',
    uploadTime: '4:45 PM',
    status: 'Processing',
    category: 'performance',
    description: 'Emergency department statistics',
    uploadedBy: 'Dr. Priya Sharma'
  },
  {
    id: '7',
    name: 'Vaccination_Drive_Photos_Dec2024.jpg',
    type: 'image',
    size: '4.2 MB',
    sizeBytes: 4404019,
    date: '2024-12-18',
    uploadTime: '1:30 PM',
    status: 'Active',
    category: 'infrastructure',
    description: 'Vaccination drive documentation photos',
    uploadedBy: 'Dr. Vijay Kumar'
  },
  {
    id: '8',
    name: 'OPD_Data_Analysis_Week51.pdf',
    type: 'pdf',
    size: '2.8 MB',
    sizeBytes: 2936013,
    date: '2024-12-17',
    uploadTime: '10:15 AM',
    status: 'Active',
    category: 'performance',
    description: 'OPD patient data analysis',
    uploadedBy: 'Dr. Amit Singh'
  },
  {
    id: '9',
    name: 'Maternal_Health_Program_Report.pdf',
    type: 'pdf',
    size: '1.9 MB',
    sizeBytes: 1992294,
    date: '2024-12-15',
    uploadTime: '3:30 PM',
    status: 'Archived',
    category: 'scheme',
    description: 'Maternal health program implementation report',
    uploadedBy: 'Dr. Rajesh Kumar'
  },
  {
    id: '10',
    name: 'Hospital_Annual_Report_2024.pdf',
    type: 'pdf',
    size: '12.4 MB',
    sizeBytes: 13002342,
    date: '2024-12-10',
    uploadTime: '11:45 AM',
    status: 'Active',
    category: 'monthly_report',
    description: 'Complete annual report for 2024',
    uploadedBy: 'Dr. Priya Sharma'
  },
  {
    id: '11',
    name: 'Equipment_Maintenance_Records.xlsx',
    type: 'excel',
    size: '890 KB',
    sizeBytes: 912384,
    date: '2024-12-08',
    uploadTime: '2:20 PM',
    status: 'Active',
    category: 'infrastructure',
    description: 'Medical equipment maintenance logs',
    uploadedBy: 'Dr. Vijay Kumar'
  },
  {
    id: '12',
    name: 'Staff_Skill_Assessment_Dec2024.pdf',
    type: 'pdf',
    size: '1.1 MB',
    sizeBytes: 1153434,
    date: '2024-12-05',
    uploadTime: '9:00 AM',
    status: 'Active',
    category: 'training',
    description: 'Staff skill assessment results',
    uploadedBy: 'Dr. Amit Singh'
  }
]

// Helper functions for mock data
export const getLatestUploads = (limit: number = 5): UploadFile[] => {
  return mockUploads.slice(0, limit)
}

export const getUploadsByCategory = (category: UploadFile['category']): UploadFile[] => {
  return mockUploads.filter(upload => upload.category === category)
}

export const getUploadsByType = (type: UploadFile['type']): UploadFile[] => {
  return mockUploads.filter(upload => upload.type === type)
}

export const getRecentUploads = (days: number = 7): UploadFile[] => {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)
  
  return mockUploads.filter(upload => {
    const uploadDate = new Date(upload.date)
    return uploadDate >= cutoffDate
  })
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const getFileIcon = (type: UploadFile['type']) => {
  switch (type) {
    case 'pdf':
      return { icon: '📄', color: 'text-red-500' }
    case 'image':
      return { icon: '🖼️', color: 'text-blue-500' }
    case 'excel':
      return { icon: '📊', color: 'text-green-500' }
    case 'word':
      return { icon: '📝', color: 'text-blue-600' }
    case 'zip':
      return { icon: '📦', color: 'text-yellow-600' }
    default:
      return { icon: '📄', color: 'text-gray-500' }
  }
}
