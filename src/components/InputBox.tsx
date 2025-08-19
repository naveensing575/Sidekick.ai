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
import AttachmentButton from './AttachmentButton'
import AttachmentPreview from './AttachmentPreview'

interface InputBoxProps {
  onSubmit: (text: string) => void
  loading: boolean
  onAbort?: () => void
}

const InputBox = forwardRef<HTMLTextAreaElement, InputBoxProps>(
  ({ onSubmit, loading, onAbort }, ref) => {
    const [value, setValue] = useState('')
    const [attachments, setAttachments] = useState<File[]>([])
    const inputRef = useRef<HTMLTextAreaElement | null>(null)
    useImperativeHandle(ref, () => inputRef.current!)

    useEffect(() => {
      const el = inputRef.current
      if (!el) return
      el.style.height = 'auto'
      el.style.height = `${el.scrollHeight}px`
    }, [value])

    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        const target = e.target as HTMLElement
        if (
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          e.metaKey ||
          e.ctrlKey ||
          e.altKey
        ) {
          return
        }
        if (e.key.length === 1) {
          e.preventDefault()
          inputRef.current?.focus()
          setValue((prev) => prev + e.key)
        }
      }
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

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
      <div className="w-full flex flex-col gap-3">
        {/* Attachments row */}
        {attachments.length > 0 && (
          <div className="bg-slate-800 p-2 rounded-lg flex gap-2 flex-wrap shadow-md w-auto self-start max-w-full">
            <AttachmentPreview
              files={attachments}
              onRemove={(index) =>
                setAttachments(attachments.filter((_, i) => i !== index))
              }
            />
          </div>
        )}

        {/* Spacer to avoid margin collapse */}
        <div className="min-h-[4px]" />

        {/* Input row */}
        <div className="flex items-end gap-2 bg-slate-800 rounded-xl px-3 py-2 shadow-sm w-full">
          {/* Attachment button */}
          <AttachmentButton
            onSelectFiles={(files) =>
              setAttachments([...attachments, ...Array.from(files)])
            }
            onSelectMedia={(files) =>
              setAttachments([...attachments, ...Array.from(files)])
            }
          />

          {/* Textarea */}
          <Textarea
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message…"
            rows={1}
            className="resize-none bg-transparent text-base text-white placeholder-slate-400 no-scrollbar max-h-40 flex-1"
            style={{ minHeight: '2.5rem' }}
          />

          {/* Action button */}
          {loading ? (
            <Button
              type="button"
              onClick={onAbort}
              variant="ghost"
              className="rounded-full p-2 bg-slate-700 hover:bg-slate-600"
              aria-label="Stop generating"
            >
              <Square className="w-4 h-4 text-white" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={submit}
              disabled={!value.trim() || loading}
              variant="default"
              className="rounded-full p-2 bg-slate-700 hover:bg-slate-600"
              aria-label="Send"
            >
              <SendHorizonal className="w-4 h-4 text-white" />
            </Button>
          )}
        </div>
      </div>
    )
  }
)

InputBox.displayName = 'InputBox'
export default InputBox
