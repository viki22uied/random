"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle2, X } from "lucide-react"
import { FileUploadWidget } from "@/components/file-upload-widget"

interface FormData {
  schemeName: string
  beneficiaryCount: string
  fundsUtilized: string
  activities: string[]
  status: "Draft" | "Submitted" | "Corrected"
  attachments: File[]
}

interface FormErrors {
  [key: string]: string
}

const availableActivities = [
  "Community Outreach",
  "Health Screening",
  "Vaccination Drive",
  "Awareness Campaign",
  "Training Program",
  "Documentation",
  "Follow-up Monitoring",
]

export function SchemeTrackingForm() {
  const [formData, setFormData] = useState<FormData>({
    schemeName: "",
    beneficiaryCount: "",
    fundsUtilized: "",
    activities: [],
    status: "Submitted",
    attachments: [],
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const schemes = [
    "Maternal Welfare Scheme",
    "Child Nutrition Program",
    "Disease Prevention Initiative",
    "Community Health Worker Program",
  ]

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.schemeName) newErrors.schemeName = "Scheme name is required"
    if (!formData.beneficiaryCount) newErrors.beneficiaryCount = "Beneficiary count is required"
    if (
      formData.beneficiaryCount &&
      (isNaN(Number(formData.beneficiaryCount)) || Number(formData.beneficiaryCount) < 0)
    ) {
      newErrors.beneficiaryCount = "Beneficiary count must be a positive number"
    }
    if (formData.fundsUtilized && (isNaN(Number(formData.fundsUtilized)) || Number(formData.fundsUtilized) < 0)) {
      newErrors.fundsUtilized = "Funds must be a positive number"
    }
    if (formData.activities.length === 0) newErrors.activities = "Select at least one activity"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const toggleActivity = (activity: string) => {
    setFormData((prev) => ({
      ...prev,
      activities: prev.activities.includes(activity)
        ? prev.activities.filter((a) => a !== activity)
        : [...prev.activities, activity],
    }))
    if (errors.activities) {
      setErrors((prev) => ({ ...prev, activities: "" }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setSubmitSuccess(true)
      setFormData({
        schemeName: "",
        beneficiaryCount: "",
        fundsUtilized: "",
        activities: [],
        status: "Submitted",
        attachments: [],
      })
      setTimeout(() => setSubmitSuccess(false), 3000)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Submit Scheme Tracking</h1>
        <p className="text-muted-foreground">Report beneficiary counts and welfare scheme activities</p>
      </div>

      {submitSuccess && (
        <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg flex gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-emerald-900 dark:text-emerald-100">Scheme data submitted successfully</p>
            <p className="text-sm text-emerald-800 dark:text-emerald-300">Your submission is now pending review</p>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Scheme Tracking Entry</CardTitle>
          <CardDescription>
            Required fields marked with <span className="text-destructive">*</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Scheme Name & Beneficiary Count */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold">
                  Scheme Name <span className="text-destructive">*</span>
                </label>
                <select
                  value={formData.schemeName}
                  onChange={(e) => handleChange("schemeName", e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    errors.schemeName ? "border-destructive" : "border-border"
                  } bg-card focus:outline-none focus:ring-2 focus:ring-accent`}
                >
                  <option value="">Select a scheme</option>
                  {schemes.map((scheme) => (
                    <option key={scheme} value={scheme}>
                      {scheme}
                    </option>
                  ))}
                </select>
                {errors.schemeName && (
                  <p className="text-xs text-destructive flex gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.schemeName}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">
                  Beneficiary Count <span className="text-destructive">*</span>
                </label>
                <Input
                  type="number"
                  min="0"
                  placeholder="Number of beneficiaries"
                  value={formData.beneficiaryCount}
                  onChange={(e) => handleChange("beneficiaryCount", e.target.value)}
                  className={errors.beneficiaryCount ? "border-destructive" : ""}
                />
                {errors.beneficiaryCount && (
                  <p className="text-xs text-destructive flex gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.beneficiaryCount}
                  </p>
                )}
              </div>
            </div>

            {/* Funds Utilized & Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold">
                  Funds Utilized (₹) <span className="text-muted-foreground">(optional)</span>
                </label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Amount in rupees"
                  value={formData.fundsUtilized}
                  onChange={(e) => handleChange("fundsUtilized", e.target.value)}
                  className={errors.fundsUtilized ? "border-destructive" : ""}
                />
                {errors.fundsUtilized && (
                  <p className="text-xs text-destructive flex gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.fundsUtilized}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange("status", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="Draft">Draft</option>
                  <option value="Submitted">Submitted</option>
                  <option value="Corrected">Corrected</option>
                </select>
              </div>
            </div>

            {/* Activities Multi-select */}
            <div className="space-y-3">
              <label className="text-sm font-semibold">
                Activities Performed <span className="text-destructive">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {availableActivities.map((activity) => (
                  <button
                    key={activity}
                    type="button"
                    onClick={() => toggleActivity(activity)}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      formData.activities.includes(activity)
                        ? "border-accent bg-accent/10"
                        : "border-border hover:border-border/70"
                    }`}
                  >
                    <div className="font-medium text-sm">{activity}</div>
                  </button>
                ))}
              </div>
              {errors.activities && (
                <p className="text-xs text-destructive flex gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.activities}
                </p>
              )}
            </div>

            {/* Selected Activities Tag Display */}
            {formData.activities.length > 0 && (
              <div className="p-3 bg-accent/5 rounded-lg border border-accent/20">
                <p className="text-xs font-semibold text-muted-foreground mb-2">Selected Activities:</p>
                <div className="flex flex-wrap gap-2">
                  {formData.activities.map((activity) => (
                    <div
                      key={activity}
                      className="flex items-center gap-2 px-2.5 py-1 bg-accent/20 rounded-full text-sm"
                    >
                      <span>{activity}</span>
                      <button type="button" onClick={() => toggleActivity(activity)} className="hover:opacity-70">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* File Upload */}
            <div className="space-y-2">
              <label className="text-sm font-semibold">Supporting Documents</label>
              <FileUploadWidget
                onFilesSelected={(files) => setFormData((prev) => ({ ...prev, attachments: files }))}
                maxFiles={5}
                maxSize={10 * 1024 * 1024}
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-accent hover:bg-accent text-accent-foreground h-10"
              >
                {isSubmitting ? "Submitting..." : "Submit Scheme Data"}
              </Button>
              <Button type="button" variant="outline" className="flex-1 h-10 bg-transparent">
                Save as Draft
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
