'use client';

import { useState } from 'react';

export default function InputBox({ onSubmit }: { onSubmit: (text: string) => void }) {
  const [value, setValue] = useState('');

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit(value);
      setValue('');
    }
  }

  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={2}
        placeholder="Type a message…"
        className="w-full p-3 border rounded-md resize-none"
      />
    </div>
  );
}
