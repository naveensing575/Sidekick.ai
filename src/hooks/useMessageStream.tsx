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

  const handleSend = async (text: string, chatIdOverride?: string) => {
    const targetChatId = chatIdOverride || activeChatId
    if (!text.trim() || !targetChatId) return

    setError('')
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text.trim(),
    }

    await addMessage(targetChatId, 'user', userMessage.content)
    setLoading(true)
    setLiveMessage(null)

    const existing = await getMessages(targetChatId)

    // Rename chat if needed
    const currentChat = chats.find(c => c.id === targetChatId)
    if (currentChat && (currentChat.title === 'Untitled' || !currentChat.title)) {
      try {
        setRenamingChatId(targetChatId)
        const res = await fetch('/api/rename-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chatId: targetChatId,
            messages: [...existing, { role: 'user', content: text.trim() }],
          }),
        })
        if (res.ok) {
          const data = await res.json()
          if (data.title) {
            await updateChatTitle(targetChatId, data.title)
          }
        }
      } catch (err) {
        console.error(err)
      } finally {
        setRenamingChatId(null)
      }
    }

    const systemMessage: Message = {
      id: 'system',
      role: 'system' as Role,
      content: DEFAULT_SYSTEM_PROMPT,
    }

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
        const lines = chunk.split('\n')

        for (const line of lines) {
          const trimmedLine = line.trim()
          if (!trimmedLine) continue

          if (trimmedLine.startsWith('data: ')) {
            const data = trimmedLine.slice(6).trim()

            if (data === '[DONE]') continue

            try {
              const json = JSON.parse(data)
              const delta = json.choices?.[0]?.delta?.content

              if (delta) {
                fullResponse += delta
                setLiveMessage(fullResponse)
              }
            } catch {
              // Continue processing other lines
            }
          }
        }
      }
    } catch (err: unknown) {
      // Only set error if request wasn't manually aborted
      if (!(err instanceof Error && err.name === 'AbortError')) {
        setError(err instanceof Error ? err.message : 'Something went wrong while streaming.')
      }
    } finally {
      if (!controller.signal.aborted && fullResponse.trim()) {
        const clean = sanitizeResponse(fullResponse)
        await addMessage(targetChatId, 'assistant', clean)
        setLiveMessage(null)
      }
      setLoading(false)
      controllerRef.current = null
    }
  }

  const handleAbort = () => {
    if (controllerRef.current) {
      setError('')
      controllerRef.current.abort()
    }
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