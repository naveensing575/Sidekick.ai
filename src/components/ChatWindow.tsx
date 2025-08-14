'use client'
import { useState, useRef, useEffect } from 'react'
import MessageList from './MessageList'
import InputBox from './InputBox'
import PresetSwitcher from './PresetSwitcher'
import { streamChat } from '@/lib/ai'

export type Role = 'system' | 'user' | 'assistant'

export interface Message {
  id: string
  role: Role
  content: string
}

const SYSTEM_PROMPTS: Record<string, string> = {
  General: 'You are a helpful assistant.',
  Code: 'You are a helpful coding assistant. Provide detailed explanations and code examples.',
  Summarizer: 'You are a summarization assistant. Provide concise summaries of any given text.',
}

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [activePreset, setActivePreset] = useState<'General' | 'Code' | 'Summarizer'>('General')
  const chatRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)
  const controllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    const focusInput = () => inputRef.current?.focus()
    focusInput()
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') focusInput()
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
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
    setMessages((prev) => [...prev, userMessage])
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
        [
          systemMessage,
          ...messages.filter((m) => m.role !== 'system').map(({ role, content }) => ({ role, content })),
          { role: 'user', content: text.trim() },
        ],
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
              setMessages((prev) => {
                if (!prev.find((m) => m.id === assistantMessage.id)) {
                  return [...prev, { ...assistantMessage, content: fullContent }]
                }
                return prev.map((msg) =>
                  msg.id === assistantMessage.id
                    ? { ...msg, content: fullContent }
                    : msg
                )
              })
            }
          } catch {}
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setMessages((prev) => [...prev, { ...assistantMessage, content: '[Response aborted]' }])
      } else {
        setMessages((prev) => [...prev, { ...assistantMessage, content: 'Something went wrong.' }])
      }
    } finally {
      setLoading(false)
      if (streamFinished) {
        setTimeout(() => inputRef.current?.focus(), 0)
      }
      controllerRef.current = null
    }
  }

  function handleAbort() {
    controllerRef.current?.abort()
  }

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      <header className="px-4 py-2 border-b font-semibold flex justify-between items-center bg-black">
        <div className="text-white text-lg">sidekick</div>
      </header>

      <main ref={chatRef} className="flex-1 overflow-y-auto px-4 pt-4 pb-28 space-y-3">
        <PresetSwitcher active={activePreset} onChange={setActivePreset} />
        <MessageList messages={messages} />
        {loading && (
          <div className="flex items-start gap-2">
            <div className="bg-[#1c1c1e] text-white px-4 py-2 rounded-xl max-w-md animate-pulse">
              <div className="flex gap-1">
                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 w-full border-t bg-black p-4">
        <InputBox
          onSubmit={handleSend}
          onAbort={handleAbort}
          disabled={false}
          loading={loading}
          ref={inputRef}
        />
      </footer>
    </div>
  )
}
