import { NextRequest } from 'next/server'
import type { Message } from '@/types/chat'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { chatId, messages } = body as { chatId: string; messages: Message[] }

  if (!chatId || !messages) {
    return new Response('Missing chatId or messages', { status: 400 })
  }

  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    return new Response('Missing API key', { status: 500 })
  }

  const context = messages
    .slice(-8)
    .map((m: Message) => `${m.role}: ${m.content}`)
    .join('\n')

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
            'You are a helpful assistant that generates sidebar chat titles. ' +
            'Rules: ONLY output one short title, strictly 3 words only. ' +
            'Do not add punctuation at the end. ' +
            'No numbering, no quotes, no extra text. ' +
            'Return only the title itself and should make sense in 3 words of whole chat.',
        },
        {
          role: 'user',
          content: `Conversation:\n${context}\n\nReturn ONLY the 3 words only title:`,
        },
      ],
      max_tokens: 15,
      temperature: 0.3,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    return new Response(`Rename API error: ${err}`, { status: 500 })
  }

  const data = await res.json()
  let title = data?.choices?.[0]?.message?.content?.trim() || 'Untitled'

  title = title
    .replace(/^["']|["']$/g, '')
    .replace(/[:*#`]/g, '')
    .replace(/[.,;:!?-]+$/g, '')

  const words = title.split(/\s+/).filter(Boolean)
  if (words.length > 4) {
    title = words.slice(0, 4).join(' ')
  } else if (words.length < 2) {
    title = words.join(' ') || 'Untitled Chat'
  }

  return Response.json({ title })
}
