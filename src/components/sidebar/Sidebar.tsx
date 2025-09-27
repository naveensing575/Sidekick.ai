'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Plus, MessageSquare, Trash, Pencil, Loader2, Sparkles, User, ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import ConfirmDialog from './ConfirmDialog'
import { useChatEditing } from '@/hooks/useChatEditing'
import type { ChatType } from '@/types/chat'

interface SidebarProps {
  chats: ChatType[]
  activeChatId: string | null
  renamingChatId: string | null
  onNewChat: () => void
  onSelectChat: (id: string) => void
  onDeleteChat: (id: string) => void
  onRenameChat: (id: string, newTitle: string) => void
  onReorderChats: (newOrder: ChatType[]) => void
}

export default function Sidebar({
  chats,
  activeChatId,
  renamingChatId,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  onRenameChat,
  onReorderChats,
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [orderedChats, setOrderedChats] = useState<ChatType[]>([])

  const { editingId, editValue, setEditValue, startEditing, saveEdit, cancelEdit } =
    useChatEditing(chats, onRenameChat)

  // Sort chats with latest first and ensure consistent ordering
  useEffect(() => {
    const sortedChats = [...chats].sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt || a.id).getTime()
      const dateB = new Date(b.updatedAt || b.createdAt || b.id).getTime()
      return dateB - dateA // Latest first (descending order)
    })
    setOrderedChats(sortedChats)
  }, [chats])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <motion.aside
      initial={{ width: isOpen ? 280 : 68 }}
      animate={{ width: isOpen ? 280 : 68 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
      className="h-full md:h-screen bg-slate-900/50 backdrop-blur-xl border-r border-slate-700/50 flex flex-col z-[50] relative"
    >
      {/* Header */}
      <div className="h-16 border-b border-slate-700/50 flex items-center px-4 bg-slate-800/50">
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="header-open"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-3 flex-1"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-white">Sidekick</h1>
                <p className="text-xs text-slate-400">Your AI companion</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="header-collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, delay: 0.2 }}
              className="flex items-center justify-center w-full cursor-pointer"
              onClick={() => setIsOpen(true)}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapse Button - Only show when expanded */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
            >
              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                size="sm"
                className="p-1.5 hover:bg-slate-700/50 rounded-lg transition-colors ml-2"
                aria-label="Collapse sidebar"
              >
                <ChevronLeft className="w-4 h-4 text-slate-400" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <motion.div
          whileHover={{ scale: isOpen ? 1.02 : 1.05 }}
          whileTap={{ scale: isOpen ? 0.98 : 0.95 }}
        >
          <Button
            onClick={onNewChat}
            className={cn(
              "flex items-center justify-center font-medium transition-all shadow-lg hover:shadow-xl border-0",
              isOpen
                ? "w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl gap-2"
                : "w-11 h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg mx-auto"
            )}
          >
            <Plus className="w-5 h-5" />
            <AnimatePresence mode="wait">
              {isOpen && (
                <motion.span
                  key="newchat"
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -5 }}
                  transition={{ duration: 0.15 }}
                >
                  New Chat
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </motion.div>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1 px-2">
        {orderedChats.length > 0 ? (
          <Reorder.Group
            axis="y"
            values={orderedChats}
            onReorder={async (newOrder) => {
              setOrderedChats(newOrder)
              onReorderChats(newOrder)
            }}
            className="space-y-1"
          >
            {orderedChats.map((chat, index) => (
              <Reorder.Item key={chat.id} value={chat}>
                <ContextMenu>
                  <ContextMenuTrigger asChild>
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Button
                        variant="ghost"
                        className={cn(
                          'text-left transition-all group',
                          chat.id === activeChatId
                            ? 'bg-slate-700/70 border border-slate-600/50 text-white'
                            : 'hover:bg-slate-800/50 text-slate-300',
                          isOpen
                            ? 'w-full justify-start gap-3 p-3 h-auto'
                            : 'w-11 h-11 p-0 justify-center mx-auto mb-2 rounded-lg'
                        )}
                        onClick={() => {
                          if (editingId !== chat.id) onSelectChat(chat.id)
                        }}
                      >
                        {isOpen ? (
                          <>
                            <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0 mt-2" />
                            <AnimatePresence mode="wait">
                              {editingId === chat.id ? (
                                <motion.div
                                  key="input-wrapper"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  transition={{ duration: 0.2, delay: 0.15 }}
                                  className="flex-1 min-w-0"
                                >
                                  <input
                                    value={editValue}
                                    onChange={e => setEditValue(e.target.value)}
                                    onKeyDown={e => {
                                      e.stopPropagation()
                                      if (e.key === 'Enter') saveEdit(chat.id)
                                      if (e.key === 'Escape') cancelEdit(chat.id)
                                    }}
                                    onBlur={() => saveEdit(chat.id)}
                                    autoFocus
                                    className="bg-transparent text-white outline-none w-full px-1 font-medium"
                                  />
                                </motion.div>
                              ) : (
                                <motion.div
                                  key="title"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  transition={{ duration: 0.2, delay: 0.15 }}
                                  className="flex-1 min-w-0"
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <h3 className="font-medium text-sm truncate">{chat.title}</h3>
                                    {renamingChatId === chat.id && (
                                      <Loader2 className="w-3 h-3 animate-spin text-slate-400 flex-shrink-0" />
                                    )}
                                  </div>
                                  <p className="text-xs text-slate-400">
                                    {new Date(chat.updatedAt || chat.createdAt || chat.id).toLocaleDateString()}
                                  </p>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </>
                        ) : (
                          <MessageSquare className="w-5 h-5" />
                        )}
                      </Button>
                    </motion.div>
                  </ContextMenuTrigger>
                  <ContextMenuContent className="z-[100] bg-slate-800 border-slate-700">
                    <ContextMenuItem
                      onClick={() => startEditing(chat.id, chat.title)}
                      className="text-slate-200 focus:bg-slate-700"
                    >
                      <Pencil className="w-4 h-4 mr-2" /> Rename
                    </ContextMenuItem>
                    <ContextMenuItem
                      onClick={() => {
                        setPendingDeleteId(chat.id)
                        setConfirmOpen(true)
                      }}
                      className="text-red-400 focus:bg-red-500/20"
                    >
                      <Trash className="w-4 h-4 mr-2" /> Delete
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        ) : (
          <AnimatePresence>
            {isOpen && (
              <motion.div
                key="nochats"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="text-center py-8 px-3"
              >
                <MessageSquare className="w-8 h-8 text-slate-500 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No chats yet</p>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </ScrollArea>

      {/* User Profile */}
      <div className="border-t border-slate-700/50 p-3">
        <div className={cn(
          "flex items-center",
          isOpen ? "gap-3" : "justify-center"
        )}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-blue-500 flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4" />
          </div>
          <AnimatePresence mode="wait">
            {isOpen && (
              <motion.div
                key="user-info"
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -5 }}
                transition={{ duration: 0.15 }}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-medium text-white truncate">You</p>
                <p className="text-xs text-slate-400">Free Plan</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={() => {
          if (pendingDeleteId) {
            onDeleteChat(pendingDeleteId)
            setPendingDeleteId(null)
          }
        }}
        title="Delete Chat"
        description="Are you sure you want to delete this chat? This action cannot be undone."
      />
    </motion.aside>
  )
}