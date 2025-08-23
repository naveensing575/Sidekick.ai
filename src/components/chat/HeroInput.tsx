'use client'

import { motion } from 'framer-motion'
import InputBox from '@/components/inputBox/InputBox'
import { Sparkles, FileText, Brain, Zap, Search, Footprints } from 'lucide-react'

type HeroInputProps = {
  onSubmit: (text: string) => void
  onAbort: () => void
  loading: boolean
  inputRef: React.RefObject<HTMLTextAreaElement | null>
  attachments: File[]
  setAttachments: React.Dispatch<React.SetStateAction<File[]>>
}

const suggestions = [
  { icon: FileText, text: 'Summarize my document' },
  { icon: Brain, text: 'Explain this concept simply' },
  { icon: Zap, text: 'Generate a quick idea' },
  { icon: Search, text: 'Find insights in my notes' },
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
        className="mb-8 relative"
      >
        <div className="flex items-center justify-center mb-4">
          <Sparkles className="w-10 h-10 text-indigo-400" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Your AI Sidekick, Always Ready</h1>

        {/* Tagline with footprints walking around */}
        <div className="relative inline-block">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-[length:200%_100%] animate-shimmer text-lg font-medium"
          >
            Smarter answers that walk with you.
          </motion.p>

          {/* Left Footprint */}
          <motion.div
            className="absolute -left-8 top-2"
            animate={{ opacity: [1, 0.3, 1], y: [0, -4, 0], rotate: [10, 0, 10] }}
            transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Footprints className="w-5 h-5 text-indigo-400" />
          </motion.div>

          {/* Right Footprint */}
          <motion.div
            className="absolute -right-8 -bottom-0"
            animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0], rotate: [-10, 0, -10] }}
            transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          >
            <Footprints className="w-5 h-5 text-indigo-400" />
          </motion.div>
        </div>
      </motion.div>

      {/* Input */}
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
          {suggestions.map(({ icon: Icon, text }, i) => (
            <motion.button
              key={i}
              onClick={() => onSubmit(text)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-sm rounded-full hover:bg-slate-600 transition-colors"
            >
              <Icon className="w-4 h-4" />
              {text}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}
