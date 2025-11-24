"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, FileIcon } from "lucide-react"

export default function ReportsPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/login")
    }
  }, [user, router])

  const reports = [
    {
      title: "Monthly State Summary - December 2024",
      description: "Aggregated health metrics across all districts",
      date: "2024-12-15",
      size: "2.4 MB",
      type: "pdf",
    },
    {
      title: "District Performance Comparison",
      description: "Comparative analysis of all districts in State A",
      date: "2024-12-14",
      size: "1.8 MB",
      type: "xlsx",
    },
    {
      title: "Scheme Utilization Report",
      description: "Welfare scheme performance and beneficiary tracking",
      date: "2024-12-10",
      size: "3.1 MB",
      type: "pdf",
    },
    {
      title: "Data Quality Audit",
      description: "System-wide data validation and quality assessment",
      date: "2024-12-05",
      size: "1.2 MB",
      type: "pdf",
    },
  ]

  const handleDownloadReport = (report: any) => {
    // Create mock file content based on report type
    let content = ''
    let mimeType = ''
    let fileName = ''

    switch (report.type) {
      case 'pdf':
        // Create a simple PDF-like content
        content = `Report: ${report.title}\n\n${report.description}\n\nGenerated on: ${report.date}\n\nThis is a sample report content for demonstration purposes.`
        mimeType = 'application/pdf'
        fileName = `${report.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`
        break
      case 'xlsx':
        // Create CSV content for Excel
        content = `Report: ${report.title}\nDate,Value,Metric\n2024-01,100,Performance\n2024-02,150,Growth\n2024-03,200,Target`
        mimeType = 'application/vnd.ms-excel'
        fileName = `${report.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.csv`
        break
      default:
        content = `Report: ${report.title}\n\n${report.description}\n\nGenerated on: ${report.date}`
        mimeType = 'text/plain'
        fileName = `${report.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`
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

  if (!user) {
    return null
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 overflow-auto p-4 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Reports & Downloads</h1>
          <p className="text-muted-foreground">Access generated reports and data exports</p>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reports.map((report, idx) => (
            <Card key={idx} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{report.title}</CardTitle>
                    <CardDescription>{report.description}</CardDescription>
                  </div>
                  <FileIcon className="w-6 h-6 text-muted-foreground flex-shrink-0" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{report.date}</span>
                  <span>{report.size}</span>
                </div>
                <Button 
                  className="w-full bg-accent hover:bg-accent text-accent-foreground"
                  onClick={() => handleDownloadReport(report)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download {report.type.toUpperCase()}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
