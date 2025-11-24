"use client"

import type React from "react"

import { useState } from "react"
import { ChevronUp, ChevronDown, ArrowUpDown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export interface Column<T> {
  key: keyof T
  label: string
  sortable?: boolean
  width?: string
  render?: (value: any, row: T) => React.ReactNode
}

export interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  onRowClick?: (row: T) => void
  rowHighlight?: (row: T) => boolean
  isLoading?: boolean
  emptyMessage?: string
}

export function DataTable<T extends { id?: string }>({
  columns,
  data,
  onRowClick,
  rowHighlight,
  isLoading,
  emptyMessage = "No data available",
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T
    direction: "asc" | "desc"
  } | null>(null)

  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig) return 0

    const aVal = a[sortConfig.key]
    const bVal = b[sortConfig.key]

    if (aVal === bVal) return 0
    if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1
    return sortConfig.direction === "asc" ? 1 : -1
  })

  const handleSort = (key: keyof T) => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        return {
          key,
          direction: prev.direction === "asc" ? "desc" : "asc",
        }
      }
      return { key, direction: "asc" }
    })
  }

  const getSortIcon = (columnKey: keyof T) => {
    if (sortConfig?.key !== columnKey) {
      return <ArrowUpDown className="w-4 h-4 opacity-40" />
    }
    return sortConfig.direction === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="inline-flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-border border-t-accent rounded-full animate-spin mb-4" />
            <p className="text-muted-foreground">Loading data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-lg font-semibold text-muted-foreground mb-1">No Results</p>
          <p className="text-muted-foreground text-sm">{emptyMessage}</p>
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
                {columns.map((column) => (
                  <th
                    key={String(column.key)}
                    className="text-left p-4 font-semibold text-sm"
                    style={{ width: column.width }}
                  >
                    {column.sortable ? (
                      <button
                        onClick={() => handleSort(column.key)}
                        className="flex items-center gap-2 hover:text-accent transition-colors"
                      >
                        {column.label}
                        {getSortIcon(column.key)}
                      </button>
                    ) : (
                      column.label
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedData.map((row, idx) => (
                <tr
                  key={row.id || idx}
                  onClick={() => onRowClick?.(row)}
                  className={`border-b border-border transition-colors ${
                    onRowClick ? "cursor-pointer hover:bg-secondary/30" : "hover:bg-secondary/20"
                  } ${rowHighlight?.(row) ? "bg-accent/5" : ""}`}
                >
                  {columns.map((column) => (
                    <td key={String(column.key)} className="p-4 text-sm">
                      {column.render ? column.render(row[column.key], row) : String(row[column.key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
