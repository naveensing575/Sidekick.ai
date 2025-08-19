'use client'

import { useEffect, useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface ScrollButtonsProps {
  containerRef: React.RefObject<HTMLDivElement | null>
}

export default function ScrollButtons({ containerRef }: ScrollButtonsProps) {
  const [direction, setDirection] = useState<'up' | 'down' | null>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    let lastScrollTop = el.scrollTop

    function handleScroll() {
      if (!el) return
      const { scrollTop, scrollHeight, clientHeight } = el

      if (scrollTop <= 0) {
        // At the very top → hide
        setDirection(null)
      } else if (scrollTop + clientHeight >= scrollHeight) {
        // At the very bottom → hide
        setDirection(null)
      } else {
        // Detect direction
        if (scrollTop > lastScrollTop) {
          setDirection('down') // scrolling down
        } else if (scrollTop < lastScrollTop) {
          setDirection('up') // scrolling up
        }
      }

      lastScrollTop = scrollTop <= 0 ? 0 : scrollTop
    }

    el.addEventListener('scroll', handleScroll)
    return () => el.removeEventListener('scroll', handleScroll)
  }, [containerRef])

  function scrollToTop() {
    containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function scrollToBottom() {
    containerRef.current?.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }

  return (
  <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 lg:ml-30">
    {direction === 'up' && (
      <button
        onClick={scrollToTop}
        className="p-3 rounded-full bg-slate-800 shadow-md hover:bg-slate-700 transition"
      >
        <ChevronUp className="w-5 h-5 text-white" />
      </button>
    )}
    {direction === 'down' && (
      <button
        onClick={scrollToBottom}
        className="p-3 rounded-full bg-slate-800 shadow-md hover:bg-slate-700 transition"
      >
        <ChevronDown className="w-5 h-5 text-white" />
      </button>
    )}
  </div>
)

}
