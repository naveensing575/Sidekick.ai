import type { Message } from './chat/ChatWindow'
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
    <div role="list" className="flex flex-col gap-3">
      {messages.map((msg) => (
        <MessageBubble
          key={msg.id}
          role={msg.role}
          content={msg.content}
          isLive={false} // ✅ old messages are direct
        />
      ))}

      {/* Render live streaming message */}
      {liveMessage && (
        <MessageBubble
          key="live"
          role="assistant"
          content={liveMessage}
          isLive={true} // ✅ only this animates
        />
      )}
    </div>
  )
}
