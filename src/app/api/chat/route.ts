import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.error('[OPENROUTER API ERROR] No API key found.');
    return new Response('No API key found', { status: 500 });
  }

  // Safe: validate messages structure
  if (!Array.isArray(messages) || !messages.every(m => m.role && m.content)) {
    console.error('[OPENROUTER API ERROR] Messages malformed:', messages);
    return new Response('Malformed messages', { status: 400 });
  }

  // Request to OpenRouter
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
    console.error('[OPENROUTER API ERROR]', errorText);
    return new Response(`OPENROUTER API error: ${errorText}`, { status: 500 });
  }

  // Streamed response: use correct SSE content-type
  return new Response(res.body, {
    headers: { 'Content-Type': 'text/event-stream; charset=utf-8' },
  });
}
