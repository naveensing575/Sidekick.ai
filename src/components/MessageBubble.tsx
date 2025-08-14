import React from 'react'
import type { Role } from './ChatWindow'
import { Markdown } from '@/utils/markdown'

export default function MessageBubble({
  role,
  content,
}: {
  role: Role
  content: React.ReactNode
}) {
  const isUser = role === 'user'

  return (
    <div
      className={`flex mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}
      role="listitem"
    >
      <div
        className={`
          px-5 py-3 rounded-xl max-w-[90%] shadow-sm border
          ${isUser
            ? 'bg-gray-800 text-gray-100 border-gray-700'
            : 'bg-[#1e1e1e] text-gray-200 border-gray-700'}
        `}
      >
        {isUser
          ? content
          : typeof content === 'string'
          ? <Markdown content={content} />
          : content}
      </div>
    </div>
  )
}
