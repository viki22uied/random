"use client"

import type { ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"

interface ResponsiveTableColumn {
  label: string
  key: string
  align?: "left" | "center" | "right"
  mobileLabel?: string
  hide?: boolean
}

interface ResponsiveTableProps {
  columns: ResponsiveTableColumn[]
  data: Record<string, ReactNode>[]
  isLoading?: boolean
}

export function ResponsiveTable({ columns, data, isLoading }: ResponsiveTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, idx) => (
              <div key={idx} className="h-12 bg-secondary rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const visibleColumns = columns.filter((col) => !col.hide)

  return (
    <Card>
      <CardContent className="p-0">
        {/* Desktop View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                {visibleColumns.map((col) => (
                  <th
                    key={col.key}
                    className={`p-4 font-semibold text-sm text-left ${
                      col.align === "center" ? "text-center" : col.align === "right" ? "text-right" : ""
                    }`}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <tr key={idx} className="border-b border-border hover:bg-secondary/20 transition-colors">
                  {visibleColumns.map((col) => (
                    <td
                      key={col.key}
                      className={`p-4 text-sm ${
                        col.align === "center" ? "text-center" : col.align === "right" ? "text-right" : "text-left"
                      }`}
                    >
                      {row[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="sm:hidden space-y-3 p-4">
          {data.map((row, idx) => (
            <div key={idx} className="border border-border rounded-lg p-4 space-y-2">
              {visibleColumns.map((col) => (
                <div key={col.key} className="flex justify-between items-center">
                  <span className="font-semibold text-sm">{col.mobileLabel || col.label}:</span>
                  <span className="text-sm text-muted-foreground">{row[col.key]}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
