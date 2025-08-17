'use client'

import { Markdown } from '@/utils/markdown'
import { Role } from './ChatWindow'
import { cn } from '@/lib/utils'

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
      <div
        className={cn(
          'px-4 py-2 rounded-2xl text-sm backdrop-blur-md',
          'whitespace-pre-wrap break-words',
          isUser
            ? 'bg-white text-black dark:bg-white/90 max-w-1/2'
            : 'bg-gray-800/60 text-white dark:bg-gray-700/40 max-w-3xl'
        )}
        style={{
          wordBreak: 'break-word',
        }}
      >
        <Markdown content={content} />
      </div>
    </div>
  )
}
