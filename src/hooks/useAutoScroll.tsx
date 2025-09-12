'use client'

import { useEffect, RefObject } from 'react'

export function useAutoScroll(
  ref: RefObject<HTMLDivElement | null>,
  messages: unknown[],
  liveMessage?: string | null,
  loading?: boolean
) {
  useEffect(() => {
    if (!ref.current) return
    ref.current.scrollTo({
      top: ref.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [ref, messages, liveMessage, loading])
}
