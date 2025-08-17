'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Plus, MessageSquare, Settings, Trash, Pencil, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'

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
    if (editValue.trim()) onRenameChat(chatId, editValue.trim())
    setEditingId(null)
    setEditValue('')
  }

  return (
    <aside
      className={cn(
        'bg-[#1e1e1e] text-white border-r border-gray-700 flex flex-col transition-all duration-500',
        isOpen ? 'w-64' : 'w-16'
      )}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <span
          className={cn(
            'font-semibold text-base transition-all whitespace-nowrap overflow-hidden',
            'duration-300 ease-in-out',
            !isOpen && 'opacity-0 w-0'
          )}
        >
          Sidekick
        </span>
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

      <div className="p-3">
        <Button
          onClick={onNewChat}
          variant="secondary"
          className="w-full justify-start gap-2 text-slate-50 bg-[#2a2a2d] hover:bg-[#343437]"
        >
          <Plus className="w-4 h-4" />
          {isOpen && 'New Chat'}
        </Button>
      </div>

      <ScrollArea className="flex-1 px-2">
        {chats.length > 0 ? (
          chats.map((chat) => (
            <ContextMenu key={chat.id}>
              <ContextMenuTrigger asChild>
                <Button
                  variant={chat.id === activeChatId ? 'default' : 'ghost'}
                  className={cn(
                    'w-full justify-start gap-2 text-left',
                    chat.id === activeChatId
                      ? 'bg-slate-600 text-white hover:bg-slate-700'
                      : 'hover:bg-[#2a2a2d]'
                  )}
                  onClick={() => {
                    if (editingId !== chat.id) onSelectChat(chat.id)
                  }}
                >
                  <MessageSquare className="w-4 h-4" />
                  {isOpen &&
                    (editingId === chat.id ? (
                      <input
                        value={editValue}
                        onChange={(e) => {
                          if (e.target.value.length <= 15) setEditValue(e.target.value)
                        }}
                        onKeyDown={(e) => {
                          e.stopPropagation()
                          if (e.key === 'Enter') saveEdit(chat.id)
                          if (e.key === 'Escape') {
                            setEditingId(null)
                            setEditValue('')
                          }
                        }}
                        autoFocus
                        className="bg-transparent text-white outline-none flex-1 px-1"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <span>{chat.title}</span>
                        {renamingChatId === chat.id && (
                          <Loader2 className="w-3 h-3 animate-spin text-gray-400" />
                        )}
                      </div>
                    ))}
                </Button>
              </ContextMenuTrigger>

              <ContextMenuContent>
                <ContextMenuItem onClick={() => startEditing(chat.id, chat.title)}>
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
          <p className={cn('text-gray-500 text-sm px-3', !isOpen && 'hidden')}>No chats yet</p>
        )}
      </ScrollArea>

      <div className="p-3 border-t border-gray-700">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-gray-400 hover:bg-slate-300"
        >
          <Settings className="w-4 h-4" />
          {isOpen && 'Settings'}
        </Button>
      </div>
    </aside>
  )
}
