'use client';

import {
  useState,
  forwardRef,
  useImperativeHandle,
  useRef,
} from 'react';

interface InputBoxProps {
  onSubmit: (text: string) => void;
  disabled?: boolean;
}

const InputBox = forwardRef<HTMLTextAreaElement, InputBoxProps>(
  ({ onSubmit, disabled }, ref) => {
    const [value, setValue] = useState('');
    const inputRef = useRef<HTMLTextAreaElement | null>(null);

    useImperativeHandle(ref, () => inputRef.current!);

    function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        submit();
      }
    }

    function submit() {
      if (!value.trim()) return;
      onSubmit(value);
      setValue('');
    }

    return (
      <textarea
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={2}
        placeholder="Type a message…"
        disabled={disabled}
        className="w-full p-3 border rounded-md resize-none disabled:opacity-50"
      />
    );
  }
);

InputBox.displayName = 'InputBox';
export default InputBox;
