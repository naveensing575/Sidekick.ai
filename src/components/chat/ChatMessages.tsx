'use client'

import { motion, AnimatePresence } from 'framer-motion'
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
      <div className="max-w-3xl mx-auto w-full px-4 pt-4 space-y-3 h-full flex flex-col">
        <div className="flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            {activeChatId ? (
              messages.length > 0 || liveMessage ? (
                <motion.div
                  key="messages"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <MessageList messages={messages} liveMessage={liveMessage} />
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center justify-center flex-1 text-center text-gray-400"
                >
                  <MessageSquare className="w-10 h-10 mb-4 text-indigo-400" />
                  <h2 className="text-lg font-semibold">Start your conversation</h2>
                  <p className="text-sm mt-2">Type a message below to begin chatting.</p>
                </motion.div>
              )
            ) : (
              <motion.div
                key="welcome"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center flex-1 text-center text-gray-500"
              >
                <h1 className="text-2xl font-bold mb-2">Welcome to Sidekick</h1>
                <p className="text-sm">Start a new chat or select one from the sidebar.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {loading && (
          <motion.div
            className="flex gap-1 px-2 justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" />
            <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-.2s]" />
            <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-.4s]" />
          </motion.div>
        )}
      </div>
    </main>
  )
}
