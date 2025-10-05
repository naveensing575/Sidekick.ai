import type { Message } from '@/types/chat'
import MessageBubble from './MessageBubble'
import React from 'react'

interface MessageListProps {
  messages: Message[]
  liveMessage?: string | null
  onEdit?: (messageId: string, newContent: string) => void
  onRegenerate?: (messageId: string) => void
}

export default function MessageList({
  messages,
  liveMessage,
  onEdit,
  onRegenerate,
}: MessageListProps) {
  // Find the last user message to enable regenerate
  const lastUserMessageIndex = messages.map(m => m.role).lastIndexOf('user')

  return (
    <div role="list" className="flex flex-col gap-3 mb-4">
      {messages.map((msg, index) => {
        // Check if this is the last assistant message after the last user message
        const isLatestAssistantMessage =
          msg.role === 'assistant' &&
          index === messages.length - 1 &&
          lastUserMessageIndex !== -1

        return (
          <MessageBubble
            key={msg.id}
            id={msg.id}
            role={msg.role}
            content={msg.content}
            onEdit={onEdit}
            onRegenerate={isLatestAssistantMessage ? () => onRegenerate?.(msg.id) : undefined}
            isLatestUserMessage={isLatestAssistantMessage}
          />
        )
      })}

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
