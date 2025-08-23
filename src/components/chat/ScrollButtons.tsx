'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ScrollButtonsProps {
  containerRef: React.RefObject<HTMLDivElement | null>
}

export default function ScrollButtons({ containerRef }: ScrollButtonsProps) {
  const [direction, setDirection] = useState<'up' | 'down' | null>(null)
  const lastScrollTop = useRef(0)
  const timer = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    function handleScroll() {
      if (!el) return
      const { scrollTop, scrollHeight, clientHeight } = el

      // reset if reached top/bottom
      if (scrollTop <= 0 || scrollTop + clientHeight >= scrollHeight) {
        setDirection(null)
        return
      }

      // clear old timer so it won’t flicker
      if (timer.current) clearTimeout(timer.current)

      timer.current = setTimeout(() => {
        if (scrollTop > lastScrollTop.current) {
          setDirection('down')
        } else if (scrollTop < lastScrollTop.current) {
          setDirection('up')
        }
        lastScrollTop.current = scrollTop
      }, 10) // <- delay (150ms like GPT)
    }

    el.addEventListener('scroll', handleScroll)
    return () => {
      el.removeEventListener('scroll', handleScroll)
      if (timer.current) clearTimeout(timer.current)
    }
  }, [containerRef])

  const scrollToTop = () => {
    containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const scrollToBottom = () => {
    const el = containerRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 ml-30">
      <AnimatePresence mode="wait">
        {direction === 'up' && (
          <motion.button
            key="scroll-up"
            onClick={scrollToTop}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="p-3 rounded-full backdrop-blur-md bg-white/20 shadow-md hover:bg-white/30 transition"
          >
            <ChevronUp className="w-6 h-6 text-white" />
          </motion.button>
        )}
        {direction === 'down' && (
          <motion.button
            key="scroll-down"
            onClick={scrollToBottom}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="p-3 rounded-full backdrop-blur-md bg-white/20 shadow-md hover:bg-white/30 transition"
          >
            <ChevronDown className="w-6 h-6 text-white" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
