'use client'

import { useEffect, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { addMessage, getMessages } from '@/lib/db'
import Sidebar from '../Sidebar'
import { streamChat } from '@/lib/ai'
import { motion, AnimatePresence } from 'framer-motion'
import ErrorAlert from './ErrorAlert'
import { FileHeart } from 'lucide-react'
import ChatHeader from './ChatHeader'
import ChatMessages from './ChatMessages'
import ChatFooter from './ChatFooter'
import { useChats } from '@/hooks/useChats'
import ScrollButtons from './ScrollButtons'

export type Role = 'system' | 'user' | 'assistant'

export interface Message {
  id: string
  role: Role
  content: string
}

export type ChatType = {
  id: string
  title: string
  createdAt: number
  updatedAt: number
}

const DEFAULT_SYSTEM_PROMPT = `
You are Sidekick, a helpful AI assistant.
- Always provide correct, accurate, and up-to-date information.
- Keep responses clear and concise.
- Use a professional tone.
- Avoid repetitive or excessive emojis (use at most one if necessary).
`

function sanitizeResponse(text: string) {
  return text.replace(/(\p{Emoji_Presentation}|\p{Emoji}\uFE0F){3,}/gu, match => match[0])
}

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

  const [loading, setLoading] = useState(false)
  const [liveMessage, setLiveMessage] = useState<string | null>(null)
  const [error, setError] = useState<string>('')
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [attachments, setAttachments] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)

  const chatRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)
  const controllerRef = useRef<AbortController | null>(null)

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
    chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [messages, liveMessage, loading])

  const handleSend = async (text: string) => {
    if (!text.trim() || !activeChatId) return
    setError('')
    const userMessage: Message = { id: crypto.randomUUID(), role: 'user', content: text.trim() }
    await addMessage(activeChatId, 'user', text)
    setLoading(true)
    setLiveMessage(null)

    const systemMessage = { id: 'system', role: 'system' as Role, content: DEFAULT_SYSTEM_PROMPT }
    const existing = await getMessages(activeChatId)
    const chatMessages = [systemMessage, ...existing, userMessage].map(({ role, content }) => ({
      role,
      content,
    }))

    const controller = new AbortController()
    controllerRef.current = controller
    let fullResponse = ''

    try {
      const reader = await streamChat(chatMessages, controller.signal)
      const decoder = new TextDecoder()
      while (true) {
        if (controller.signal.aborted) break
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n').filter(l => l.startsWith('data: '))
        for (const l of lines) {
          const data = l.slice(6).trim()
          if (!data || data === '[DONE]') continue
          try {
            const json = JSON.parse(data)
            const delta = json.choices?.[0]?.delta?.content
            if (delta) {
              fullResponse += delta
              setLiveMessage(fullResponse)
            }
          } catch {}
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong while streaming.')
    } finally {
      if (!controller.signal.aborted && fullResponse.trim()) {
        const clean = sanitizeResponse(fullResponse)
        await addMessage(activeChatId, 'assistant', clean)
        setLiveMessage(null)

        const currentChat = chats.find(c => c.id === activeChatId)
        if (currentChat && (currentChat.title === 'Untitled' || !currentChat.title)) {
          setRenamingChatId(activeChatId)
          fetch('/api/rename-chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chatId: activeChatId,
              messages: [...messages, { role: 'assistant', content: clean }],
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
            .finally(() => setRenamingChatId(null))
        }
      }
      setLoading(false)
      controllerRef.current = null
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setAttachments(prev => [...prev, ...Array.from(e.dataTransfer.files)])
      e.dataTransfer.clearData()
    }
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
          onSubmit={handleSend}
          onAbort={() => controllerRef.current?.abort()}
          loading={loading}
          inputRef={inputRef}
          attachments={attachments}
          setAttachments={setAttachments}
        />
      </motion.div>
    </div>
  )
}
