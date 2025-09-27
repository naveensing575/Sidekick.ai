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
  
  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://sidekick-ai-five.vercel.app',
        'X-Title': 'Sidekick AI',
      },
      body: JSON.stringify({
        model: 'microsoft/wizardlm-2-8x22b',
        stream: true,
        messages,
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      return new Response(`AI service error: ${res.status} - ${errorText}`, { status: res.status });
    }
    
    if (!res.body) {
      return new Response('No response body from AI service', { status: 500 });
    }
    
    return new Response(res.body, {
      headers: { 
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
    
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return new Response(`Network error: ${error.message}`, { status: 500 });
  }
}