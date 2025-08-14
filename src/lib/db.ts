import Dexie, { type EntityTable } from 'dexie'
import type { Message } from '@/components/ChatWindow'

export interface StoredSession {
  preset: 'General' | 'Code' | 'Summarizer'
  messages: Message[]
}

class SidekickDB extends Dexie {
  [x: string]: any
  sessions!: EntityTable<StoredSession, 'preset'>

  constructor() {
    super('SidekickDB')
    this.version(1).stores({
      sessions: 'preset'
    })
  }
}

export const db = new SidekickDB()