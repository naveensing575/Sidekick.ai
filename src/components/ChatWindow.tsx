'use client';

import { useState, useRef, useEffect } from 'react';
import MessageList from './MessageList';
import InputBox from './InputBox';

export type Role = 'user' | 'assistant';
export interface Message {
  id: string;
  role: Role;
  content: string;
}

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([
    {
    id: '1',
    role: 'assistant',
    content: 'Hi! I’m **Sidekick**.\n\n```js\nconsole.log("Hello!");\n```',
  },
  { id: '2', role: 'user', content: 'Just testing this out.' },
  ]);

  const chatRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen">
      <header className="px-4 py-2 border-b font-semibold">sidekick</header>

      <main ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        <MessageList messages={messages} />
      </main>

      <footer className="border-t px-4 py-3">
        <InputBox
          onSubmit={(text) => {
            if (!text.trim()) return;
            setMessages((prev) => [
              ...prev,
              { id: crypto.randomUUID(), role: 'user', content: text.trim() },
            ]);
          }}
        />
      </footer>
    </div>
  );
}
