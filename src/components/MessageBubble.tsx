'use client'

import { Markdown } from '@/utils/markdown'
import { Role } from './chat/ChatWindow'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

export default function MessageBubble({
  role,
  content,
}: {
  role: Role
  content: string
}) {
  const isUser = role === 'user'

  return (
    <div className={cn('w-full flex', isUser ? 'justify-end' : 'justify-start')}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className={cn(
          'px-4 py-2 rounded-2xl text-sm backdrop-blur-md',
          'whitespace-pre-wrap break-words',
          '[&_pre]:overflow-x-auto [&_pre]:max-w-full [&_code]:whitespace-pre',
          isUser
            ? 'bg-white text-black dark:bg-white/90 max-w-1/2'
            : 'bg-gray-800/60 text-white dark:bg-gray-700/40 max-w-3xl'
        )}
      >
        <Markdown content={content} />
      </motion.div>
    </div>
  )
}
