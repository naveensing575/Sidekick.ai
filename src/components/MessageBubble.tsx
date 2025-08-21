'use client'

import { Markdown } from '@/utils/markdown'
import { Role } from './chat/ChatWindow'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { Button } from './ui/button'

export default function MessageBubble({
  role,
  content,
}: {
  role: Role
  content: string
}) {
  const isUser = role === 'user'
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (err) {
      console.error('Failed to copy text', err)
    }
  }

  return (
    <div className={cn('w-full flex', isUser ? 'justify-end' : 'justify-start')}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className={cn(
          'px-4 py-2 rounded-2xl text-sm backdrop-blur-md w-full max-w-3xl',
          'whitespace-pre-wrap break-words',
          '[&_pre]:overflow-x-auto [&_pre]:max-w-full [&_code]:whitespace-pre',
          isUser
            ? 'bg-white text-black dark:bg-white/90 lg:max-w-1/2'
            : 'bg-gray-800/60 text-white dark:bg-gray-700/40'
        )}
      >
        {/* Top row with copy button only for AI messages */}
        {!isUser && (
          <div className="flex justify-end mb-2">
            <Button
              onClick={handleCopy}
              size="sm"
              variant="outline"
              className="h-5 px-1 py-1 text-xs border-white/30 text-white bg-transparent hover:bg-white"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 mr-1" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 mr-1" />
                  Copy
                </>
              )}
            </Button>
          </div>
        )}

        <Markdown content={content} />
      </motion.div>
    </div>
  )
}
