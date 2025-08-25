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
  } = useChats(chatId)

  const chatRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [attachments, setAttachments] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)

  const { loading, liveMessage, error, handleSend, handleAbort } =
    useMessageStream(activeChatId, chats, setRenamingChatId, updateChatTitle)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const messages: Message[] =
    useLiveQuery(() => {
      if (!activeChatId) return Promise.resolve<Message[]>([])
      return getMessages(activeChatId)
    }, [activeChatId]) ?? []

  useEffect(() => {
    inputRef.current?.focus()
  }, [activeChatId])

  useEffect(() => {
  if (!chatRef.current) return
  chatRef.current.scrollTo({
    top: chatRef.current.scrollHeight,
    behavior: 'smooth',
  })
}, [messages, liveMessage, loading])


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

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setAttachments(prev => [...prev, ...Array.from(e.dataTransfer.files)])
      e.dataTransfer.clearData()
    }
  }

  // --- HeroInput submission ---
  async function handleHeroSubmit(text: string) {
    const newChat = await handleNewChat()
    setActiveChatId(newChat.id)

    // Call rename API immediately
    fetch('/api/rename-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chatId: newChat.id,
        messages: [{ role: 'user', content: text }],
      }),
    })
      .then(async res => {
        if (!res.ok) throw new Error(await res.text())
        return res.json()
      })
      .then(async data => {
        if (data.title) {
          await updateChatTitle(newChat.id, data.title)
        }
      })
      .catch(err => console.error('Rename API error', err))

    await handleSend(text, newChat.id)
  }

  // --- InputBox submission ---
  async function handleUserSubmit(text: string) {
    if (!activeChatId) return

    // If first user message in chat → rename
    if (messages.length === 0) {
      fetch('/api/rename-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: activeChatId,
          messages: [{ role: 'user', content: text }],
        }),
      })
        .then(async res => {
          if (!res.ok) throw new Error(await res.text())
          return res.json()
        })
        .then(async data => {
          if (data.title) {
            await updateChatTitle(activeChatId, data.title)
          }
        })
        .catch(err => console.error('Rename API error', err))
    }

    await handleSend(text, activeChatId)
  }

  return (
    <div
      className="flex h-screen w-screen bg-[#1e1e1e] text-white overflow-hidden relative"
      onDragOver={e => {
        e.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
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
          onSelectChat={id => setActiveChatId(id)}
          onDeleteChat={handleDeleteChat}
          onRenameChat={handleRenameChat}
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
            <div onClick={e => e.stopPropagation()} className="h-full">
              <Sidebar
                chats={chats}
                activeChatId={activeChatId}
                renamingChatId={renamingChatId}
                onNewChat={handleNewChat}
                onSelectChat={id => {
                  setActiveChatId(id)
                  setMobileSidebarOpen(false)
                }}
                onDeleteChat={handleDeleteChat}
                onRenameChat={handleRenameChat}
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
          title={chats.find(c => c.id === activeChatId)?.title || 'No Chat Selected'}
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
            <ScrollButtons containerRef={chatRef} />
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
