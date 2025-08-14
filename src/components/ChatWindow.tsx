'use client'
import { useState, useRef, useEffect } from 'react'
import MessageList from './MessageList'
import InputBox from './InputBox'
import PresetSwitcher from './PresetSwitcher'
import { streamChat } from '@/lib/ai'

export type Role = 'user' | 'assistant'
export interface Message {
  id: string
  role: Role
  content: string
}

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const chatRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const focusInput = () => inputRef.current?.focus()
    focusInput()
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        focusInput()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  async function handleSend(text: string) {
    if (!text.trim()) return
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text.trim(),
    }
    const assistantMessage: Message = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '',
    }
    setMessages((prev) => [...prev, userMessage, assistantMessage])
    setLoading(true)
    try {
      const reader = await streamChat([
        ...messages.map(({ role, content }) => ({ role, content })),
        { role: 'user', content: text.trim() },
      ])
      const decoder = new TextDecoder()
      let fullContent = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n').filter(line => line.startsWith('data: '))
        for (const line of lines) {
          const data = line.slice(6).trim()
          if (data === '[DONE]') continue
          try {
            const json = JSON.parse(data)
            const delta = json?.choices?.[0]?.delta?.content
            if (delta) {
              fullContent += delta
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMessage.id
                    ? { ...msg, content: fullContent }
                    : msg
                )
              )
            }
          } catch {}
        }
      }
    } catch {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessage.id
            ? { ...msg, content: 'Something went wrong.' }
            : msg
        )
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="px-4 py-2 border-b font-semibold">sidekick</header>
      <main ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        <PresetSwitcher />
        <MessageList messages={messages} />
      </main>
      <footer className="border-t px-4 py-3">
        <InputBox onSubmit={handleSend} disabled={loading} ref={inputRef} />
      </footer>
    </div>
  )
}
