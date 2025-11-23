"use client"

import { AlertCircle, ChevronRight, Clock, CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface SubmissionItem {
  id: string
  facility: string
  type: "performance" | "scheme"
  date: string
  status: "pending" | "corrected" | "rejected"
  priority: "high" | "normal"
}

interface ReviewQueueTableProps {
  submissions: SubmissionItem[]
  onSelectSubmission: (submission: SubmissionItem) => void
}

export function ReviewQueueTable({ submissions, onSelectSubmission }: ReviewQueueTableProps) {
  if (submissions.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-semibold mb-1">No submissions to review</p>
          <p className="text-muted-foreground">All submissions have been processed</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left p-4 font-semibold text-sm">Facility</th>
                <th className="text-left p-4 font-semibold text-sm">Type</th>
                <th className="text-left p-4 font-semibold text-sm">Date</th>
                <th className="text-center p-4 font-semibold text-sm">Priority</th>
                <th className="text-center p-4 font-semibold text-sm">Status</th>
                <th className="text-center p-4 font-semibold text-sm">Action</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((submission) => (
                <tr key={submission.id} className="border-b border-border hover:bg-secondary/20 transition-colors">
                  <td className="p-4">
                    <p className="font-medium">{submission.facility}</p>
                    <p className="text-xs text-muted-foreground">{submission.id}</p>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                      {submission.type === "performance" ? "Performance Data" : "Scheme Tracking"}
                    </span>
                  </td>
                  <td className="p-4 text-sm">{submission.date}</td>
                  <td className="p-4 text-center">
                    {submission.priority === "high" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-700 dark:text-red-400">
                        <AlertCircle className="w-3 h-3" />
                        High
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Normal</span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    {submission.status === "pending" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400">
                        <Clock className="w-3 h-3" />
                        Pending
                      </span>
                    )}
                    {submission.status === "corrected" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-700 dark:text-blue-400">
                        <AlertCircle className="w-3 h-3" />
                        Corrected
                      </span>
                    )}
                    {submission.status === "rejected" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-destructive/10 text-destructive">
                        <XCircle className="w-3 h-3" />
                        Rejected
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <Button variant="outline" size="sm" onClick={() => onSelectSubmission(submission)} className="h-8">
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
