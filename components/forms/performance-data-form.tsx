"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle2, Calendar } from "lucide-react"
import { FileUploadWidget } from "@/components/file-upload-widget"

interface FormData {
  facility: string
  startDate: string
  endDate: string
  programName: string
  metricType: string
  metricValue: string
  notes: string
  attachments: File[]
}

interface FormErrors {
  [key: string]: string
}

export function PerformanceDataForm() {
  const [formData, setFormData] = useState<FormData>({
    facility: "FAC001",
    startDate: "",
    endDate: "",
    programName: "",
    metricType: "",
    metricValue: "",
    notes: "",
    attachments: [],
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const programs = ["Maternal Health", "Child Immunization", "Disease Prevention", "Nutrition Program"]
  const metrics = ["Outpatient Visits", "Immunizations", "Maternal Visits", "Child Wellness Checks", "Disease Cases"]

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.startDate) newErrors.startDate = "Start date is required"
    if (!formData.endDate) newErrors.endDate = "End date is required"
    if (formData.startDate && formData.endDate && formData.endDate < formData.startDate) {
      newErrors.endDate = "End date must be after start date"
    }
    if (!formData.programName) newErrors.programName = "Program name is required"
    if (!formData.metricType) newErrors.metricType = "Metric type is required"
    if (!formData.metricValue) newErrors.metricValue = "Metric value is required"
    if (formData.metricValue && (isNaN(Number(formData.metricValue)) || Number(formData.metricValue) < 0)) {
      newErrors.metricValue = "Metric value must be a positive number"
    }
    if (formData.notes.length > 2000) newErrors.notes = "Notes cannot exceed 2000 characters"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
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
        facility: "FAC001",
        startDate: "",
        endDate: "",
        programName: "",
        metricType: "",
        metricValue: "",
        notes: "",
        attachments: [],
      })
      setTimeout(() => setSubmitSuccess(false), 3000)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full min-h-screen bg-background">
      <div className="px-4 py-6 sm:px-6 md:px-8 md:py-8 max-w-4xl mx-auto">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">Submit Performance Data</h1>
          <p className="text-sm md:text-base text-muted-foreground">Enter facility-level health performance metrics</p>
        </div>

        {submitSuccess && (
          <div className="mb-6 p-3 md:p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg flex gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-emerald-900 dark:text-emerald-100 text-sm md:text-base">
                Data submitted successfully
              </p>
              <p className="text-xs md:text-sm text-emerald-800 dark:text-emerald-300">
                Your submission is now pending review
              </p>
            </div>
          </div>
        )}

        <Card className="border-border/50 shadow-sm md:shadow-md">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-lg md:text-xl">Performance Data Entry</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Required fields marked with <span className="text-destructive">*</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              {/* Facility (Auto-filled, read-only) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <label className="text-xs md:text-sm font-semibold">
                    Facility <span className="text-destructive">*</span>
                  </label>
                  <Input value={formData.facility} disabled className="bg-muted text-sm md:text-base h-10" />
                  <p className="text-xs text-muted-foreground">Auto-filled for your facility</p>
                </div>

                {/* Program Name */}
                <div className="space-y-2">
                  <label className="text-xs md:text-sm font-semibold">
                    Program Name <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={formData.programName}
                    onChange={(e) => handleChange("programName", e.target.value)}
                    className={`w-full px-3 py-2.5 text-sm md:text-base rounded-lg border ${
                      errors.programName ? "border-destructive" : "border-border"
                    } bg-card focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200`}
                  >
                    <option value="">Select a program</option>
                    {programs.map((prog) => (
                      <option key={prog} value={prog}>
                        {prog}
                      </option>
                    ))}
                  </select>
                  {errors.programName && (
                    <p className="text-xs text-destructive flex gap-1">
                      <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                      {errors.programName}
                    </p>
                  )}
                </div>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <label className="text-xs md:text-sm font-semibold">
                    Reporting Period Start <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleChange("startDate", e.target.value)}
                      className={`pl-10 text-sm md:text-base h-10 ${errors.startDate ? "border-destructive" : ""}`}
                    />
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                  {errors.startDate && (
                    <p className="text-xs text-destructive flex gap-1">
                      <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                      {errors.startDate}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs md:text-sm font-semibold">
                    Reporting Period End <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleChange("endDate", e.target.value)}
                      className={`pl-10 text-sm md:text-base h-10 ${errors.endDate ? "border-destructive" : ""}`}
                    />
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                  {errors.endDate && (
                    <p className="text-xs text-destructive flex gap-1">
                      <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                      {errors.endDate}
                    </p>
                  )}
                </div>
              </div>

              {/* Metric Type & Value */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <label className="text-xs md:text-sm font-semibold">
                    Metric Type <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={formData.metricType}
                    onChange={(e) => handleChange("metricType", e.target.value)}
                    className={`w-full px-3 py-2.5 text-sm md:text-base rounded-lg border ${
                      errors.metricType ? "border-destructive" : "border-border"
                    } bg-card focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200`}
                  >
                    <option value="">Select a metric</option>
                    {metrics.map((metric) => (
                      <option key={metric} value={metric}>
                        {metric}
                      </option>
                    ))}
                  </select>
                  {errors.metricType && (
                    <p className="text-xs text-destructive flex gap-1">
                      <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                      {errors.metricType}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs md:text-sm font-semibold">
                    Metric Value <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="Enter numeric value"
                    value={formData.metricValue}
                    onChange={(e) => handleChange("metricValue", e.target.value)}
                    className={`text-sm md:text-base h-10 ${errors.metricValue ? "border-destructive" : ""}`}
                  />
                  {errors.metricValue && (
                    <p className="text-xs text-destructive flex gap-1">
                      <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                      {errors.metricValue}
                    </p>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="text-xs md:text-sm font-semibold">
                  Additional Notes <span className="text-muted-foreground">(max 2000 characters)</span>
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  placeholder="Add any relevant details about this submission..."
                  rows={4}
                  className="w-full px-3 py-2.5 text-sm md:text-base rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-accent resize-none transition-all duration-200"
                />
                <div className="flex justify-between items-center">
                  {errors.notes && (
                    <p className="text-xs text-destructive flex gap-1">
                      <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                      {errors.notes}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground ml-auto">{formData.notes.length}/2000</p>
                </div>
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <label className="text-xs md:text-sm font-semibold">Attachments (PDF/JPG/PNG, max 10MB each)</label>
                <FileUploadWidget
                  onFilesSelected={(files) => setFormData((prev) => ({ ...prev, attachments: files }))}
                  maxFiles={5}
                  maxSize={10 * 1024 * 1024}
                />
              </div>

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-accent hover:bg-accent text-accent-foreground text-sm md:text-base h-11 sm:h-10 btn-micro transition-all duration-200"
                >
                  {isSubmitting ? "Submitting..." : "Submit Data"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 text-sm md:text-base h-11 sm:h-10 bg-transparent btn-micro transition-all duration-200"
                >
                  Save as Draft
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
