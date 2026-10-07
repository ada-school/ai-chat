import type { SupabaseClient } from '@supabase/supabase-js'
import type { Conversation, Message, Role } from '../../types/chat'
import type { ChatRepository, NewMessage } from './repository'

interface ConversationRow {
  id: string
  user_id: string
  title: string
  created_at: string
  updated_at: string
}

interface MessageRow {
  id: string
  conversation_id: string
  role: Role
  content: string
  created_at: string
}

const toConversation = (row: ConversationRow): Conversation => ({
  id: row.id,
  userId: row.user_id,
  title: row.title,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

const toMessage = (row: MessageRow): Message => ({
  id: row.id,
  conversationId: row.conversation_id,
  role: row.role,
  content: row.content,
  createdAt: row.created_at,
})

export class SupabaseChatRepository implements ChatRepository {
  readonly kind = 'supabase'

  private readonly client: SupabaseClient

  constructor(client: SupabaseClient) {
    this.client = client
  }

  private async userId(): Promise<string> {
    const { data, error } = await this.client.auth.getSession()
    if (error) throw error
    const id = data.session?.user.id
    if (!id) throw new Error('Not signed in')
    return id
  }

  async listConversations(): Promise<Conversation[]> {
    const { data, error } = await this.client
      .from('conversations')
      .select('id, user_id, title, created_at, updated_at')
      .order('updated_at', { ascending: false })
    if (error) throw error
    return (data as ConversationRow[]).map(toConversation)
  }

  async createConversation(title: string): Promise<Conversation> {
    const { data, error } = await this.client
      .from('conversations')
      .insert({ title, user_id: await this.userId() })
      .select('id, user_id, title, created_at, updated_at')
      .single()
    if (error) throw error
    return toConversation(data as ConversationRow)
  }

  async renameConversation(id: string, title: string): Promise<void> {
    const { error } = await this.client.from('conversations').update({ title }).eq('id', id)
    if (error) throw error
  }

  async deleteConversation(id: string): Promise<void> {
    const { error } = await this.client.from('conversations').delete().eq('id', id)
    if (error) throw error
  }

  async listMessages(conversationId: string): Promise<Message[]> {
    const { data, error } = await this.client
      .from('messages')
      .select('id, conversation_id, role, content, created_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
    if (error) throw error
    return (data as MessageRow[]).map(toMessage)
  }

  async addMessage({ conversationId, role, content }: NewMessage): Promise<Message> {
    const { data, error } = await this.client
      .from('messages')
      .insert({ conversation_id: conversationId, role, content, user_id: await this.userId() })
      .select('id, conversation_id, role, content, created_at')
      .single()
    if (error) throw error
    return toMessage(data as MessageRow)
  }
}
