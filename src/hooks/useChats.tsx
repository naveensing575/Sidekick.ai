'use client'

import { useEffect, useState } from 'react'
import { db, createChat } from '@/lib/db'
import { ChatType } from '@/types/chat'

export function useChats(initialChatId?: string) {
  const [chats, setChats] = useState<ChatType[]>([])
  const [activeChatId, setActiveChatId] = useState<string | null>(initialChatId ?? null)
  const [renamingChatId, setRenamingChatId] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const all = await db.chats.orderBy('order').toArray()
      setChats(all)
      if (!activeChatId && all.length) {
        setActiveChatId(all[0].id)
      }
    }
    load()
  }, [activeChatId])

  useEffect(() => {
    if (!initialChatId) {
      const saved = localStorage.getItem('activeChatId')
      if (saved) setActiveChatId(saved)
    }
  }, [initialChatId])

  useEffect(() => {
    if (activeChatId) {
      localStorage.setItem('activeChatId', activeChatId)
    }
  }, [activeChatId])

  const handleNewChat = async () => {
    const last = await db.chats.orderBy('order').last()
    const newOrder = last ? (last.order ?? 0) + 1 : 0
    const chat = await createChat(newOrder)
    const all = await db.chats.orderBy('order').toArray()
    setChats(all)
    setActiveChatId(chat.id)
    return chat
  }

  const updateChatTitle = async (id: string, title: string) => {
    await db.chats.update(id, { title, updatedAt: Date.now() })
    setChats(prev =>
      prev.map(c => (c.id === id ? { ...c, title, updatedAt: Date.now() } : c))
    )
  }

  const handleDeleteChat = async (id: string) => {
    await db.messages.where('chatId').equals(id).delete()
    await db.chats.delete(id)
    const updated = await db.chats.orderBy('order').toArray()
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

  const reorderChats = async (newOrder: ChatType[]) => {
    setChats(newOrder)
    await Promise.all(
      newOrder.map((chat, index) => db.chats.update(chat.id, { order: index }))
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
    updateChatTitle,
    reorderChats,
  }
}
