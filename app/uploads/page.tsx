"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileIcon, ImageIcon, Download, Trash2 } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"

export default function UploadsPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/login")
    }
  }, [user, router])

  const uploads = [
    {
      name: "Performance_Report_Week52.pdf",
      type: "pdf",
      size: "2.4 MB",
      date: "2024-12-15",
      status: "Active",
    },
    {
      name: "Facility_Photo_Dec2024.jpg",
      type: "image",
      size: "1.8 MB",
      date: "2024-12-14",
      status: "Active",
    },
    {
      name: "Scheme_Implementation_Report.pdf",
      type: "pdf",
      size: "3.1 MB",
      date: "2024-12-10",
      status: "Active",
    },
    {
      name: "Staff_Training_Documentation.png",
      type: "image",
      size: "4.2 MB",
      date: "2024-12-05",
      status: "Active",
    },
  ]

  if (!user) {
    return null
  }

  return (
    <ProtectedRoute allowedRoles={["hospital"]}>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">My Uploads</h1>
            <p className="text-muted-foreground">Manage your uploaded documents and files</p>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Document Library</CardTitle>
                  <CardDescription>{uploads.length} files total</CardDescription>
                </div>
                <Button className="bg-accent hover:bg-accent text-accent-foreground">Upload New</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {uploads.map((upload, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-secondary/30 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      {upload.type === "pdf" ? (
                        <FileIcon className="w-8 h-8 text-red-500 flex-shrink-0" />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-blue-500 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{upload.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {upload.size} • {upload.date}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="hover:text-destructive bg-transparent">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
