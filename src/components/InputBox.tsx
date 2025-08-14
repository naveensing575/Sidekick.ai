'use client'
import { useState, forwardRef, useImperativeHandle, useRef } from 'react'

interface InputBoxProps {
  onSubmit: (text: string) => void
  disabled?: boolean
  loading: boolean
  onAbort?: () => void
}

const InputBox = forwardRef<HTMLTextAreaElement, InputBoxProps>(
  ({ onSubmit, disabled, loading, onAbort }, ref) => {
    const [value, setValue] = useState('')
    const inputRef = useRef<HTMLTextAreaElement | null>(null)
    useImperativeHandle(ref, () => inputRef.current!)

    function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        submit()
      }
    }

    function submit() {
      if (!value.trim()) return
      onSubmit(value)
      setValue('')
      setTimeout(() => {
        inputRef.current?.focus()
      }, 0)
    }

    return (
      <div className="
        flex items-end gap-2 bg-white dark:bg-[#18181c] border border-gray-300 dark:border-gray-700 
        rounded-xl px-3 py-2 transition w-full max-w-3xl mx-auto shadow-sm focus-within:ring-1 focus-within:ring-blue-400
      ">
        <textarea
          ref={inputRef}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Type a message…"
          disabled={disabled}
          className="
            resize-none w-full bg-transparent outline-none border-0 text-base
            placeholder-gray-400 disabled:opacity-50 no-scrollbar
            max-h-40 leading-relaxed"
          style={{
            minHeight: '2.5rem',
            paddingRight: '2.5rem',
          }}
        />

        {loading ? (
          <button
            type="button"
            onClick={onAbort}
            className="p-2 rounded-md bg-black text-white transition hover:bg-neutral-900"
            aria-label="Stop response"
          >
            Stop
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={disabled || !value.trim()}
            className="
              p-2 rounded-full transition disabled:opacity-40 disabled:cursor-not-allowed
              bg-blue-600 hover:bg-blue-700 text-white
            "
            aria-label="Send"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M3.94 16.44l12.02-6.02a.5.5 0 000-.9L3.94 3.5a.5.5 0 00-.72.6l1.56 6.42a.25.25 0 000 .12l-1.56 6.26a.5.5 0 00.72.54z"
                fill="currentColor"
              />
            </svg>
          </button>
        )}
      </div>
    )
  }
)
InputBox.displayName = 'InputBox'
export default InputBox
