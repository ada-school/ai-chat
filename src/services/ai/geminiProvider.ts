import type { SupabaseClient } from '@supabase/supabase-js'
import type { ChatProvider, GenerateReplyRequest } from './types'

interface ChatFunctionResponse {
  reply: string
}

/**
 * Placeholder Gemini integration. The browser never holds the Gemini key:
 * requests go through the `chat` Supabase Edge Function, which calls Gemini
 * server-side (see supabase/functions/chat). Until that is live, any failure
 * falls back to the provided provider so the chat keeps working.
 */
export class GeminiChatProvider implements ChatProvider {
  readonly name = 'gemini'

  private readonly supabase: SupabaseClient | null
  private readonly fallback: ChatProvider

  constructor(supabase: SupabaseClient | null, fallback: ChatProvider) {
    this.supabase = supabase
    this.fallback = fallback
  }

  async generateReply(request: GenerateReplyRequest): Promise<string> {
    if (!this.supabase) {
      console.warn('[ai] Gemini requires Supabase; using fallback provider.')
      return this.fallback.generateReply(request)
    }

    try {
      const { data, error } = await this.supabase.functions.invoke<ChatFunctionResponse>('chat', {
        body: { conversationId: request.conversationId, messages: request.messages },
        signal: request.signal,
      })
      if (error) throw error
      if (!data?.reply) throw new Error('Empty reply from chat function')
      return data.reply
    } catch (err) {
      if (request.signal?.aborted) throw err
      console.warn('[ai] Gemini call failed; using fallback provider.', err)
      return this.fallback.generateReply(request)
    }
  }
}
