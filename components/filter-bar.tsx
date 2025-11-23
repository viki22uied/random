"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter, X } from "lucide-react"

export interface FilterOption {
  id: string
  label: string
}

interface FilterBarProps {
  onSearch?: (term: string) => void
  filters?: FilterOption[]
  onFilterChange?: (filterId: string) => void
  activeFilter?: string
  placeholder?: string
}

export function FilterBar({
  onSearch,
  filters = [],
  onFilterChange,
  activeFilter,
  placeholder = "Search...",
}: FilterBarProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    onSearch?.(value)
  }

  const handleClearSearch = () => {
    setSearchTerm("")
    onSearch?.("")
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 p-4 bg-secondary/20 rounded-lg border border-border">
      {/* Search Input */}
      {onSearch && (
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchTerm && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-secondary rounded transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
      )}

      {/* Filter Buttons */}
      {filters.length > 0 && (
        <div className="flex gap-2 flex-wrap sm:flex-nowrap">
          {filters.map((filter) => (
            <Button
              key={filter.id}
              variant={activeFilter === filter.id ? "default" : "outline"}
              size="sm"
              onClick={() => onFilterChange?.(filter.id)}
              className="h-10"
            >
              <Filter className="w-4 h-4 mr-2" />
              {filter.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
