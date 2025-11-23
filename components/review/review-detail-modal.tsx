"use client"

import { useState } from "react"
import { X, AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface SubmissionItem {
  id: string
  facility: string
  type: "performance" | "scheme"
  date: string
  status: string
  data: Record<string, any>
}

interface ReviewDetailModalProps {
  submission: SubmissionItem
  onClose: () => void
  onApprove: () => void
  onReject: () => void
  onRequestCorrection: () => void
}

export function ReviewDetailModal({
  submission,
  onClose,
  onApprove,
  onReject,
  onRequestCorrection,
}: ReviewDetailModalProps) {
  const [commentText, setCommentText] = useState("")
  const [actionInProgress, setActionInProgress] = useState(false)

  const handleApprove = async () => {
    setActionInProgress(true)
    await new Promise((resolve) => setTimeout(resolve, 500))
    onApprove()
    setActionInProgress(false)
  }

  const handleRequestCorrection = async () => {
    setActionInProgress(true)
    await new Promise((resolve) => setTimeout(resolve, 500))
    onRequestCorrection()
    setActionInProgress(false)
  }

  const handleReject = async () => {
    setActionInProgress(true)
    await new Promise((resolve) => setTimeout(resolve, 500))
    onReject()
    setActionInProgress(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <CardHeader className="border-b border-border sticky top-0 bg-card">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{submission.type === "performance" ? "Performance Data" : "Scheme Tracking"}</CardTitle>
              <CardDescription className="mt-1">Submission ID: {submission.id}</CardDescription>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </CardHeader>

        {/* Content */}
        <CardContent className="p-6 space-y-6">
          {/* Facility & Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-1">Facility</p>
              <p className="font-medium">{submission.facility}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-1">Submission Date</p>
              <p className="font-medium">{submission.date}</p>
            </div>
          </div>

          {/* Submission Data */}
          <div className="p-4 bg-secondary/30 rounded-lg border border-border">
            <p className="text-sm font-semibold mb-3">Submitted Data:</p>
            <div className="space-y-2 text-sm">
              {Object.entries(submission.data).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, " $1").trim()}:</span>
                  <span className="font-medium">{Array.isArray(value) ? value.join(", ") : String(value)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Comment Section */}
          <div className="space-y-3">
            <p className="text-sm font-semibold">Add Comment (Optional)</p>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add any comments about this submission..."
              rows={4}
              className="w-full px-3 py-2 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-accent resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleRequestCorrection}
              disabled={actionInProgress}
              className="border-amber-200 text-amber-700 dark:border-amber-800 dark:text-amber-400 hover:bg-amber-500/10 bg-transparent"
            >
              <AlertCircle className="w-4 h-4 mr-2" />
              Request Correction
            </Button>
            <Button
              variant="outline"
              onClick={handleReject}
              disabled={actionInProgress}
              className="border-destructive text-destructive hover:bg-destructive/10 bg-transparent"
            >
              <X className="w-4 h-4 mr-2" />
              Reject
            </Button>
            <Button
              onClick={handleApprove}
              disabled={actionInProgress}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {actionInProgress ? "Approving..." : "Approve"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
