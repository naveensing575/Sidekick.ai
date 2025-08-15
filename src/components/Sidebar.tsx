'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Plus, MessageSquare, Settings, Trash, Pencil } from 'lucide-react'
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
  onNewChat: () => void
  onSelectChat: (id: string) => void
  onDeleteChat: (id: string) => void
  onRenameChat: (id: string) => void
}

export default function Sidebar({
  chats,
  activeChatId,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  onRenameChat,
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <aside
      className={cn(
        'bg-[#1e1e1e] text-white border-r border-gray-700 flex flex-col transition-all duration-500',
        isOpen ? 'w-64' : 'w-16'
      )}
    >
      {/* Header */}
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
          title={isOpen ? 'Collapse' : 'Expand'}
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

      {/* New Chat */}
      <div className="p-3">
        <Button
          onClick={onNewChat}
          variant="secondary"
          className="w-full justify-start gap-2 bg-[#2a2a2d] hover:bg-[#343437]"
        >
          <Plus className="w-4 h-4" />
          {isOpen && 'New Chat'}
        </Button>
      </div>

      {/* Chat List */}
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
                      ? 'bg-slate-300 text-black hover:bg-slate-600'
                      : 'hover:bg-[#2a2a2d]'
                  )}
                  onClick={() => onSelectChat(chat.id)}
                >
                  <MessageSquare className="w-4 h-4" />
                  {isOpen && chat.title}
                </Button>
              </ContextMenuTrigger>

              <ContextMenuContent>
                <ContextMenuItem onClick={() => onRenameChat(chat.id)}>
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
          <p className={cn('text-gray-500 text-sm px-3', !isOpen && 'hidden')}>
            No chats yet
          </p>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t border-gray-700">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-gray-400 hover:text-white"
        >
          <Settings className="w-4 h-4" />
          {isOpen && 'Settings'}
        </Button>
      </div>
    </aside>
  )
}
