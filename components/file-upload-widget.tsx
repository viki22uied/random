"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, X, FileIcon, ImageIcon, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FileWithProgress {
  file: File
  progress: number
  status: "pending" | "uploading" | "success" | "error"
  error?: string
}

interface FileUploadWidgetProps {
  onFilesSelected: (files: File[]) => void
  maxFiles?: number
  maxSize?: number // in bytes
  acceptedTypes?: string[]
}

export function FileUploadWidget({
  onFilesSelected,
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024,
  acceptedTypes = ["application/pdf", "image/jpeg", "image/png"],
}: FileUploadWidgetProps) {
  const [fileList, setFileList] = useState<FileWithProgress[]>([])
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFiles(droppedFiles)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    handleFiles(selectedFiles)
  }

  const handleFiles = (newFiles: File[]) => {
    const validFiles: FileWithProgress[] = []

    newFiles.forEach((file) => {
      // Size validation
      if (file.size > maxSize) {
        alert(`File ${file.name} exceeds maximum size of ${(maxSize / 1024 / 1024).toFixed(2)}MB`)
        return
      }

      // Type validation
      if (!acceptedTypes.includes(file.type)) {
        alert(`File ${file.name} has invalid type. Only PDF, JPG, PNG allowed.`)
        return
      }

      // Check total files
      if (fileList.length + validFiles.length >= maxFiles) {
        alert(`Maximum ${maxFiles} files allowed`)
        return
      }

      validFiles.push({
        file,
        progress: 0,
        status: "pending",
      })
    })

    const updatedList = [...fileList, ...validFiles]
    setFileList(updatedList)

    // Simulate upload progress
    validFiles.forEach((item, idx) => {
      setTimeout(() => {
        simulateUpload(fileList.length + idx)
      }, idx * 200)
    })

    onFilesSelected(updatedList.map((f) => f.file))
  }

  const simulateUpload = (index: number) => {
    setFileList((prev) => {
      const updated = [...prev]
      if (updated[index]) {
        updated[index].status = "uploading"
      }
      return updated
    })

    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 40
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)

        setFileList((prev) => {
          const updated = [...prev]
          if (updated[index]) {
            updated[index].progress = 100
            updated[index].status = "success"
          }
          return updated
        })
      } else {
        setFileList((prev) => {
          const updated = [...prev]
          if (updated[index]) {
            updated[index].progress = progress
          }
          return updated
        })
      }
    }, 300)
  }

  const removeFile = (index: number) => {
    const updatedList = fileList.filter((_, i) => i !== index)
    setFileList(updatedList)
    onFilesSelected(updatedList.map((f) => f.file))
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB"]
    const i = Math.floor(Math.log(bytes, k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`p-8 rounded-lg border-2 border-dashed transition-all text-center cursor-pointer ${
          dragActive ? "border-accent bg-accent/10" : "border-border/50 hover:border-border hover:bg-secondary/30"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileInput}
          className="hidden"
        />

        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
        <p className="font-medium mb-1">Drag and drop files here</p>
        <p className="text-sm text-muted-foreground mb-4">or</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="mx-auto"
        >
          Browse Files
        </Button>
        <p className="text-xs text-muted-foreground mt-3">
          PDF, JPG, PNG • Max {(maxSize / 1024 / 1024).toFixed(2)}MB each • Up to {maxFiles} files
        </p>
      </div>

      {/* File List with Progress */}
      {fileList.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold">Files ({fileList.length})</p>
          <div className="space-y-2">
            {fileList.map((item, index) => (
              <div
                key={index}
                className="p-3 rounded-lg border border-border bg-secondary/30 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-3 mb-2">
                  {item.file.type === "application/pdf" ? (
                    <FileIcon className="w-4 h-4 text-red-500 flex-shrink-0" />
                  ) : (
                    <ImageIcon className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(item.file.size)}</p>
                  </div>
                  {item.status === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />}
                  {item.status === "error" && <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />}
                  {item.status === "uploading" && (
                    <Loader2 className="w-5 h-5 text-accent animate-spin flex-shrink-0" />
                  )}
                  {item.status === "pending" && (
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="p-1 hover:bg-destructive/10 rounded transition-colors text-muted-foreground hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Progress Bar */}
                {item.status !== "pending" && (
                  <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        item.status === "success"
                          ? "bg-emerald-500"
                          : item.status === "error"
                            ? "bg-destructive"
                            : "bg-accent"
                      }`}
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
