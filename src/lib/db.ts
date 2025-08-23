import Dexie, { type EntityTable } from 'dexie'
import type { Role } from '@/types/chat'

export interface Chat {
  id: string
  title: string
  createdAt: number
  updatedAt: number
}

export interface ChatMessage {
  id: string
  chatId: string
  role: Role
  content: string
  createdAt: number
}

class SidekickDB extends Dexie {
  chats!: EntityTable<Chat, 'id'>
  messages!: EntityTable<ChatMessage, 'id'>

  constructor() {
    super('SidekickDB')
    this.version(3).stores({
      chats: 'id, updatedAt',
      messages: 'id, chatId, createdAt',
    })
  }
}

export const db = new SidekickDB()

// Create a new chat
export async function createChat() {
  const id = crypto.randomUUID()
  const chat: Chat = {
    id,
    title: 'Untitled',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
  await db.chats.add(chat)
  return chat
}

export async function getChat(id: string) {
  return db.chats.get(id)
}

export async function getAllChats() {
  return db.chats.orderBy('updatedAt').reverse().toArray()
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
