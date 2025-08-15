'use client'

import {
  useState,
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
} from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Square, SendHorizonal } from 'lucide-react'

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

    // Auto-grow textarea
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
      <div className="flex items-end gap-2 bg-gray-800 dark:bg-[#18181c] rounded-xl px-3 py-3 transition w-full shadow-sm">
        <Textarea
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message…"
          disabled={disabled} // only disabled if globally disabled
          rows={1}
          className="resize-none bg-transparent text-base text-white placeholder-gray-400 disabled:opacity-50 no-scrollbar max-h-40"
          style={{ minHeight: '2.5rem', paddingRight: '2.5rem' }}
        />

        {loading ? (
          <Button
            type="button"
            onClick={onAbort}
            variant="ghost"
            className="rounded-full p-2 bg-[#2c2c2e] hover:bg-[#3a3a3c]"
            aria-label="Stop generating"
          >
            <Square className="w-4 h-4 text-white" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={submit}
            disabled={!value.trim()}
            variant="default"
            className="rounded-full p-2"
            aria-label="Send"
          >
            <SendHorizonal className="w-4 h-4 text-white" />
          </Button>
        )}
      </div>
    )
  }
)

InputBox.displayName = 'InputBox'
export default InputBox
