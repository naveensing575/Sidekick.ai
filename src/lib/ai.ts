export type Role = 'system' | 'user' | 'assistant'

export interface ChatAPIMessage {
  role: Role
  content: string
}

export async function streamChat(
messages: ChatAPIMessage[], signal: AbortSignal): Promise<ReadableStreamDefaultReader<Uint8Array>> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messages }),
    cache: 'no-store',
  })

  if (!res.ok || !res.body) {
    throw new Error(`AI stream error: ${res.status} ${res.statusText}`)
  }

  return res.body.getReader()
}
