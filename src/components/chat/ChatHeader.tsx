'use client'

import { Menu } from 'lucide-react'
import { motion } from 'framer-motion'
import SettingsDialog from '@/components/settings/SettingsDialog'

type ChatHeaderProps = {
  title: string
  onOpenSidebar: () => void
}

export default function ChatHeader({ title, onOpenSidebar }: ChatHeaderProps) {
  return (
    <motion.div
      className="flex items-center justify-between border-b border-gray-700 h-14 px-4 font-semibold text-gray-400 text-sm"
      key={title}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <button className="md:hidden text-gray-300" onClick={onOpenSidebar}>
        <Menu className="w-6 h-6" />
      </button>
      <span className="flex-1 text-center truncate">
        {title || 'No Chat Selected'}
      </span>
      <div className="flex items-center gap-2">
        <SettingsDialog />
      </div>
    </motion.div>
  )
}
