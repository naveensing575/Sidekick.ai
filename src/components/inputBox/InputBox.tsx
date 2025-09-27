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
import { Square, Send } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
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
  ({ onSubmit, loading, onAbort, attachments, setAttachments, placeholder = "Type a message..." }, ref) => {
    const [value, setValue] = useState('')
    const inputRef = useRef<HTMLTextAreaElement | null>(null)

    useImperativeHandle(ref, () => inputRef.current!)

    useEffect(() => {
      const el = inputRef.current
      if (!el) return
      el.style.height = 'auto'
      el.style.height = `${Math.min(el.scrollHeight, 160)}px`
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

    const hasContent = value.trim().length > 0

    return (
      <div className="max-w-4xl mx-auto w-full px-6">
        <motion.div
          className="flex flex-col gap-3 bg-slate-800/70 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 shadow-lg"
          layout
        >
          {/* Attachment Preview */}
          <AnimatePresence>
            {attachments.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-b border-slate-700/50 pb-3"
              >
                <AttachmentPreview
                  files={attachments}
                  onRemove={(index) =>
                    setAttachments(attachments.filter((_, i) => i !== index))
                  }
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input Row */}
          <div className="flex items-end gap-3">
            {/* Attachment Button */}
            <div className="flex-shrink-0">
              <AttachmentButton
                onSelectFiles={(files) =>
                  setAttachments([...attachments, ...Array.from(files)])
                }
                onSelectMedia={(files) =>
                  setAttachments([...attachments, ...Array.from(files)])
                }
              />
            </div>

            {/* Text Input */}
            <div className="flex-1 relative">
              <Textarea
                ref={inputRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                rows={1}
                className="resize-none bg-transparent border-0 text-base text-white placeholder-slate-400 focus:outline-none focus:ring-0 p-2 min-h-[2.5rem] max-h-40"
                style={{
                  minHeight: '2.5rem',
                  lineHeight: '1.5'
                }}
              />
            </div>

            {/* Send/Stop Button */}
            <div className="flex-shrink-0">
              {loading ? (
                <Button
                  type="button"
                  onClick={onAbort}
                  variant="destructive"
                  size="sm"
                  className="w-9 h-9 rounded-full bg-red-600 hover:bg-red-700 text-white border-0"
                  aria-label="Stop generating"
                >
                  <Square className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={submit}
                  disabled={!hasContent}
                  size="sm"
                  className={`w-9 h-9 rounded-full border-0 transition-all duration-200 ${hasContent
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                      : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                    }`}
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Footer Text */}
          <AnimatePresence>
            {value.trim().length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center justify-between text-xs text-slate-500"
              >
                <span>Press Enter to send, Shift+Enter for new line</span>
                <span className={`transition-colors ${value.length > 2000 ? 'text-yellow-500' :
                    value.length > 4000 ? 'text-red-500' : 'text-slate-500'
                  }`}>
                  {value.length}/4000
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    )
  }
)

InputBox.displayName = 'InputBox'
export default InputBox