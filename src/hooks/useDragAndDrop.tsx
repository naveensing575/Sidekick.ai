'use client'

import { useState } from 'react'

export function useDragAndDrop(onFiles: (files: File[]) => void) {
  const [isDragging, setIsDragging] = useState(false)

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave() {
    setIsDragging(false)
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFiles(Array.from(e.dataTransfer.files))
      e.dataTransfer.clearData()
    }
  }

  return { isDragging, handleDragOver, handleDragLeave, handleDrop }
}
