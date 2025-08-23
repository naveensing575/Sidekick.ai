'use client'

import { motion } from 'framer-motion'
import InputBox from '@/components/inputBox/InputBox'
import { Sparkles } from 'lucide-react'

type HeroInputProps = {
  onSubmit: (text: string) => void
  onAbort: () => void
  loading: boolean
  inputRef: React.RefObject<HTMLTextAreaElement | null>
  attachments: File[]
  setAttachments: React.Dispatch<React.SetStateAction<File[]>>
}

const suggestions = [
  '📊 Summarize my document',
  '🧠 Explain this concept simply',
  '⚡ Generate a quick idea',
  '🔍 Find insights in my notes',
]

export default function HeroInput({
  onSubmit,
  onAbort,
  loading,
  inputRef,
  attachments,
  setAttachments,
}: HeroInputProps) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center justify-center mb-4">
          <Sparkles className="w-10 h-10 text-indigo-400" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Your AI Sidekick, Always Ready</h1>
        <p className="text-gray-400 max-w-lg mx-auto">
          Smarter, contextual answers that adapt to you — not just another chatbot.
        </p>
      </motion.div>

      <div className="w-full max-w-2xl">
        <InputBox
          onSubmit={onSubmit}
          onAbort={onAbort}
          loading={loading}
          ref={inputRef}
          attachments={attachments}
          setAttachments={setAttachments}
          className="min-h-[4rem] text-lg"
          placeholder="Ask me anything or choose a prompt below…"
        />

        <div className="flex flex-wrap justify-center gap-2 mt-6">
          {suggestions.map((s, i) => (
            <motion.button
              key={i}
              onClick={() => onSubmit(s)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-slate-700 text-sm rounded-full hover:bg-slate-600 transition-colors"
            >
              {s}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}
