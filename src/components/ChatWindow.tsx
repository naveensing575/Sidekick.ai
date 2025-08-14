'use client'
import { useRef, useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
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
  const [activePreset, setActivePreset] = useState<'General' | 'Code' | 'Summarizer'>('General')
  const [loading, setLoading] = useState(false)
  const chatRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)
  const controllerRef = useRef<AbortController | null>(null)

  const storedSession = useLiveQuery(() => db.sessions.get(activePreset), [activePreset])
  const messages = storedSession?.messages ?? []

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

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
      <header className="px-4 py-2 border-b font-semibold flex justify-between items-center bg-black/50 backdrop-blur-md sticky top-0 z-10">
        <div className="text-white text-lg">sidekick</div>
      </header>

      <main ref={chatRef} className="flex-1 overflow-y-auto px-4 pt-4 pb-28 space-y-3">
        <PresetSwitcher active={activePreset} onChange={setActivePreset} />
        <MessageList messages={messages} />
        {loading && (
          <div className="flex items-start gap-2">
            <div className="bg-[#1c1c1e] text-white px-4 py-2 rounded-xl max-w-md animate-pulse">
              <div className="flex gap-1">
                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" />
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 w-full border-t bg-black p-4">
        <InputBox
          onSubmit={handleSend}
          onAbort={handleAbort}
          disabled={loading}
          loading={loading}
          ref={inputRef}
        />
      </footer>
    </div>
  )
}