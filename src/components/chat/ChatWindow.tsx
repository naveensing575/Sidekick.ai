'use client'
import { useEffect, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { getMessages } from '@/lib/db'
import Sidebar from '@/components/sidebar/Sidebar'
import { motion, AnimatePresence } from 'framer-motion'
import ErrorAlert from './ErrorAlert'
import { FileHeart, Sparkles } from 'lucide-react'
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

  // Auto-select latest chat on initial render
  useEffect(() => {
    if (!chatId && !activeChatId && chats.length > 0) {
      // Sort chats by latest first and select the most recent one
      const sortedChats = [...chats].sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt || a.id).getTime()
        const dateB = new Date(b.updatedAt || b.createdAt || b.id).getTime()
        return dateB - dateA
      })
      setActiveChatId(sortedChats[0].id)
    }
  }, [chats, activeChatId, chatId, setActiveChatId])

  useEffect(() => {
    inputRef.current?.focus()
  }, [activeChatId])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ignore modifier key combinations
      if (e.metaKey || e.ctrlKey || e.altKey) return

      // Only handle single character keys
      if (e.key.length !== 1) return

      // Check if the active element is an input, textarea, or contenteditable
      const activeElement = document.activeElement as HTMLElement
      if (
        activeElement &&
        (activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          activeElement.contentEditable === 'true' ||
          activeElement.closest('[contenteditable="true"]'))
      ) {
        return // Don't interfere with existing input elements
      }

      // Only proceed if the main chat input is not focused
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
      className="flex h-screen w-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag and Drop Overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="flex flex-col items-center"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mb-6 shadow-2xl">
                <FileHeart className="w-10 h-10 text-white" />
              </div>
              <div className="text-xl font-semibold text-white bg-slate-800/80 backdrop-blur-sm px-8 py-4 rounded-2xl shadow-xl border border-slate-600/50">
                Drop files to attach
              </div>
              <p className="text-slate-300 mt-3 text-sm">Support for images, documents, and more</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
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

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.div
            className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileSidebarOpen(false)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              className="h-full"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <motion.div
        className="flex flex-col flex-1 relative backdrop-blur-sm bg-slate-900/30"
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

        {/* Error Alert with Better Styling */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mx-4 mt-2"
            >
              <ErrorAlert message={error} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Area */}
        {chats.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="flex-1"
          >
            <HeroInput
              onSubmit={handleHeroSubmit}
              onAbort={handleAbort}
              loading={loading}
              inputRef={inputRef}
              attachments={attachments}
              setAttachments={setAttachments}
            />
          </motion.div>
        ) : activeChatId ? (
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex items-center justify-center"
          >
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-medium mb-2">Select a conversation</h3>
              <p className="text-slate-400 max-w-sm">
                Choose a chat from the sidebar to continue your conversation with Sidekick AI
              </p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}