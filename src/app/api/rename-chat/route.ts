import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { chatId, messages } = body

  if (!chatId || !messages) {
    return new Response('Missing chatId or messages', { status: 400 })
  }

  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    return new Response('Missing API key', { status: 500 })
  }

  // Take last 8 messages max for context
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const context = messages.slice(-8).map((m: any) => `${m.role}: ${m.content}`).join('\n')

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'mistralai/mistral-7b-instruct',
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful AI that creates concise and descriptive chat titles. ' +
            'Rules: Only output ONE title, 2–4 words long, no punctuation, no numbering, no quotes, no markdown.',
        },
        {
          role: 'user',
          content: `Conversation:\n${context}\n\nReturn only the title.`,
        },
      ],
      max_tokens: 20,
      temperature: 0.5,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    return new Response(`Rename API error: ${err}`, { status: 500 })
  }

  const data = await res.json()

  let title = data?.choices?.[0]?.message?.content?.trim() || 'Untitled'

  // Strip quotes, markdown, numbers, colons
  title = title.replace(/^["']|["']$/g, '').replace(/[:*#`]/g, '')

  return Response.json({ title })
}
