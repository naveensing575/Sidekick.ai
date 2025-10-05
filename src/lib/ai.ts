export type Role = 'system' | 'user' | 'assistant'

export interface ChatAPIMessage {
  role: Role
  content: string
}

export interface StreamChatOptions {
  model?: string
  temperature?: number
  maxTokens?: number
}

export async function streamChat(
  messages: ChatAPIMessage[],
  signal: AbortSignal,
  options?: StreamChatOptions
): Promise<ReadableStreamDefaultReader<Uint8Array>> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages,
      model: options?.model,
      temperature: options?.temperature,
      maxTokens: options?.maxTokens,
    }),
    signal,
    cache: 'no-store',
  })

  if (!res.ok || !res.body) {
    const errorText = await res.text()
    throw new Error(`AI stream error: ${res.status} ${res.statusText} - ${errorText}`)
  }

  return res.body.getReader()
}