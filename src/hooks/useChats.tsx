'use client'

import { useEffect, useState } from 'react'
import { db, createChat } from '@/lib/db'
import { ChatType } from '@/components/chat/ChatWindow'

export function useChats(initialChatId?: string) {
  const [chats, setChats] = useState<ChatType[]>([])
  const [activeChatId, setActiveChatId] = useState<string | null>(initialChatId ?? null)
  const [renamingChatId, setRenamingChatId] = useState<string | null>(null)

  // Load chats
  useEffect(() => {
    const load = async () => {
      const all = await db.chats.orderBy('updatedAt').reverse().toArray()
      setChats(all)
      if (!activeChatId && all.length) setActiveChatId(all[0].id)
    }
    load()
  }, [activeChatId])

  // Restore from localStorage
  useEffect(() => {
    if (!initialChatId) {
      const saved = localStorage.getItem('activeChatId')
      if (saved) setActiveChatId(saved)
    }
  }, [initialChatId])

  // Persist active chat
  useEffect(() => {
    if (activeChatId) localStorage.setItem('activeChatId', activeChatId)
  }, [activeChatId])

  // Handlers
  const handleNewChat = async () => {
    const chat = await createChat()
    const all = await db.chats.orderBy('updatedAt').reverse().toArray()
    setChats(all)
    setActiveChatId(chat.id)
  }

  const updateChatTitle = async (id: string, title: string) => {
  await db.chats.update(id, { title, updatedAt: Date.now() })
  setChats(prev =>
    prev.map(c =>
      c.id === id ? { ...c, title, updatedAt: Date.now() } : c
    )
  )
  }

  const handleDeleteChat = async (id: string) => {
    await db.messages.where('chatId').equals(id).delete()
    await db.chats.delete(id)
    const updated = await db.chats.orderBy('updatedAt').reverse().toArray()
    setChats(updated)
    setActiveChatId(updated[0]?.id || null)
  }

  const handleRenameChat = async (id: string, newTitle: string) => {
    const trimmed = newTitle.trim()
    if (!trimmed) return
    await db.chats.update(id, { title: trimmed, updatedAt: Date.now() })
    setChats(prev =>
      prev.map(c => (c.id === id ? { ...c, title: trimmed, updatedAt: Date.now() } : c))
    )
  }

  return {
    chats,
    activeChatId,
    setActiveChatId,
    renamingChatId,
    setRenamingChatId,
    handleNewChat,
    handleDeleteChat,
    handleRenameChat,
    updateChatTitle
  }
}
