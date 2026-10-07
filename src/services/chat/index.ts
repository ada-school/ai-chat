import { supabase } from '../../lib/supabase'
import { LocalChatRepository } from './localRepository'
import type { ChatRepository } from './repository'
import { SupabaseChatRepository } from './supabaseRepository'

export type { ChatRepository, NewMessage } from './repository'

let repository: ChatRepository | undefined

export function getChatRepository(): ChatRepository {
  repository ??= supabase ? new SupabaseChatRepository(supabase) : new LocalChatRepository()
  return repository
}
