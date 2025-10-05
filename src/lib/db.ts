import Dexie, { type EntityTable } from 'dexie'
import type { Role, ChatType, ChatMessage } from '@/types/chat'

class SidekickDB extends Dexie {
  chats!: EntityTable<ChatType, 'id'>
  messages!: EntityTable<ChatMessage, 'id'>

  constructor() {
    super('SidekickDB')
    this.version(4).stores({
      chats: 'id, updatedAt, order',
      messages: 'id, chatId, createdAt',
    }).upgrade(tx => {
      return tx.table('chats').toCollection().modify(chat => {
        if (chat.order === undefined) {
          chat.order = chat.updatedAt ?? Date.now()
        }
      })
    })
  }
}

export const db = new SidekickDB()

// Create a new chat
export async function createChat(order?: number) {
  const id = crypto.randomUUID()
  const now = Date.now()
  const chat: ChatType = {
    id,
    title: 'Untitled',
    createdAt: now,
    updatedAt: now,
    order: order ?? now,
  }
  await db.chats.add(chat)
  return chat
}

export async function getChat(id: string) {
  return db.chats.get(id)
}

export async function getAllChats() {
  return db.chats.orderBy('order').toArray()
}

export async function updateChatTitle(id: string, newTitle: string) {
  await db.chats.update(id, { title: newTitle, updatedAt: Date.now() })
}

export async function deleteChat(id: string) {
  await db.messages.where('chatId').equals(id).delete()
  await db.chats.delete(id)
}

export async function getMessages(chatId: string) {
  return db.messages.where('chatId').equals(chatId).sortBy('createdAt')
}

export async function addMessage(chatId: string, role: Role, content: string) {
  const message: ChatMessage = {
    id: crypto.randomUUID(),
    chatId,
    role,
    content,
    createdAt: Date.now(),
  }
  await db.messages.add(message)
  await db.chats.update(chatId, { updatedAt: Date.now() })
  return message
}

export async function updateMessage(id: string, content: string) {
  await db.messages.update(id, { content })
}

export async function deleteMessagesAfter(chatId: string, messageId: string) {
  const message = await db.messages.get(messageId)
  if (!message) return

  await db.messages
    .where('chatId')
    .equals(chatId)
    .and(msg => msg.createdAt > message.createdAt)
    .delete()
}
