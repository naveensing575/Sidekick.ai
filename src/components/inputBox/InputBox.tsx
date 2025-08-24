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
  attachments: File[]
  setAttachments: (files: File[]) => void
  className?: string  
  placeholder?: string
}

const InputBox = forwardRef<HTMLTextAreaElement, InputBoxProps>(
  ({ onSubmit, loading, onAbort, attachments, setAttachments }, ref) => {
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
      <div className="max-w-3xl mx-auto w-full px-4">
        <div className="flex flex-col gap-2 bg-slate-800 rounded-xl px-3 py-2 shadow-sm w-full">
          {attachments.length > 0 && (
            <div className="border-b border-slate-700 pb-2 mb-2">
              <AttachmentPreview
                files={attachments}
                onRemove={(index) =>
                  setAttachments(attachments.filter((_, i) => i !== index))
                }
              />
            </div>
          )}

          <div className="flex items-end gap-2">
            <AttachmentButton
              onSelectFiles={(files) =>
                setAttachments([...attachments, ...Array.from(files)])
              }
              onSelectMedia={(files) =>
                setAttachments([...attachments, ...Array.from(files)])
              }
            />

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
      </div>
    )
  }
)

InputBox.displayName = 'InputBox'
export default InputBox
