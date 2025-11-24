'use client'

import React from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center space-y-4 p-8">
            <h2 className="text-2xl font-bold text-destructive">Something went wrong!</h2>
            <p className="text-muted-foreground">
              {error.message || 'An unexpected error occurred'}
            </p>
            {error.digest && (
              <p className="text-xs text-muted-foreground">
                Error ID: {error.digest}
              </p>
            )}
            <button
              onClick={reset}
              className="px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/80 transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
