'use client'

import { useState } from 'react'

export function useChatEditing(
  chats: { id: string; title: string }[],
  onRenameChat: (id: string, newTitle: string) => void
) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  const startEditing = (chatId: string, currentTitle: string) => {
    setEditingId(chatId)
    setEditValue(currentTitle)
  }

  const saveEdit = (chatId: string) => {
    const originalTitle = chats.find(c => c.id === chatId)?.title || ''
    if (editValue.trim()) {
      onRenameChat(chatId, editValue.trim())
    } else {
      setEditValue(originalTitle)
    }
    setEditingId(null)
  }

  const cancelEdit = (chatId: string) => {
    setEditingId(null)
    setEditValue(chats.find(c => c.id === chatId)?.title || '')
  }

  return {
    editingId,
    editValue,
    setEditValue,
    startEditing,
    saveEdit,
    cancelEdit,
  }
}
