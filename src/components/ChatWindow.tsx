'use client'

import { useEffect, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, createChat, addMessage, getMessages } from '@/lib/db'
import Sidebar from './Sidebar'
import MessageList from './MessageList'
import InputBox from './InputBox'
import { streamChat } from '@/lib/ai'
import { motion, AnimatePresence } from 'framer-motion'

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
  const [chats, setChats] = useState<ChatType[]>([])
  const [activeChatId, setActiveChatId] = useState<string | null>(chatId ?? null)
  const [loading, setLoading] = useState(false)
  const [footerHeight, setFooterHeight] = useState(0)
  const [renamingChatId, setRenamingChatId] = useState<string | null>(null)
  const [liveMessage, setLiveMessage] = useState<string | null>(null)

  const chatRef = useRef<HTMLDivElement | null>(null)
  const footerRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)
  const controllerRef = useRef<AbortController | null>(null)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const messages = useLiveQuery(() => {
    if (!activeChatId) return Promise.resolve([])
    return getMessages(activeChatId)
  }, [activeChatId]) ?? []

  // restore chatId
  useEffect(() => {
    if (!chatId) {
      const saved = localStorage.getItem('activeChatId')
      if (saved) setActiveChatId(saved)
    }
  }, [chatId])

  useEffect(() => {
    if (activeChatId) localStorage.setItem('activeChatId', activeChatId)
  }, [activeChatId])

  // load chats
  useEffect(() => {
    const load = async () => {
      const all = await db.chats.orderBy('updatedAt').reverse().toArray()
      setChats(all)
      if (!activeChatId && all.length) setActiveChatId(all[0].id)
    }
    load()
  }, [activeChatId])

  useEffect(() => {
    inputRef.current?.focus()
  }, [activeChatId])

  // auto-create chat on typing
  useEffect(() => {
    const handler = async (e: KeyboardEvent) => {
      if (!activeChatId && e.key.length === 1 && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        const newChat = await createChat()
        await db.chats.update(newChat.id, { title: 'Untitled' })
        const updated = await db.chats.orderBy('updatedAt').reverse().toArray()
        setChats(updated)
        setActiveChatId(newChat.id)
        setTimeout(() => inputRef.current?.focus(), 0)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [activeChatId])

  useEffect(() => {
    if (!footerRef.current) return
    const obs = new ResizeObserver(([entry]) => {
      setFooterHeight(entry.contentRect.height)
    })
    obs.observe(footerRef.current)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [messages, liveMessage, loading])

  const handleNewChat = async () => {
    const chat = await createChat()
    const all = await db.chats.orderBy('updatedAt').reverse().toArray()
    setChats(all)
    setActiveChatId(chat.id)
    inputRef.current?.focus()
  }

  const handleDeleteChat = async (id: string) => {
    await db.messages.where('chatId').equals(id).delete()
    await db.chats.delete(id)
    const updated = await db.chats.orderBy('updatedAt').reverse().toArray()
    setChats(updated)
    setActiveChatId(updated[0]?.id || null)
    inputRef.current?.focus()
  }

  const handleRenameChat = async (id: string, newTitle: string) => {
    const trimmed = newTitle.trim()
    if (!trimmed) return
    await db.chats.update(id, { title: trimmed, updatedAt: Date.now() })
    setChats(prev =>
      prev.map(c => (c.id === id ? { ...c, title: trimmed, updatedAt: Date.now() } : c))
    )
  }

  const handleSend = async (text: string) => {
    if (!text.trim() || !activeChatId) return
    const userMessage: Message = { id: crypto.randomUUID(), role: 'user', content: text.trim() }
    await addMessage(activeChatId, 'user', text)
    setLoading(true)
    setLiveMessage(null)

    const systemMessage = { id: 'system', role: 'system' as Role, content: DEFAULT_SYSTEM_PROMPT }
    const existing = await getMessages(activeChatId)
    const chatMessages = [systemMessage, ...existing, userMessage].map(({ role, content }) => ({ role, content }))

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
              setLiveMessage(fullResponse) // ✅ streaming live text
            }
          } catch {}
        }
      }
    } catch {
      fullResponse = 'Something went wrong.'
    } finally {
      if (fullResponse.trim()) {
        const clean = sanitizeResponse(fullResponse)
        await addMessage(activeChatId, 'assistant', clean)
        setLiveMessage(null) // ✅ done typing
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
                await db.chats.update(activeChatId, { title: data.title, updatedAt: Date.now() })
                setChats(prev =>
                  prev.map(c => (c.id === activeChatId ? { ...c, title: data.title, updatedAt: Date.now() } : c))
                )
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

  return (
    <div className="flex h-screen bg-[#1e1e1e] text-white">
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        renamingChatId={renamingChatId}
        onNewChat={handleNewChat}
        onSelectChat={id => setActiveChatId(id)}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
      />

      <motion.div
        className="flex flex-col flex-1"
        key={activeChatId}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        {/* Title bar */}
        <motion.div
          className="flex items-center justify-center border-b border-gray-700 h-14 font-semibold text-gray-400 text-sm"
          key={activeChatId ? chats.find(c => c.id === activeChatId)?.title : 'empty'}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          {chats.find(c => c.id === activeChatId)?.title || 'No Chat Selected'}
        </motion.div>

        {/* Messages */}
        <main
          ref={chatRef}
          className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent"
          style={{ paddingBottom: `${footerHeight}px` }}
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
                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" />
              </motion.div>
            )}
          </div>
        </main>

        {/* Footer */}
        <div ref={footerRef} className="bg-[#1e1e1e] px-6 py-4">
          <div className="max-w-3xl mx-auto w-full">
            {activeChatId && (
              <InputBox
                onSubmit={handleSend}
                onAbort={() => controllerRef.current?.abort()}
                loading={loading}
                ref={inputRef}
              />
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
