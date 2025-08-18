'use client'

import { toast } from 'sonner'

export default function ErrorAlert({ message }: { message: string }) {
  if (!message) return null

  toast.error(message)

  return null
}
