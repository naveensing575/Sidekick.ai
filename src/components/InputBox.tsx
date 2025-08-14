'use client'

import { useState, forwardRef, useImperativeHandle, useRef, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

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

    useEffect(() => {
      const el = inputRef.current
      if (!el) return
      el.style.height = 'auto'
      el.style.height = `${el.scrollHeight}px`
    }, [value])

    function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        if (!loading) submit()
      }
    }

    function submit() {
      if (!value.trim() || loading) return
      onSubmit(value)
      setValue('')
      setTimeout(() => {
        inputRef.current?.focus()
      }, 0)
    }


    return (
      <div className="flex items-end gap-2 bg-gray-800 dark:bg-[#18181c] rounded-xl px-3 py-3 transition w-full max-w-3xl mx-auto shadow-sm">
        <Textarea
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message…"
          disabled={disabled}
          rows={1}
          className="resize-none bg-transparent text-base text-white placeholder-gray-400 disabled:opacity-50 no-scrollbar max-h-40"
          style={{ minHeight: '2.5rem', paddingRight: '2.5rem' }}
        />

        {loading ? (
          <Button
            type="button"
            onClick={onAbort}
            variant="ghost"
            className="bg-black text-white hover:bg-neutral-800 px-4"
          >
            Stop
          </Button>
        ) : (
          <Button
            type="button"
            onClick={submit}
            disabled={disabled || !value.trim()}
            variant="default"
            className="rounded-full p-2"
            aria-label="Send"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M3.94 16.44l12.02-6.02a.5.5 0 000-.9L3.94 3.5a.5.5 0 00-.72.6l1.56 6.42a.25.25 0 000 .12l-1.56 6.26a.5.5 0 00.72.54z"
                fill="currentColor"
              />
            </svg>
          </Button>
        )}
      </div>
    )
  }
)

InputBox.displayName = 'InputBox'
export default InputBox
