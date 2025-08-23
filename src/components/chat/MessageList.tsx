import type { Message } from '@/types/chat'
import MessageBubble from './MessageBubble'
import React from 'react'

export default function MessageList({
  messages,
  liveMessage,
}: {
  messages: Message[]
  liveMessage?: string | null
}) {
  return (
    <div role="list" className="flex flex-col gap-3 mb-4">
      {messages.map((msg) => (
        <MessageBubble
          key={msg.id}
          role={msg.role}
          content={msg.content}
        />
      ))}

      {/* Render live streaming message */}
      {liveMessage && (
        <MessageBubble
          key="live"
          role="assistant"
          content={liveMessage}
        />
      )}
    </div>
  )
}
