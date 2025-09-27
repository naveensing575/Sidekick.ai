import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  console.log('🚀 Chat API called');
  
  let body;
  try {
    body = await req.json();
    console.log('📥 Body received:', body);
  } catch {
    console.error('❌ JSON parse failed');
    return new Response('Invalid JSON payload', { status: 400 });
  }
  
  const { messages } = body;
  console.log('📝 Messages:', messages?.length, 'items');
  
  const apiKey = process.env.OPENROUTER_API_KEY;
  console.log('🔑 API key exists:', !!apiKey);
  
  if (!apiKey) {
    console.error('❌ No API key');
    return new Response('No API key found', { status: 500 });
  }
  
  if (!Array.isArray(messages) || !messages.every(m => m.role && m.content)) {
    console.error('❌ Invalid messages');
    return new Response('Malformed messages', { status: 400 });
  }
  
  console.log('📤 Calling OpenRouter...');
  
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
  
  console.log('📨 OpenRouter response:', res.status, res.ok);
  
  if (!res.ok || !res.body) {
    const errorText = await res.text();
    console.error('❌ OpenRouter error:', errorText);
    return new Response(`OPENROUTER API error: ${errorText}`, { status: 500 });
  }
  
  console.log('✅ Returning stream');
  return new Response(res.body, {
    headers: { 'Content-Type': 'text/event-stream; charset=utf-8' },
  });
}