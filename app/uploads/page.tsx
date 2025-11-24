"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileIcon, ImageIcon, Download, Trash2, Upload, Filter, Clock, TrendingUp } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import { mockUploads, getLatestUploads, getRecentUploads, formatFileSize, getFileIcon, type UploadFile } from "@/lib/mock-data"

export default function UploadsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [uploads, setUploads] = useState<UploadFile[]>(mockUploads)
  const [filter, setFilter] = useState<'all' | 'recent' | 'latest'>('all')
  const [showLatestOnly, setShowLatestOnly] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push("/login")
    }
  }, [user, router])

  const handleFilterChange = (newFilter: 'all' | 'recent' | 'latest') => {
    setFilter(newFilter)
    if (newFilter === 'latest') {
      setUploads(getLatestUploads(5))
    } else if (newFilter === 'recent') {
      setUploads(getRecentUploads(7))
    } else {
      setUploads(mockUploads)
    }
  }

  const handleDownloadFile = (upload: UploadFile) => {
    // Create mock file content based on file type
    let content = ''
    let mimeType = ''
    let fileName = upload.name

    if (upload.type === 'pdf') {
      content = `PDF File: ${upload.name}\n\nDescription: ${upload.description || 'No description'}\nCategory: ${upload.category}\nUploaded: ${upload.date} at ${upload.uploadTime}\nStatus: ${upload.status}\n\nThis is a sample PDF content for demonstration purposes.`
      mimeType = 'application/pdf'
    } else if (upload.type === 'excel') {
      content = `Excel File: ${upload.name}\n\nDate,Value,Category\n2024-01,100,${upload.category}\n2024-02,150,${upload.category}\n2024-03,200,${upload.category}`
      mimeType = 'application/vnd.ms-excel'
      fileName = upload.name.replace('.xlsx', '.csv')
    } else if (upload.type === 'image') {
      // For images, we'll create a simple text file with metadata
      content = `Image File: ${upload.name}\n\nDescription: ${upload.description || 'No description'}\nCategory: ${upload.category}\nUploaded: ${upload.date} at ${upload.uploadTime}\nStatus: ${upload.status}\n\nThis is a placeholder for the image file.`
      mimeType = 'text/plain'
      fileName = upload.name.replace(/\.(jpg|jpeg|png)$/i, '.txt')
    } else {
      content = `File: ${upload.name}\n\nDescription: ${upload.description || 'No description'}\nCategory: ${upload.category}\nUploaded: ${upload.date} at ${upload.uploadTime}\nStatus: ${upload.status}\n\nFile content placeholder.`
      mimeType = 'text/plain'
    }

    // Create blob and download
    const blob = new Blob([content], { type: mimeType })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const handleDeleteFile = (upload: UploadFile) => {
    if (confirm(`Are you sure you want to delete "${upload.name}"?`)) {
      alert(`File "${upload.name}" deleted successfully!`)
      // Remove from the list
      setUploads(prev => prev.filter(u => u.id !== upload.id))
    }
  }

  const handleUploadNew = () => {
    // Create a file input element
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.pdf,.xlsx,.jpg,.jpeg,.png,.doc,.docx'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        // Add the file to the uploads list
        const newUpload: UploadFile = {
          id: Date.now().toString(),
          name: file.name,
          type: file.type.includes('pdf') ? 'pdf' : file.type.includes('sheet') ? 'excel' : file.type.includes('image') ? 'image' : 'word',
          size: formatFileSize(file.size),
          sizeBytes: file.size,
          date: new Date().toLocaleDateString(),
          uploadTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          category: 'other',
          status: 'Active',
          uploadedBy: user?.name || 'Current User',
          description: 'Newly uploaded file'
        }
        setUploads(prev => [newUpload, ...prev])
        alert(`File "${file.name}" uploaded successfully!`)
      }
    }
    input.click()
  }

  const getCategoryBadge = (category: UploadFile['category']) => {
    const colors = {
      performance: 'bg-blue-100 text-blue-800',
      scheme: 'bg-green-100 text-green-800',
      infrastructure: 'bg-orange-100 text-orange-800',
      training: 'bg-purple-100 text-purple-800',
      monthly_report: 'bg-red-100 text-red-800',
      other: 'bg-gray-100 text-gray-800'
    }
    
    return (
      <Badge className={`text-xs ${colors[category]}`}>
        {category.replace('_', ' ').toUpperCase()}
      </Badge>
    )
  }

  const getStatusBadge = (status: UploadFile['status']) => {
    const variants = {
      Active: 'default',
      Processing: 'secondary',
      Archived: 'outline'
    } as const
    
    return (
      <Badge variant={variants[status]} className="text-xs">
        {status}
      </Badge>
    )
  }

  const latestUploads = getLatestUploads(3)
  const recentUploads = getRecentUploads(7)

  return (
    <ProtectedRoute allowedRoles={["hospital"]}>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">My Uploads</h1>
            <p className="text-muted-foreground">Manage your uploaded documents and files</p>
          </div>

          {/* Latest Updates Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <h2 className="text-xl font-semibold">Latest Updates</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-green-200 bg-green-50/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Recent Uploads (7 days)</span>
                  </div>
                  <p className="text-2xl font-bold text-green-900">{recentUploads.length}</p>
                  <p className="text-xs text-green-700">Files uploaded this week</p>
                </CardContent>
              </Card>
              <Card className="border-blue-200 bg-blue-50/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Upload className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Total Files</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-900">{mockUploads.length}</p>
                  <p className="text-xs text-blue-700">All uploaded documents</p>
                </CardContent>
              </Card>
              <Card className="border-purple-200 bg-purple-50/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Filter className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-800">Categories</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-900">6</p>
                  <p className="text-xs text-purple-700">Different file categories</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Latest 3 Uploads Preview */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-600" />
                  Latest 3 Uploads
                </h3>
                <p className="text-sm text-muted-foreground">Most recently uploaded files</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleFilterChange('latest')}
                className={filter === 'latest' ? 'bg-accent' : ''}
              >
                View All Latest
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {latestUploads.map((upload) => {
                const fileIcon = getFileIcon(upload.type)
                return (
                  <Card key={upload.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`text-2xl ${fileIcon.color}`}>
                          {fileIcon.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{upload.name}</p>
                          <p className="text-xs text-muted-foreground mb-2">
                            {upload.size} • {upload.date} at {upload.uploadTime}
                          </p>
                          <div className="flex gap-1 mb-2">
                            {getCategoryBadge(upload.category)}
                            {getStatusBadge(upload.status)}
                          </div>
                          {upload.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {upload.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Main Uploads Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Document Library</CardTitle>
                  <CardDescription>{uploads.length} files total</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="flex gap-1 bg-muted rounded-lg p-1">
                    <Button
                      variant={filter === 'all' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => handleFilterChange('all')}
                      className="text-xs"
                    >
                      All
                    </Button>
                    <Button
                      variant={filter === 'recent' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => handleFilterChange('recent')}
                      className="text-xs"
                    >
                      Recent (7 days)
                    </Button>
                    <Button
                      variant={filter === 'latest' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => handleFilterChange('latest')}
                      className="text-xs"
                    >
                      Latest (5)
                    </Button>
                  </div>
                  <Button 
                    className="bg-accent hover:bg-accent text-accent-foreground"
                    onClick={handleUploadNew}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload New
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {uploads.map((upload) => {
                  const fileIcon = getFileIcon(upload.type)
                  return (
                    <div
                      key={upload.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-secondary/30 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`text-2xl ${fileIcon.color}`}>
                          {fileIcon.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium truncate">{upload.name}</p>
                            {upload.date === mockUploads[0].date && (
                              <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                NEW
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <p className="text-sm text-muted-foreground">
                              {upload.size} • {upload.date} at {upload.uploadTime}
                            </p>
                            {upload.uploadedBy && (
                              <p className="text-xs text-muted-foreground">
                                by {upload.uploadedBy}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-1">
                            {getCategoryBadge(upload.category)}
                            {getStatusBadge(upload.status)}
                          </div>
                          {upload.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                              {upload.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownloadFile(upload)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="hover:text-destructive bg-transparent"
                          onClick={() => handleDeleteFile(upload)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
