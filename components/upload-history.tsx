"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileIcon, CheckCircle2, Clock, AlertCircle } from "lucide-react"

interface UploadRecord {
  id: string
  fileName: string
  size: string
  uploadedAt: string
  status: "completed" | "pending" | "failed"
  uploadedBy: string
}

interface UploadHistoryProps {
  records?: UploadRecord[]
}

export function UploadHistory({ records = [] }: UploadHistoryProps) {
  const mockRecords: UploadRecord[] = [
    {
      id: "1",
      fileName: "Performance_Report_Week52.pdf",
      size: "2.4 MB",
      uploadedAt: "2024-12-15 10:30 AM",
      status: "completed",
      uploadedBy: "You",
    },
    {
      id: "2",
      fileName: "Facility_Photos.zip",
      size: "8.5 MB",
      uploadedAt: "2024-12-15 09:15 AM",
      status: "completed",
      uploadedBy: "You",
    },
    {
      id: "3",
      fileName: "Scheme_Data.xlsx",
      size: "1.2 MB",
      uploadedAt: "2024-12-14 03:45 PM",
      status: "completed",
      uploadedBy: "System Admin",
    },
    {
      id: "4",
      fileName: "Large_Report.pdf",
      size: "15.8 MB",
      uploadedAt: "2024-12-14 02:20 PM",
      status: "failed",
      uploadedBy: "You",
    },
  ]

  const data = records.length > 0 ? records : mockRecords

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />
      case "pending":
        return <Clock className="w-4 h-4 text-amber-500 animate-spin" />
      case "failed":
        return <AlertCircle className="w-4 h-4 text-destructive" />
      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Uploads</CardTitle>
        <CardDescription>Your upload history from the past 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((record) => (
            <div
              key={record.id}
              className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-secondary/20 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <FileIcon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{record.fileName}</p>
                  <p className="text-xs text-muted-foreground">
                    {record.size} • {record.uploadedAt}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                {getStatusIcon(record.status)}
                <span className="text-xs text-muted-foreground capitalize">{record.status}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
