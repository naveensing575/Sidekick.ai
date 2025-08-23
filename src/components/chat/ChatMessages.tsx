'use client'

import { motion, AnimatePresence } from 'framer-motion'
import MessageList from './MessageList'
import { Message } from './ChatWindow'

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
      className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent pb-20 md:pb-0"
    >
      <div className="max-w-3xl mx-auto w-full px-4 pt-4 space-y-3">
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
                className="text-center text-gray-500 mt-20"
              >
                <p>No messages yet. Say hi 👋</p>
              </motion.div>
            )
          ) : (
            <motion.div
              key="welcome"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-center text-gray-500 mt-20"
            >
              <h1 className="text-2xl font-bold mb-2">Welcome to Sidekick</h1>
              <p className="text-sm">Start a new chat or select one from the sidebar.</p>
            </motion.div>
          )}
        </AnimatePresence>

        {loading && (
          <motion.div
            className="flex gap-1 px-2"
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
