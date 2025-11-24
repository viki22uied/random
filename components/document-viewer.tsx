"use client"

import { useState } from "react"
import { X, Download, Share2, ZoomIn, ZoomOut } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DocumentViewerProps {
  document: {
    name: string
    type: "pdf" | "image"
    url: string
  }
  onClose: () => void
}

export function DocumentViewer({ document, onClose }: DocumentViewerProps) {
  const [zoom, setZoom] = useState(100)

  return (
    <div className="fixed inset-0 bg-black/80 flex flex-col z-50">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 p-4 flex items-center justify-between">
        <div className="text-white">
          <h2 className="font-semibold">{document.name}</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="text-white hover:bg-gray-800">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button variant="ghost" size="sm" className="text-white hover:bg-gray-800">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-gray-800">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Viewer Controls */}
      <div className="bg-gray-800 border-b border-gray-700 p-3 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setZoom(Math.max(50, zoom - 10))}
          className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <div className="px-4 py-2 bg-gray-700 rounded text-white text-sm font-medium">{zoom}%</div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setZoom(Math.min(200, zoom + 10))}
          className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-4">
        {document.type === "pdf" ? (
          <div className="bg-gray-100 p-4 rounded shadow-lg max-w-4xl w-full">
            <div className="bg-red-500 text-white p-4 rounded text-center font-semibold">
              PDF Preview: {document.name}
            </div>
            <p className="text-gray-600 text-center mt-4">PDF viewer integration would go here</p>
          </div>
        ) : (
          <img
            src="/document-preview.png"
            alt={document.name}
            style={{ maxWidth: "100%", maxHeight: "100%", transform: `scale(${zoom / 100})` }}
            className="transition-transform"
          />
        )}
      </div>
    </div>
  )
}
