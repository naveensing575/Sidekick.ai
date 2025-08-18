'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'

/**
 * ErrorAlert — shows error messages to the user (API errors, etc.)
 */
export default function ErrorAlert({ message }: { message: string }) {
  if (!message) return null
  return (
    <Alert variant="destructive" className="my-2">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}
