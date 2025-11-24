"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { FileIcon, ImageIcon, Download, Trash2, Eye, MoreVertical, Folder, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { db, storage } from "@/lib/hdims-supabase"

interface Document {
  id: string
  name: string
  type: "pdf" | "image" | "document"
  size: string
  date: string
  category: string
  uploadedBy: string
  fileUrl?: string
}

interface DocumentBrowserProps {
  documents?: Document[]
}

export function DocumentBrowser({ documents = [] }: DocumentBrowserProps) {
  const { user } = useAuth()
  const [view, setView] = useState<"grid" | "list">("list")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [realDocuments, setRealDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch real documents from database
  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const { data, error } = await db.select('uploads', {
        select: 'id, file_name, file_type, file_size, category, created_at, uploaded_by, file_path',
        order: { column: 'created_at', ascending: false },
        eq: user?.currentRole === 'admin' ? {} : { uploaded_by: user?.id }
      })

      if (error) {
        console.error('Error fetching documents:', error)
        return
      }

      // Transform data for frontend
      const transformedDocs: Document[] = data?.map((doc: any) => ({
        id: doc.id,
        name: doc.file_name,
        type: doc.file_type === 'application/pdf' ? 'pdf' : 
              doc.file_type.startsWith('image/') ? 'image' : 'document',
        size: formatFileSize(doc.file_size),
        date: new Date(doc.created_at).toLocaleDateString(),
        category: doc.category || 'General',
        uploadedBy: doc.uploaded_by,
        fileUrl: doc.file_path
      })) || []

      setRealDocuments(transformedDocs)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const handleDownload = async (document: Document) => {
    try {
      // Create mock file content for download
      let content = ''
      let mimeType = 'text/plain'
      let fileName = document.name

      if (document.type === 'pdf') {
        content = `PDF Document: ${document.name}\n\nDescription: ${(document as any).description || 'No description'}\nCategory: ${document.category}\nUploaded: ${(document as any).uploadDate}\nSize: ${document.size}\n\nThis is a sample PDF content for demonstration purposes.`
        mimeType = 'application/pdf'
      } else if (document.type && document.type.includes('image')) {
        content = `Image File: ${document.name}\n\nDescription: ${(document as any).description || 'No description'}\nCategory: ${document.category}\nUploaded: ${(document as any).uploadDate}\nSize: ${document.size}\n\nThis is a placeholder for the image file.`
        mimeType = 'text/plain'
        fileName = document.name.replace(/\.(jpg|jpeg|png)$/i, '.txt')
      } else {
        content = `Document: ${document.name}\n\nDescription: ${(document as any).description || 'No description'}\nCategory: ${document.category}\nUploaded: ${(document as any).uploadDate}\nSize: ${document.size}\n\nDocument content placeholder.`
        mimeType = 'text/plain'
      }

      // Create blob and download
      const blob = new Blob([content], { type: mimeType })
      const url = window.URL.createObjectURL(blob)
      const a = window.document.createElement('a')
      a.href = url
      a.download = fileName
      window.document.body.appendChild(a)
      a.click()
      window.document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      console.log(`Document "${document.name}" downloaded successfully!`)
    } catch (error) {
      console.error('Download error:', error)
      alert('Download error: ' + (error as Error).message)
    }
  }

  const handleDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return
    }

    try {
      // Delete from database
      const { error } = await db.delete('uploads', {
        eq: { id: documentId }
      })

      if (error) {
        alert('Error deleting document: ' + error.message)
        return
      }

      // Delete from storage (optional, you might want to keep files)
      alert('Document deleted successfully!')
      fetchDocuments() // Refresh list
    } catch (error) {
      alert('Delete error: ' + (error as Error).message)
    }
  }

  const docs = documents.length > 0 ? documents : realDocuments
  const categories = ["all", ...new Set(docs.map((d) => d.category))]

  const filteredDocs = docs.filter(
    (doc) =>
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedCategory === "all" || doc.category === selectedCategory),
  )

  if (loading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading documents...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={selectedCategory === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory("all")}
          >
            <Filter className="w-4 h-4 mr-2" />
            All
          </Button>
          {categories.slice(1).map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Document List */}
      <Card>
        <CardContent className="p-0">
          {filteredDocs.length === 0 ? (
            <div className="p-12 text-center">
              <Folder className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-lg font-semibold mb-1">No documents found</p>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary/30">
                    <th className="text-left p-4 font-semibold text-sm">Name</th>
                    <th className="text-left p-4 font-semibold text-sm">Category</th>
                    <th className="text-left p-4 font-semibold text-sm">Uploaded By</th>
                    <th className="text-left p-4 font-semibold text-sm">Date</th>
                    <th className="text-left p-4 font-semibold text-sm">Size</th>
                    <th className="text-center p-4 font-semibold text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocs.map((doc) => (
                    <tr key={doc.id} className="border-b border-border hover:bg-secondary/20 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {doc.type === "pdf" ? (
                            <FileIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
                          ) : doc.type === "image" ? (
                            <ImageIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />
                          ) : (
                            <FileIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
                          )}
                          <span className="font-medium truncate">{doc.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                          {doc.category}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">{doc.uploadedBy}</td>
                      <td className="p-4 text-sm text-muted-foreground">{doc.date}</td>
                      <td className="p-4 text-sm text-muted-foreground">{doc.size}</td>
                      <td className="p-4 text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleDownload(doc)}>
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDelete(doc.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
