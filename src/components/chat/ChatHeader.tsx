  'use client'

import { motion } from 'framer-motion'
import { ChatType } from './ChatWindow'

/**
 * ChatHeader — displays the current chat title
 */
export default function ChatHeader({ chat }: { chat?: ChatType }) {
  return (
    <motion.div
      className="flex items-center justify-center border-b border-gray-700 h-14 font-semibold text-gray-400 text-sm"
      key={chat?.id ?? 'empty'}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {chat?.title || 'No Chat Selected'}
    </motion.div>
  )
}
