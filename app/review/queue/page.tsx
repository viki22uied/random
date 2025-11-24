"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { ProtectedRoute } from "@/components/protected-route"
import { ReviewQueueTable } from "@/components/review/review-queue-table"
import { ReviewDetailModal } from "@/components/review/review-detail-modal"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Download } from "lucide-react"

interface SubmissionItem {
  id: string
  facility: string
  facilityId: string
  type: "performance" | "scheme"
  date: string
  status: "pending" | "corrected" | "rejected"
  priority: "high" | "normal"
  data: Record<string, any>
}

export default function ReviewQueuePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([])
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionItem | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>("all")

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    // Mock submissions data
    setSubmissions([
      {
        id: "SUB001",
        facility: "City General Hospital",
        facilityId: "FAC001",
        type: "performance",
        date: "2024-12-15",
        status: "pending",
        priority: "high",
        data: {
          program: "Maternal Health",
          metric: "Outpatient Visits",
          value: 1250,
          notes: "Weekly report for Week 50",
        },
      },
      {
        id: "SUB002",
        facility: "District Primary Center",
        facilityId: "FAC002",
        type: "scheme",
        date: "2024-12-14",
        status: "pending",
        priority: "normal",
        data: {
          scheme: "Maternal Welfare Scheme",
          beneficiaries: 480,
          funds: 125000,
          activities: ["Health Screening", "Awareness Campaign"],
        },
      },
      {
        id: "SUB003",
        facility: "Rural Clinic A",
        facilityId: "FAC003",
        type: "performance",
        date: "2024-12-13",
        status: "corrected",
        priority: "high",
        data: {
          program: "Immunization",
          metric: "Immunizations",
          value: 320,
          notes: "Corrected data - updated beneficiary count",
        },
      },
      {
        id: "SUB004",
        facility: "Rural Clinic B",
        facilityId: "FAC004",
        type: "performance",
        date: "2024-12-12",
        status: "pending",
        priority: "normal",
        data: {
          program: "Disease Prevention",
          metric: "Disease Cases",
          value: 45,
          notes: "Monthly summary report",
        },
      },
      {
        id: "SUB005",
        facility: "City General Hospital",
        facilityId: "FAC001",
        type: "scheme",
        date: "2024-12-11",
        status: "pending",
        priority: "normal",
        data: {
          scheme: "Child Nutrition Program",
          beneficiaries: 220,
          funds: 55000,
          activities: ["Training Program", "Follow-up Monitoring"],
        },
      },
    ])
  }, [user, router])

  if (!user) {
    return null
  }

  const filteredSubmissions =
    filterStatus === "all" ? submissions : submissions.filter((s) => s.status === filterStatus)

  return (
    <ProtectedRoute allowedRoles={["district"]}>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 overflow-auto p-4 md:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Review Queue</h1>
            <p className="text-muted-foreground">Review and approve facility submissions</p>
          </div>

          {/* Controls */}
          <Card className="mb-8">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    variant={filterStatus === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterStatus("all")}
                  >
                    All ({submissions.length})
                  </Button>
                  <Button
                    variant={filterStatus === "pending" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterStatus("pending")}
                  >
                    Pending ({submissions.filter((s) => s.status === "pending").length})
                  </Button>
                  <Button
                    variant={filterStatus === "corrected" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterStatus("corrected")}
                  >
                    Corrected ({submissions.filter((s) => s.status === "corrected").length})
                  </Button>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Review Table */}
          <ReviewQueueTable submissions={filteredSubmissions} onSelectSubmission={setSelectedSubmission} />
        </div>
      </div>

      {/* Detail Modal */}
      {selectedSubmission && (
        <ReviewDetailModal
          submission={selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
          onApprove={() => {
            setSubmissions((prev) => prev.filter((s) => s.id !== selectedSubmission.id))
            setSelectedSubmission(null)
          }}
          onReject={() => {
            setSubmissions((prev) =>
              prev.map((s) => (s.id === selectedSubmission.id ? { ...s, status: "rejected" } : s)),
            )
            setSelectedSubmission(null)
          }}
          onRequestCorrection={() => {
            setSubmissions((prev) =>
              prev.map((s) => (s.id === selectedSubmission.id ? { ...s, status: "corrected" } : s)),
            )
            setSelectedSubmission(null)
          }}
        />
      )}
    </ProtectedRoute>
  )
}
