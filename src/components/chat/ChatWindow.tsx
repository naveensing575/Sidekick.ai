'use client'

import { useEffect, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { getMessages } from '@/lib/db'
import Sidebar from '@/components/sidebar/Sidebar'
import { motion, AnimatePresence } from 'framer-motion'
import ErrorAlert from './ErrorAlert'
import { FileHeart } from 'lucide-react'
import ChatHeader from './ChatHeader'
import ChatMessages from './messages/ChatMessages'
import ChatFooter from './ChatFooter'
import HeroInput from './HeroInput'
import { useChats } from '@/hooks/useChats'
import { useMessageStream } from '@/hooks/useMessageStream'
import ScrollButtons from './ScrollButtons'
import { useDragAndDrop } from '@/hooks/useDragAndDrop'
import { useAutoScroll } from '@/hooks/useAutoScroll'
import type { Message } from '@/types/chat'

export default function ChatWindow({ chatId }: { chatId?: string }) {
  const {
    chats,
    activeChatId,
    setActiveChatId,
    renamingChatId,
    setRenamingChatId,
    handleNewChat,
    handleDeleteChat,
    handleRenameChat,
    updateChatTitle,
    reorderChats,
  } = useChats(chatId)

  const chatRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [attachments, setAttachments] = useState<File[]>([])

  const { loading, liveMessage, error, handleSend, handleAbort } =
    useMessageStream(activeChatId, chats, setRenamingChatId, updateChatTitle)

  const messages: Message[] =
    useLiveQuery(() => {
      if (!activeChatId) return Promise.resolve<Message[]>([])
      return getMessages(activeChatId)
    }, [activeChatId]) ?? []

  const { isDragging, handleDragOver, handleDragLeave, handleDrop } =
    useDragAndDrop((files) => setAttachments((prev) => [...prev, ...files]))

  useAutoScroll(chatRef, [messages, liveMessage, loading])

  useEffect(() => {
    inputRef.current?.focus()
  }, [activeChatId])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key.length !== 1) return
      if (document.activeElement !== inputRef.current) {
        e.preventDefault()
        inputRef.current?.focus()
        const textarea = inputRef.current
        if (textarea) {
          const start = textarea.selectionStart || 0
          const end = textarea.selectionEnd || 0
          const value = textarea.value
          textarea.value = value.slice(0, start) + e.key + value.slice(end)
          textarea.setSelectionRange(start + 1, start + 1)
          textarea.dispatchEvent(new Event('input', { bubbles: true }))
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  async function handleHeroSubmit(text: string) {
    const newChat = await handleNewChat()
    setActiveChatId(newChat.id)
    await handleSend(text, newChat.id)
  }

  async function handleUserSubmit(text: string) {
    if (!activeChatId) return
    await handleSend(text, activeChatId)
  }

  return (
    <div
      className="flex h-screen w-screen bg-[#1e1e1e] text-white overflow-hidden relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <AnimatePresence>
        {isDragging && (
          <motion.div
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <FileHeart className="w-16 h-16 text-slate-300 mb-4" />
            <div className="text-lg font-semibold text-white bg-slate-800 px-6 py-3 rounded-lg shadow-lg">
              Drop files to attach
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="hidden md:flex">
        <Sidebar
          chats={chats}
          activeChatId={activeChatId}
          renamingChatId={renamingChatId}
          onNewChat={handleNewChat}
          onSelectChat={(id) => setActiveChatId(id)}
          onDeleteChat={handleDeleteChat}
          onRenameChat={handleRenameChat}
          onReorderChats={reorderChats}
        />
      </div>

      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.div
            className="fixed inset-0 z-[9999] bg-black/60 flex md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileSidebarOpen(false)}
          >
            <div onClick={(e) => e.stopPropagation()} className="h-full">
              <Sidebar
                chats={chats}
                activeChatId={activeChatId}
                renamingChatId={renamingChatId}
                onNewChat={handleNewChat}
                onSelectChat={(id) => {
                  setActiveChatId(id)
                  setMobileSidebarOpen(false)
                }}
                onDeleteChat={handleDeleteChat}
                onRenameChat={handleRenameChat}
                onReorderChats={reorderChats}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="flex flex-col flex-1 relative"
        key={activeChatId}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <ChatHeader
          title={chats.find((c) => c.id === activeChatId)?.title || 'No Chat Selected'}
          onOpenSidebar={() => setMobileSidebarOpen(true)}
        />

        {error && <ErrorAlert message={error} />}

        {activeChatId ? (
          <>
            <ChatMessages
              containerRef={chatRef}
              activeChatId={activeChatId}
              messages={messages}
              liveMessage={liveMessage}
              loading={loading}
            />
            <ScrollButtons containerRef={chatRef} isStreaming={loading} />
            <ChatFooter
              activeChatId={activeChatId}
              onSubmit={handleUserSubmit}
              onAbort={handleAbort}
              loading={loading}
              inputRef={inputRef}
              attachments={attachments}
              setAttachments={setAttachments}
            />
          </>
        ) : (
          <HeroInput
            onSubmit={handleHeroSubmit}
            onAbort={handleAbort}
            loading={loading}
            inputRef={inputRef}
            attachments={attachments}
            setAttachments={setAttachments}
          />
        )}
      </motion.div>
    </div>
  )
}
