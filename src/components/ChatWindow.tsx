'use client'

import { useEffect, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, createChat, addMessage, getMessages } from '@/lib/db'
import Sidebar from './Sidebar'
import MessageList from './MessageList'
import InputBox from './InputBox'
import { streamChat } from '@/lib/ai'
import { SYSTEM_PROMPTS } from '@/utils/prompts'


export type Role = 'system' | 'user' | 'assistant'

export interface Message {
  id: string
  role: Role
  content: string
}

export type ChatType = {
  id: string
  preset: 'General' | 'Code' | 'Summarizer'
  title: string
  createdAt: number
  updatedAt: number
}

export default function ChatWindow() {
  const [chats, setChats] = useState<ChatType[]>([])
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [footerHeight, setFooterHeight] = useState(0)
  const [activePreset, setActivePreset] = useState<'General' | 'Code' | 'Summarizer'>('General')

  const chatRef = useRef<HTMLDivElement | null>(null)
  const footerRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)
  const controllerRef = useRef<AbortController | null>(null)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const messages = useLiveQuery(() => {
    if (!activeChatId) return Promise.resolve([])
    return getMessages(activeChatId)
  }, [activeChatId]) ?? []

  // Load chats
  useEffect(() => {
    const loadChats = async () => {
      const allChats = await db.chats.orderBy('updatedAt').reverse().toArray()
      setChats(allChats)
      if (!activeChatId && allChats.length) {
        setActiveChatId(allChats[0].id)
        setActivePreset(allChats[0].preset)
      }
    }
    loadChats()
  }, [activeChatId])

  // Footer height tracking
  useEffect(() => {
    if (!footerRef.current) return
    const observer = new ResizeObserver(([entry]) => {
      setFooterHeight(entry.contentRect.height)
    })
    observer.observe(footerRef.current)
    return () => observer.disconnect()
  }, [])

  // Scroll to bottom
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [messages, loading])

  const handleNewChat = async () => {
    const chat = await createChat('General')
    const allChats = await db.chats.orderBy('updatedAt').reverse().toArray()
    setChats(allChats)
    setActiveChatId(chat.id)
    setActivePreset('General')
  }

  const handleDeleteChat = async (chatId: string) => {
    await db.messages.where('chatId').equals(chatId).delete()
    await db.chats.delete(chatId)
    const updatedChats = await db.chats.orderBy('updatedAt').reverse().toArray()
    setChats(updatedChats)
    const nextChat = updatedChats[0]
    setActiveChatId(nextChat?.id || null)
    setActivePreset(nextChat?.preset || 'General')
  }

  const handleRenameChat = async (chatId: string) => {
    const newTitle = prompt('Enter new title')
    if (newTitle) {
      await db.chats.update(chatId, { title: newTitle, updatedAt: Date.now() })
      const updated = await db.chats.orderBy('updatedAt').reverse().toArray()
      setChats(updated)
    }
  }

  const handleSend = async (text: string) => {
    if (!text.trim() || !activeChatId) return
    const userMessage: Message = { id: crypto.randomUUID(), role: 'user', content: text.trim() }

    await addMessage(activeChatId, 'user', text)
    setLoading(true)

    const systemMessage = {
      id: 'system',
      role: 'system' as Role,
      content: SYSTEM_PROMPTS[activePreset],
    }

    const existingMessages = await getMessages(activeChatId)
    const chatMessages = [systemMessage, ...existingMessages, userMessage].map(({ role, content }) => ({
      role,
      content
    }))

    controllerRef.current?.abort()
    controllerRef.current = new AbortController()

    let fullResponse = ''
    try {
      const reader = await streamChat(chatMessages, controllerRef.current.signal)
      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n').filter(line => line.startsWith('data: '))
        for (const line of lines) {
          const data = line.slice(6).trim()
          if (data === '[DONE]') break
          const json = JSON.parse(data)
          const delta = json.choices?.[0]?.delta?.content
          if (delta) {
            fullResponse += delta
          }
        }
      }
    } catch {
      fullResponse = 'Something went wrong.'
    } finally {
      await addMessage(activeChatId, 'assistant', fullResponse)
      setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }

  return (
    <div className="flex h-screen bg-[#1e1e1e] text-white">
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        onNewChat={handleNewChat}
        onSelectChat={(id) => {
          setActiveChatId(id)
          const chat = chats.find(c => c.id === id)
          if (chat) setActivePreset(chat.preset)
        }}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
      />

      <div className="flex flex-col flex-1">
        {/* Header */}
        <div className="border-b border-gray-700 text-center py-2 font-semibold text-gray-400 text-sm">
          {chats.find(c => c.id === activeChatId)?.title || 'No Chat Selected'}
        </div>

        {/* Chat area */}
        <main
          ref={chatRef}
          className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent"
          style={{ paddingBottom: `${footerHeight}px` }}
        >
          <div className="max-w-3xl mx-auto w-full px-4 pt-4 space-y-3">
            <MessageList messages={messages} />
            {loading && (
              <div className="flex gap-1 px-2">
                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" />
              </div>
            )}
          </div>
        </main>

        {/* Footer input */}
        <div ref={footerRef} className="bg-[#1e1e1e] px-6 py-4">
          <div className="max-w-3xl mx-auto w-full">
            <InputBox
              onSubmit={handleSend}
              onAbort={() => controllerRef.current?.abort()}
              disabled={loading}
              loading={loading}
              ref={inputRef}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
