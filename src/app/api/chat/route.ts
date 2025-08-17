// src/app/api/chat/route.ts
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  let body;
  try {
    body = await req.json();
  } catch {
    return new Response('Invalid JSON payload', { status: 400 });
  }

  const { messages } = body;
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return new Response('No API key found', { status: 500 });
  }

  if (!Array.isArray(messages) || !messages.every(m => m.role && m.content)) {
    return new Response('Malformed messages', { status: 400 });
  }

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'mistralai/mistral-7b-instruct',
      stream: true,
      messages,
    }),
  });

  if (!res.ok || !res.body) {
    const errorText = await res.text();
    return new Response(`OPENROUTER API error: ${errorText}`, { status: 500 });
  }

  return new Response(res.body, {
    headers: { 'Content-Type': 'text/event-stream; charset=utf-8' },
  });
}
