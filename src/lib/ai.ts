// lib/ai.ts
export async function streamChat(
  messages: { role: 'user' | 'assistant'; content: string }[]
): Promise<ReadableStreamDefaultReader<Uint8Array>> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json', // ✅ Tell server it's JSON
    },
    body: JSON.stringify({ messages }),
    cache: 'no-store', // ✅ Avoid caching for streams
  });

  if (!res.ok || !res.body) {
    throw new Error(`AI stream error: ${res.status} ${res.statusText}`);
  }

  return res.body.getReader();
}
