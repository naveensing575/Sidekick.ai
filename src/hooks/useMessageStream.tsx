'use client'

import { useState, useRef } from 'react'
import { addMessage, getMessages } from '@/lib/db'
import { streamChat } from '@/lib/ai'
import type { Message, Role } from '@/types/chat'

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

export function useMessageStream(
  activeChatId: string | null,
  chats: { id: string; title: string }[],
  setRenamingChatId: (id: string | null) => void,
  updateChatTitle: (id: string, title: string) => Promise<void>
) {
  const [loading, setLoading] = useState(false)
  const [liveMessage, setLiveMessage] = useState<string | null>(null)
  const [error, setError] = useState<string>('')

  const controllerRef = useRef<AbortController | null>(null)

  const handleSend = async (text: string) => {
    if (!text.trim() || !activeChatId) return

    setError('')
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text.trim(),
    }

    await addMessage(activeChatId, 'user', userMessage.content)
    setLoading(true)
    setLiveMessage(null)

    const systemMessage: Message = {
      id: 'system',
      role: 'system' as Role,
      content: DEFAULT_SYSTEM_PROMPT,
    }

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
          } catch {
            // ignore JSON parse errors
          }
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
              messages: [...existing, { role: 'assistant', content: clean }],
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
    }
  }

  const handleAbort = () => {
    controllerRef.current?.abort()
  }

  return {
    loading,
    liveMessage,
    error,
    handleSend,
    handleAbort,
    setError,
  }
}
