import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  let body;
  try {
    body = await req.json();
  } catch {
    return new Response('Invalid JSON payload', { status: 400 });
  }

  const { messages, model, temperature, maxTokens } = body;
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return new Response('No API key found', { status: 500 });
  }

  // Input validation with size limits
  const MAX_MESSAGES = 100;
  const MAX_CONTENT_LENGTH = 10000;
  const VALID_ROLES = ['user', 'assistant', 'system'];

  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) {
    return new Response('Invalid messages array', { status: 400 });
  }

  const isValid = messages.every(m =>
    m.role &&
    VALID_ROLES.includes(m.role) &&
    typeof m.content === 'string' &&
    m.content.length > 0 &&
    m.content.length <= MAX_CONTENT_LENGTH
  );

  if (!isValid) {
    return new Response('Malformed messages', { status: 400 });
  }

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'Sidekick AI',
      },
      body: JSON.stringify({
        model: model || 'microsoft/wizardlm-2-8x22b',
        stream: true,
        messages,
        max_tokens: maxTokens || 1000,
        temperature: temperature !== undefined ? temperature : 0.7,
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
    
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(`Network error: ${message}`, { status: 500 });
  }
}