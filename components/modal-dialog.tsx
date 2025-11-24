"use client"

import type { ReactNode } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ModalDialogProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  actions?: {
    cancel?: {
      label: string
      onClick: () => void
    }
    confirm?: {
      label: string
      onClick: () => void
      variant?: "default" | "destructive"
      loading?: boolean
    }
  }
  size?: "sm" | "md" | "lg" | "xl"
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
}

export function ModalDialog({ isOpen, onClose, title, description, children, actions, size = "md" }: ModalDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className={`w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto`}>
        {/* Header */}
        <CardHeader className="border-b border-border sticky top-0 bg-card">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{title}</CardTitle>
              {description && <CardDescription className="mt-1">{description}</CardDescription>}
            </div>
            <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg transition-colors flex-shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>
        </CardHeader>

        {/* Content */}
        <CardContent className="p-6">{children}</CardContent>

        {/* Actions */}
        {actions && (
          <div className="border-t border-border p-6 bg-secondary/20 flex gap-3 justify-end sticky bottom-0">
            {actions.cancel && (
              <Button variant="outline" onClick={actions.cancel.onClick}>
                {actions.cancel.label}
              </Button>
            )}
            {actions.confirm && (
              <Button
                onClick={actions.confirm.onClick}
                disabled={actions.confirm.loading}
                className={
                  actions.confirm.variant === "destructive"
                    ? "bg-destructive hover:bg-destructive text-destructive-foreground"
                    : "bg-accent hover:bg-accent text-accent-foreground"
                }
              >
                {actions.confirm.loading ? "Loading..." : actions.confirm.label}
              </Button>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}
