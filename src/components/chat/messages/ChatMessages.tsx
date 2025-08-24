'use client'

import { motion } from 'framer-motion'
import { MessageSquare } from 'lucide-react'
import MessageList from './MessageList'
import { Message } from '@/types/chat'

type ChatMessagesProps = {
  activeChatId: string | null
  messages: Message[]
  liveMessage: string | null
  loading: boolean
  containerRef: React.RefObject<HTMLDivElement | null>
}

export default function ChatMessages({
  activeChatId,
  messages,
  liveMessage,
  loading,
  containerRef,
}: ChatMessagesProps) {
  return (
    <main
      ref={containerRef}
      className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent"
    >
      <div className="max-w-3xl mx-auto w-full px-4 pt-4 pb-28 space-y-3 h-full flex flex-col">
        <div className="flex-1 flex flex-col">
          {activeChatId ? (
            messages.length > 0 || liveMessage ? (
              <div className="w-full flex flex-col gap-2">
                {messages.map((msg, i) => (
                  <motion.div
                    key={msg.id || i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <MessageList messages={[msg]} liveMessage={null} />
                  </motion.div>
                ))}

                {liveMessage && (
                  <motion.div
                    key="liveMessage"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <MessageList messages={[]} liveMessage={liveMessage} />
                  </motion.div>
                )}

                {loading && (
                  <motion.div
                    key="loader"
                    className="flex gap-1 px-2 mt-2 items-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-.2s]" />
                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-.4s]" />
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 text-center text-gray-400 w-full">
                <MessageSquare className="w-10 h-10 mb-4 text-indigo-400" />
                <h2 className="text-lg font-semibold">Start your conversation</h2>
                <p className="text-sm mt-2">Type a message below to begin chatting.</p>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 text-center text-gray-500 w-full">
              <h1 className="text-2xl font-bold mb-2">Welcome to Sidekick</h1>
              <p className="text-sm">Start a new chat or select one from the sidebar.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
