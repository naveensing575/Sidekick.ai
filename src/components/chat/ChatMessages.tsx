'use client'

import { motion, AnimatePresence } from 'framer-motion'
import MessageList from './MessageList'
import HeroInput from './HeroInput'
import { Message } from '@/types/chat'

type ChatMessagesProps = {
  activeChatId: string | null
  messages: Message[]
  liveMessage: string | null
  loading: boolean
  containerRef: React.RefObject<HTMLDivElement | null>
  onHeroSubmit?: (text: string) => void
  onAbort?: () => void
  inputRef?: React.RefObject<HTMLTextAreaElement | null>
  attachments?: File[]
  setAttachments?: React.Dispatch<React.SetStateAction<File[]>>
}

export default function ChatMessages({
  activeChatId,
  messages,
  liveMessage,
  loading,
  containerRef,
  onHeroSubmit,
  onAbort,
  inputRef,
  attachments = [],
  setAttachments = () => {},
}: ChatMessagesProps) {
  return (
    <main
      ref={containerRef}
      className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent"
    >
      <div className="max-w-5xl mx-auto w-full px-4 h-full flex flex-col">
        <AnimatePresence mode="wait">
          {activeChatId ? (
            messages.length > 0 || liveMessage ? (
              <motion.div
                key="messages"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex-1"
              >
                <MessageList messages={messages} liveMessage={liveMessage} />
              </motion.div>
            ) : (
              <motion.div
                key="hero"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-1 justify-center items-center"
              >
                <HeroInput
                  onSubmit={onHeroSubmit ?? (() => {})}
                  onAbort={onAbort ?? (() => {})}
                  loading={loading}
                  inputRef={inputRef ?? { current: null }}
                  attachments={attachments}
                  setAttachments={setAttachments}
                />
              </motion.div>
            )
          ) : (
            <motion.div
              key="welcome"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-1 flex-col justify-center items-center text-gray-500 text-center"
            >
              <h1 className="text-2xl font-bold mb-2">Welcome to Sidekick</h1>
              <p className="text-sm">Start a new chat or select one from the sidebar.</p>
            </motion.div>
          )}
        </AnimatePresence>

        {loading && (
          <motion.div
            className="flex gap-1 px-2 justify-center mt-4"
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
