import type { ReactNode } from "react"

interface CardGridProps {
  children: ReactNode
  cols?: number
  gap?: string
  className?: string
}

export function CardGrid({ children, cols = 3, gap = "gap-6", className = "" }: CardGridProps) {
  const colsClass = {
    1: "grid-cols-1",
    2: "sm:grid-cols-2",
    3: "md:grid-cols-2 lg:grid-cols-3",
    4: "md:grid-cols-2 lg:grid-cols-4",
  }

  return (
    <div className={`grid grid-cols-1 ${colsClass[cols as keyof typeof colsClass]} ${gap} ${className}`}>
      {children}
    </div>
  )
}
