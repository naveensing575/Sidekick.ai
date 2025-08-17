export type Role = 'system' | 'user' | 'assistant'

export interface ChatAPIMessage {
  role: Role
  content: string
}

export async function streamChat(
// eslint-disable-next-line @typescript-eslint/no-unused-vars
messages: ChatAPIMessage[], _signal: AbortSignal): Promise<ReadableStreamDefaultReader<Uint8Array>> {
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


export async function generateTitle(messages: unknown[]) {
  const prompt = `
    Summarize this chat into a short title (2-4 words). 
    Rules:
    - Only clean, readable words
    - No special characters
    - Max 30 characters
    - Reflects the chat meaning
    
    Chat:
    ${JSON.stringify(messages)}
  `

  const resp = await fetch('https://api.openai.com/v1/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo-instruct',
      prompt,
      max_tokens: 20,
    }),
  })

  const data = await resp.json()

  let aiTitle =
    data.choices?.[0]?.text ??
    data.choices?.[0]?.message?.content ??
    'Untitled'

  aiTitle = aiTitle
    .slice(0, 30)
    .replace(/[^\p{L}\p{N}\s]/gu, '') 
    .trim()

  return aiTitle || 'Untitled'
}
