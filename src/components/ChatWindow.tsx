'use client'

import { useEffect, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, createChat, addMessage, getMessages } from '@/lib/db'
import Sidebar from './Sidebar'
import MessageList from './MessageList'
import InputBox from './InputBox'
import { streamChat } from '@/lib/ai'

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

  const chatRef = useRef<HTMLDivElement | null>(null)
  const footerRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)
  const controllerRef = useRef<AbortController | null>(null)

  const messages = useLiveQuery(() => {
    if (!activeChatId) return Promise.resolve([])
    return getMessages(activeChatId)
  }, [activeChatId]) ?? []

  // Restore chatId if not from props
  useEffect(() => {
    if (!chatId) {
      const savedChatId = localStorage.getItem('activeChatId')
      if (savedChatId) setActiveChatId(savedChatId)
    }
  }, [chatId])

  useEffect(() => {
    if (activeChatId) localStorage.setItem('activeChatId', activeChatId)
  }, [activeChatId])

  // Load chats
  useEffect(() => {
    const loadChats = async () => {
      const allChats = await db.chats.orderBy('updatedAt').reverse().toArray()
      setChats(allChats)
      if (!activeChatId && allChats.length) setActiveChatId(allChats[0].id)
    }
    loadChats()
  }, [activeChatId])

  useEffect(() => {
    inputRef.current?.focus()
  }, [activeChatId])

  // Auto-create chat on typing
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (!activeChatId && e.key.length === 1 && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        const newChat = await createChat()
        await db.chats.update(newChat.id, { title: 'Untitled' })
        const updatedChats = await db.chats.orderBy('updatedAt').reverse().toArray()
        setChats(updatedChats)
        setActiveChatId(newChat.id)
        setTimeout(() => inputRef.current?.focus(), 0)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeChatId])

  useEffect(() => {
    if (!footerRef.current) return
    const observer = new ResizeObserver(([entry]) => {
      setFooterHeight(entry.contentRect.height)
    })
    observer.observe(footerRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [messages, loading])

  const handleNewChat = async () => {
    const chat = await createChat()
    const allChats = await db.chats.orderBy('updatedAt').reverse().toArray()
    setChats(allChats)
    setActiveChatId(chat.id)
    inputRef.current?.focus()
  }

  const handleDeleteChat = async (id: string) => {
    await db.messages.where('chatId').equals(id).delete()
    await db.chats.delete(id)
    const updatedChats = await db.chats.orderBy('updatedAt').reverse().toArray()
    setChats(updatedChats)
    const nextChat = updatedChats[0]
    setActiveChatId(nextChat?.id || null)
    inputRef.current?.focus()
  }

  const handleRenameChat = async (id: string, newTitle: string) => {
    // persist to DB
    await db.chats.update(id, { title: newTitle, updatedAt: Date.now() })
    // update local state
    setChats(prev =>
      prev.map(c => (c.id === id ? { ...c, title: newTitle, updatedAt: Date.now() } : c))
    )
  }

  const handleSend = async (text: string) => {
    if (!text.trim() || !activeChatId) return
    const userMessage: Message = { id: crypto.randomUUID(), role: 'user', content: text.trim() }

    await addMessage(activeChatId, 'user', text)
    setLoading(true)

    const systemMessage = { id: 'system', role: 'system' as Role, content: DEFAULT_SYSTEM_PROMPT }
    const existingMessages = await getMessages(activeChatId)
    const chatMessages = [systemMessage, ...existingMessages, userMessage].map(
      ({ role, content }) => ({ role, content })
    )

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
        const lines = chunk.split('\n').filter(line => line.startsWith('data: '))
        for (const line of lines) {
          const data = line.slice(6).trim()
          if (!data || data === '[DONE]') continue
          try {
            const json = JSON.parse(data)
            const delta = json.choices?.[0]?.delta?.content
            if (delta) fullResponse += delta
          } catch {}
        }
      }
    } catch {
      fullResponse = 'Something went wrong.'
    } finally {
      if (fullResponse.trim()) {
        const clean = sanitizeResponse(fullResponse)
        await addMessage(activeChatId, 'assistant', clean)

        // 🔹 Auto-rename if Untitled
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
                // persist title
                await db.chats.update(activeChatId, { title: data.title, updatedAt: Date.now() })
                // update state
                setChats(prev =>
                  prev.map(c =>
                    c.id === activeChatId ? { ...c, title: data.title, updatedAt: Date.now() } : c
                  )
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
        onSelectChat={(id) => setActiveChatId(id)}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
      />
      <div className="flex flex-col flex-1">
        <div className="flex items-center justify-center border-b border-gray-700 h-14 font-semibold text-gray-400 text-sm">
          {chats.find(c => c.id === activeChatId)?.title || 'No Chat Selected'}
        </div>
        <main
          ref={chatRef}
          className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent"
          style={{ paddingBottom: `${footerHeight}px` }}
        >
          <div className="max-w-3xl mx-auto w-full px-4 pt-4 space-y-3">
            {activeChatId ? (
              <>
                <MessageList messages={messages} />
                {loading && (
                  <div className="flex gap-1 px-2">
                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" />
                  </div>
                )}
              </>
            ) : (
              <div className="text-center text-gray-500 mt-20">
                <h1 className="text-2xl font-bold mb-2">Welcome to Sidekick</h1>
                <p className="text-sm">Start a new chat or select one from the sidebar.</p>
              </div>
            )}
          </div>
        </main>
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
      </div>
    </div>
  )
}
