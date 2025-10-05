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
import { Square, Send, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import AttachmentButton from './AttachmentButton'
import AttachmentPreview from './AttachmentPreview'
import { extractTextFromImage } from '@/lib/ocr'
import { toast } from 'sonner'

interface InputBoxProps {
  onSubmit: (text: string, extractedText?: string) => void
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
    const [ocrProcessing, setOcrProcessing] = useState(false)
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
        if (!loading && !ocrProcessing) submit()
      }
    }

    async function submit() {
      if ((!value.trim() && attachments.length === 0) || loading || ocrProcessing) return

      // Extract text from images if any
      let extractedText = ''
      const imageFiles = attachments.filter(f => f.type.startsWith('image/'))

      if (imageFiles.length > 0) {
        setOcrProcessing(true)
        toast.info(`Extracting text from ${imageFiles.length} image(s)...`)

        try {
          const results = await Promise.all(
            imageFiles.map(async (file, i) => {
              const result = await extractTextFromImage(file)
              return result.text ? `[Image ${i + 1}]:\n${result.text}` : ''
            })
          )
          extractedText = results.filter(Boolean).join('\n\n')

          if (extractedText) {
            toast.success('Text extracted successfully!')
          } else {
            toast.warning('No text found in images')
          }
        } catch (error) {
          toast.error('Failed to extract text from images')
          console.error('OCR Error:', error)
        } finally {
          setOcrProcessing(false)
        }
      }

      const finalMessage = extractedText
        ? value.trim()
          ? `${value.trim()}\n\n${extractedText}`
          : extractedText
        : value.trim()

      onSubmit(finalMessage, extractedText)
      setValue('')
      setAttachments([])
      setTimeout(() => {
        inputRef.current?.focus()
      }, 0)
    }

    const hasContent = value.trim().length > 0 || attachments.length > 0

    return (
      <div className="max-w-4xl mx-auto w-full px-6">
        <motion.div
          className="flex flex-col gap-3 bg-slate-800/70 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 shadow-lg"
          layout
        >
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

          <div className="flex items-end gap-3">
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

            <div className="flex-1 relative">
              <Textarea
                ref={inputRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                rows={1}
                className="resize-none bg-transparent border-0 text-base text-white placeholder-slate-400 focus:outline-none focus:ring-0 p-2 min-h-[2.5rem] max-h-40 break-words whitespace-pre-wrap"
                style={{
                  minHeight: '2.5rem',
                  lineHeight: '1.5',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                  wordBreak: 'break-word'
                }}
              />
            </div>

            <div className="flex-shrink-0">
              {loading ? (
                <Button
                  type="button"
                  onClick={onAbort}
                  variant="destructive"
                  size="sm"
                  className="w-9 h-9 rounded-full bg-slate-600 hover:bg-slate-700 text-white border-0"
                  aria-label="Stop generating"
                >
                  <Square className="w-4 h-4" />
                </Button>
              ) : ocrProcessing ? (
                <Button
                  type="button"
                  disabled
                  size="sm"
                  className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0"
                  aria-label="Processing OCR"
                >
                  <Loader2 className="w-4 h-4 animate-spin" />
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