"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { DocumentBrowser } from "@/components/document-browser"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, FileText, Image } from "lucide-react"
import { db, storage, edgeFunctions } from "@/lib/hdims-supabase"

export default function DocumentsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({
    total: 0,
    pdfs: 0,
    images: 0
  })
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    fetchDocumentStats()
  }, [user, router, refreshKey])

  const fetchDocumentStats = async () => {
    try {
      const { data, error } = await db.select('uploads', {
        select: 'id, file_type, created_at',
        eq: user?.currentRole === 'admin' ? {} : { uploaded_by: user?.id }
      })

      if (error) {
        console.error('Error fetching document stats:', error)
        return
      }

      const total = data?.length || 0
      const pdfs = data?.filter(doc => doc.file_type === 'application/pdf').length || 0
      const images = data?.filter(doc => doc.file_type.startsWith('image/')).length || 0

      setStats({ total, pdfs, images })
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      // Create a simple file upload simulation
      const formData = new FormData()
      formData.append('file', file)
      formData.append('uploaded_by', user?.id || 'unknown')
      formData.append('facility_id', user?.facilityId || 'unknown')
      formData.append('category', 'General')

      // Simulate successful upload
      setTimeout(() => {
        alert(`Document "${file.name}" uploaded successfully!`)
        setRefreshKey(prev => prev + 1) // Refresh stats
      }, 1000)

      // For demo purposes, we'll just simulate the upload
      console.log('Uploading file:', file.name, 'Size:', file.size, 'Type:', file.type)

    } catch (error) {
      alert('Upload error: ' + (error as Error).message)
    }

    // Reset input
    event.target.value = ''
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 overflow-auto p-4 md:p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Document Library</h1>
            <p className="text-muted-foreground">Browse and manage all facility documents</p>
          </div>
          <div className="relative">
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileUpload}
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            />
            <Button asChild className="bg-accent hover:bg-accent text-accent-foreground">
              <label htmlFor="file-upload" className="cursor-pointer flex items-center">
                <Upload className="w-4 h-4 mr-2" />
                Upload Document
              </label>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Documents</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-red-500" />
                <div>
                  <p className="text-sm text-muted-foreground">PDFs</p>
                  <p className="text-2xl font-bold">{stats.pdfs}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Image className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Images</p>
                  <p className="text-2xl font-bold">{stats.images}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Document Browser */}
        <DocumentBrowser key={refreshKey} />
      </div>
    </div>
  )
}
