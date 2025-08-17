'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Plus,
  MessageSquare,
  Settings,
  Trash,
  Pencil,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { motion, AnimatePresence } from 'framer-motion'

interface SidebarProps {
  chats: { id: string; title: string }[]
  activeChatId: string | null
  renamingChatId: string | null
  onNewChat: () => void
  onSelectChat: (id: string) => void
  onDeleteChat: (id: string) => void
  onRenameChat: (id: string, newTitle: string) => void
}

export default function Sidebar({
  chats,
  activeChatId,
  renamingChatId,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  onRenameChat,
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  const startEditing = (chatId: string, currentTitle: string) => {
    setEditingId(chatId)
    setEditValue(currentTitle)
  }

  const saveEdit = (chatId: string) => {
    const originalTitle = chats.find((c) => c.id === chatId)?.title || ''

    if (editValue.trim()) {
      onRenameChat(chatId, editValue.trim())
    } else {
      setEditValue(originalTitle)
    }

    setEditingId(null)
  }

  return (
    <motion.aside
      initial={{ width: isOpen ? 64 : 16 }}
      animate={{ width: isOpen ? 256 : 64 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
      className={cn(
        'bg-[#181818] text-white border-r border-gray-700 flex flex-col'
      )}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between h-14 px-4 border-b border-gray-700 bg-[#202020] mb-2">
        <AnimatePresence mode="wait">
          {isOpen && (
            <motion.span
              key="title"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, delay: 0.15 }}
              className="font-semibold text-gray-200 text-base whitespace-nowrap overflow-hidden"
            >
              Sidekick
            </motion.span>
          )}
        </AnimatePresence>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-[#2a2a2d] hover:bg-[#3a3a3d] transition-colors duration-300"
        >
          <span
            className={cn(
              'font-bold text-lg transform transition-transform duration-500 ease-in-out',
              isOpen ? 'rotate-0' : 'rotate-180'
            )}
          >
            S
          </span>
        </button>
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <Button
          onClick={onNewChat}
          variant="secondary"
          className="w-full justify-start gap-2 text-slate-50 bg-[#2a2a2d] hover:bg-[#343437] transition-colors"
        >
          <Plus className="w-4 h-4" />
          <AnimatePresence mode="wait">
            {isOpen && (
              <motion.span
                key="newchat"
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -5 }}
                transition={{ duration: 0.25, delay: 0.2 }}
              >
                New Chat
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1 px-2">
        {chats.length > 0 ? (
          chats.map((chat) => (
            <ContextMenu key={chat.id}>
              <ContextMenuTrigger asChild>
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    variant={chat.id === activeChatId ? 'default' : 'ghost'}
                    className={cn(
                      'w-full justify-start gap-2 text-left transition-colors',
                      chat.id === activeChatId
                        ? 'bg-[#2f2f33] text-white hover:bg-slate-500'
                        : 'hover:bg-slate-700'
                    )}
                    onClick={() => {
                      if (editingId !== chat.id) onSelectChat(chat.id)
                    }}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <AnimatePresence mode="wait">
                      {isOpen &&
                        (editingId === chat.id ? (
                          <motion.div
                            key="input-wrapper"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2, delay: 0.15 }}
                            className="flex-1"
                          >
                            <input
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={(e) => {
                                e.stopPropagation()
                                if (e.key === 'Enter') saveEdit(chat.id)
                                if (e.key === 'Escape') {
                                  setEditingId(null)
                                  setEditValue(
                                    chats.find((c) => c.id === chat.id)?.title ||
                                      ''
                                  )
                                }
                              }}
                              onBlur={() => saveEdit(chat.id)}
                              autoFocus
                              className="bg-transparent text-white outline-none flex-1 px-1"
                            />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="title"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2, delay: 0.15 }}
                            className="flex items-center gap-2 truncate"
                          >
                            <span className="truncate">{chat.title}</span>
                            {renamingChatId === chat.id && (
                              <Loader2 className="w-3 h-3 animate-spin text-gray-400" />
                            )}
                          </motion.div>
                        ))}
                    </AnimatePresence>
                  </Button>
                </motion.div>
              </ContextMenuTrigger>

              <ContextMenuContent>
                <ContextMenuItem
                  onClick={() => startEditing(chat.id, chat.title)}
                >
                  <Pencil className="w-4 h-4 mr-2" /> Rename
                </ContextMenuItem>
                <ContextMenuItem
                  onClick={() => onDeleteChat(chat.id)}
                  className="text-red-500"
                >
                  <Trash className="w-4 h-4 mr-2" /> Delete
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          ))
        ) : (
          isOpen && (
            <motion.p
              key="nochats"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, delay: 0.2 }}
              className="text-gray-500 text-sm px-3"
            >
              No chats yet
            </motion.p>
          )
        )}
      </ScrollArea>

      {/* Settings */}
      <div className="p-3 border-t border-gray-700">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-gray-400 hover:bg-[#2a2a2d]"
        >
          <Settings className="w-4 h-4" />
          <AnimatePresence mode="wait">
            {isOpen && (
              <motion.span
                key="settings"
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -5 }}
                transition={{ duration: 0.25, delay: 0.2 }}
              >
                Settings
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </div>
    </motion.aside>
  )
}
