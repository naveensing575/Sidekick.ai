import type { Message } from './ChatWindow'
import MessageBubble from './MessageBubble'
import React from 'react'

export default function MessageList({
  messages
}: {
  messages: Message[]
}) {
  return (
    <div role="list" className="flex flex-col gap-3">
      {messages.map((msg) => (
        <MessageBubble
          key={msg.id}
          role={msg.role}
          content={msg.content}
        />
      ))}
    </div>
  )
}
