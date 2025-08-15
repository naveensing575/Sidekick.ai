import Dexie, { type EntityTable } from 'dexie'
import type { Message, Role } from '@/components/ChatWindow'

export interface Chat {
  id: string
  preset: 'General' | 'Code' | 'Summarizer'
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

export interface StoredSession {
  preset: 'General' | 'Code' | 'Summarizer'
  messages: Message[]
}

class SidekickDB extends Dexie {
  chats!: EntityTable<Chat, 'id'>
  messages!: EntityTable<ChatMessage, 'id'>
  sessions!: EntityTable<StoredSession, 'preset'>

  constructor() {
    super('SidekickDB')
    this.version(2).stores({
      chats: 'id, preset, updatedAt',
      messages: 'id, chatId, createdAt',
      sessions: 'preset'
    }).upgrade(async tx => {
      const oldSessions = await tx.table<StoredSession, string>('sessions').toArray()
      for (const session of oldSessions) {
        const chatId = crypto.randomUUID()
        await tx.table<Chat, string>('chats').add({
          id: chatId,
          preset: session.preset,
          title: `${session.preset} Chat`,
          createdAt: Date.now(),
          updatedAt: Date.now()
        })
        for (const m of session.messages) {
          await tx.table<ChatMessage, string>('messages').add({
            id: m.id || crypto.randomUUID(),
            chatId,
            role: m.role,
            content: m.content,
            createdAt: Date.now()
          })
        }
      }
    })
  }
}

export const db = new SidekickDB()

// CRUD Utils
export async function createChat(preset: Chat['preset']) {
  const id = crypto.randomUUID()
  const chat: Chat = {
    id,
    preset,
    title: `${preset} Chat`,
    createdAt: Date.now(),
    updatedAt: Date.now()
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
    createdAt: Date.now()
  }
  await db.messages.add(message)
  await db.chats.update(chatId, { updatedAt: Date.now() })
  return message
}
