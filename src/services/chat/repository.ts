import type { Conversation, Message, MessageModelDetails, Role } from '../../types/chat'

export interface NewMessage {
  conversationId: string
  role: Role
  content: string
  modelDetails?: MessageModelDetails
}

/** Persistence boundary for conversations and messages. */
export interface ChatRepository {
  readonly kind: 'supabase' | 'local'
  listConversations(): Promise<Conversation[]>
  createConversation(title: string): Promise<Conversation>
  renameConversation(id: string, title: string): Promise<void>
  deleteConversation(id: string): Promise<void>
  /** Messages in chronological order. */
  listMessages(conversationId: string): Promise<Message[]>
  addMessage(input: NewMessage): Promise<Message>
}
