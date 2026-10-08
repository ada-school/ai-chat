import type { Conversation, Message } from '../../types/chat'
import type { ChatRepository, NewMessage } from './repository'

const STORAGE_KEY = 'ai-chat:v1'
const LOCAL_USER_ID = 'local-user'

interface Store {
  conversations: Conversation[]
  messages: Message[]
}

/**
 * localStorage-backed repository used when Supabase isn't configured, so the
 * app is fully usable on a fresh clone. Data stays on this device only.
 */
export class LocalChatRepository implements ChatRepository {
  readonly kind = 'local'

  private readonly storage: Storage

  constructor(storage: Storage = window.localStorage) {
    this.storage = storage
  }

  private read(): Store {
    try {
      const raw = this.storage.getItem(STORAGE_KEY)
      if (raw) return JSON.parse(raw) as Store
    } catch {
      // Corrupt or inaccessible storage: start fresh rather than crash.
    }
    return { conversations: [], messages: [] }
  }

  private write(store: Store): void {
    this.storage.setItem(STORAGE_KEY, JSON.stringify(store))
  }

  async listConversations(): Promise<Conversation[]> {
    return [...this.read().conversations].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }

  async createConversation(title: string): Promise<Conversation> {
    const store = this.read()
    const now = new Date().toISOString()
    const conversation: Conversation = {
      id: crypto.randomUUID(),
      userId: LOCAL_USER_ID,
      title,
      createdAt: now,
      updatedAt: now,
    }
    store.conversations.push(conversation)
    this.write(store)
    return conversation
  }

  async renameConversation(id: string, title: string): Promise<void> {
    const store = this.read()
    const conversation = store.conversations.find((c) => c.id === id)
    if (!conversation) throw new Error(`Conversation ${id} not found`)
    conversation.title = title
    this.write(store)
  }

  async deleteConversation(id: string): Promise<void> {
    const store = this.read()
    this.write({
      conversations: store.conversations.filter((c) => c.id !== id),
      messages: store.messages.filter((m) => m.conversationId !== id),
    })
  }

  async listMessages(conversationId: string): Promise<Message[]> {
    return this.read()
      .messages.filter((m) => m.conversationId === conversationId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  }

  async addMessage({ conversationId, role, content, modelDetails }: NewMessage): Promise<Message> {
    const store = this.read()
    const conversation = store.conversations.find((c) => c.id === conversationId)
    if (!conversation) throw new Error(`Conversation ${conversationId} not found`)
    const message: Message = {
      id: crypto.randomUUID(),
      conversationId,
      role,
      content,
      createdAt: new Date().toISOString(),
      ...(modelDetails ? { modelDetails } : {}),
    }
    store.messages.push(message)
    conversation.updatedAt = message.createdAt
    this.write(store)
    return message
  }
}
