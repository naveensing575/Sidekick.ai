'use client'

import { motion } from 'framer-motion'

/**
 * TypingIndicator — shows animated dots when AI is generating a response
 */
export default function TypingIndicator() {
  return (
    <motion.div
      className="flex gap-1 px-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" />
      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" />
      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" />
    </motion.div>
  )
}
