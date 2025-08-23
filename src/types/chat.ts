export type Role = 'system' | 'user' | 'assistant'

export interface Message {
  id: string
  role: Role
  content: string
}

export interface ChatType {
  id: string
  title: string
  createdAt: number
  updatedAt: number
}
