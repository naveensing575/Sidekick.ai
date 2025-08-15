'use client'

import { useRef, useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import MessageList from './MessageList'
import InputBox from './InputBox'
import Sidebar from './Sidebar'
import { streamChat } from '@/lib/ai'
import { SYSTEM_PROMPTS } from '@/utils/prompts'

export type Role = 'system' | 'user' | 'assistant'

export interface Message {
  id: string
  role: Role
  content: string
}

export default function ChatWindow() {
  const [activePreset, setActivePreset] = useState<'General' | 'Code' | 'Summarizer'>('General')
  const [loading, setLoading] = useState(false)
  const [footerHeight, setFooterHeight] = useState(0)

  const chatRef = useRef<HTMLDivElement | null>(null)
  const footerRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)
  const controllerRef = useRef<AbortController | null>(null)

  const storedSession = useLiveQuery(() => db.sessions.get(activePreset), [activePreset])
  const messages = storedSession?.messages ?? []

  // Auto-scroll on message change or loading state
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [messages, loading])

  // Track footer height so chat area never hides messages behind footer
  useEffect(() => {
    if (!footerRef.current) return
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        setFooterHeight(entry.contentRect.height)
      }
    })
    resizeObserver.observe(footerRef.current)
    return () => resizeObserver.disconnect()
  }, [])

  async function handleSend(text: string) {
    if (!text.trim()) return

    const userMessage: Message = { id: crypto.randomUUID(), role: 'user', content: text.trim() }
    const assistantMessage: Message = { id: crypto.randomUUID(), role: 'assistant', content: '' }
    const newMessages = [...messages, userMessage]

    await db.sessions.put({ preset: activePreset, messages: newMessages })
    setLoading(true)

    const systemMessage: Message = {
      id: 'system-prompt',
      role: 'system',
      content: SYSTEM_PROMPTS[activePreset] ?? SYSTEM_PROMPTS.General,
    }

    controllerRef.current?.abort()
    controllerRef.current = new AbortController()
    let streamFinished = false

    try {
      const reader = await streamChat(
        [systemMessage, ...newMessages.map(({ role, content }) => ({ role, content }))],
        controllerRef.current.signal
      )

      const decoder = new TextDecoder()
      let fullContent = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          streamFinished = true
          break
        }
        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n').filter(line => line.startsWith('data: '))
        for (const line of lines) {
          const data = line.slice(6).trim()
          if (data === '[DONE]') {
            streamFinished = true
            break
          }
          try {
            const json = JSON.parse(data)
            const delta = json?.choices?.[0]?.delta?.content
            if (delta) {
              fullContent += delta
              const updatedMessages = [...newMessages, { ...assistantMessage, content: fullContent }]
              await db.sessions.put({ preset: activePreset, messages: updatedMessages })
            }
          } catch {}
        }
      }
    } catch {
      await db.sessions.put({
        preset: activePreset,
        messages: [...newMessages, { ...assistantMessage, content: 'Something went wrong.' }]
      })
    } finally {
      setLoading(false)
      if (streamFinished) setTimeout(() => inputRef.current?.focus(), 0)
      controllerRef.current = null
    }
  }

  function handleAbort() {
    controllerRef.current?.abort()
  }

  return (
    <div className="flex h-screen bg-[#1e1e1e] text-white">
      <Sidebar chats={[]} activeChatId={''} onNewChat={() => {}} onSelectChat={() => {}} />

      <div className="flex flex-col flex-1">
        {/* Chat area with scrollbar always far right */}
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

        {/* Footer aligned to chat width */}
        <div ref={footerRef} className="bg-[#1e1e1e] px-6 py-4">
          <div className="max-w-3xl mx-auto w-full">
            <InputBox
              onSubmit={handleSend}
              onAbort={handleAbort}
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
