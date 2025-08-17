import { NextRequest } from 'next/server'
import { updateChatTitle, getMessages } from '@/lib/db'

const RENAME_PROMPT = `
You are an AI assistant that generates short, clear chat titles.
Rules:
- Max 15 characters.
- No emojis.
- Summarize the conversation topic in a professional way.
`

export async function POST(req: NextRequest) {
  try {
    const { chatId } = await req.json()
    if (!chatId) return new Response('Missing chatId', { status: 400 })

    const messages = await getMessages(chatId)
    if (!messages.length) return new Response('No messages found', { status: 400 })

    const formattedMessages = messages.slice(-6).map(m => ({
      role: m.role,
      content: m.content,
    }))

    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) return new Response('No API key found', { status: 500 })

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct',
        messages: [{ role: 'system', content: RENAME_PROMPT }, ...formattedMessages],
      }),
    })

    if (!res.ok) {
      const errorText = await res.text()
      return new Response(`Rename API error: ${errorText}`, { status: 500 })
    }

    const data = await res.json()
    let aiTitle = data.choices?.[0]?.message?.content?.trim() ?? 'Untitled'
    aiTitle = aiTitle.slice(0, 15).replace(/[^\w\s]/g, '')

    await updateChatTitle(chatId, aiTitle || 'Untitled')

    return Response.json({ title: aiTitle })
  } catch (err) {
    return new Response('Server error', { status: 500 })
  }
}
