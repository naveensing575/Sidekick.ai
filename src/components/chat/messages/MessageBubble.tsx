'use client'
import { Markdown } from '@/utils/markdown'
import { Role } from '@/types/chat'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { Copy, Check, User, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className={cn('w-full flex gap-3 group', isUser ? 'justify-end' : 'justify-start')}>
      {/* Assistant Avatar */}
      {!isUser && (
        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-1">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className={cn(
          'relative rounded-2xl text-sm shadow-lg',
          isUser
            ? 'max-w-[70%] bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3'
            : 'max-w-[85%] bg-slate-800/70 backdrop-blur-sm border border-slate-700/50 text-white px-4 py-3'
        )}
      >
        {/* Copy Button for Assistant Messages */}
        {!isUser && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              onClick={handleCopy}
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 hover:bg-slate-700/50 border-0"
              aria-label="Copy message"
            >
              {copied ? (
                <Check className="w-3 h-3 text-green-400" />
              ) : (
                <Copy className="w-3 h-3 text-slate-400 hover:text-white" />
              )}
            </Button>
          </div>
        )}

        {/* Message Content */}
        <div className={cn('prose prose-sm max-w-none', isUser ? 'prose-invert' : 'prose-slate prose-invert')}>
          <Markdown content={content} />
        </div>
      </motion.div>

      {/* User Avatar */}
      {isUser && (
        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-400 to-blue-500 flex items-center justify-center flex-shrink-0 mt-1">
          <User className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  )
}