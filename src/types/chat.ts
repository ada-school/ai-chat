export type Role = 'user' | 'assistant' | 'system'

export interface Conversation {
  id: string
  userId: string
  title: string
  createdAt: string
  updatedAt: string
}

export interface Message {
  id: string
  conversationId: string
  role: Role
  content: string
  createdAt: string
}

/** Minimal shape sent to an AI provider: role + content, oldest first. */
export interface ChatTurn {
  role: Role
  content: string
}
