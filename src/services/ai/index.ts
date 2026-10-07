import { env } from '../../lib/env'
import { supabase } from '../../lib/supabase'
import { GeminiChatProvider } from './geminiProvider'
import { MockChatProvider } from './mockProvider'
import type { ChatProvider } from './types'

export type { ChatProvider, GenerateReplyRequest } from './types'

let provider: ChatProvider | undefined

/** Single place where the AI backend is chosen (driven by VITE_AI_PROVIDER). */
export function getChatProvider(): ChatProvider {
  if (provider) return provider
  const mock = new MockChatProvider(env.mockReplyDelayMs)
  provider = env.aiProvider === 'gemini' ? new GeminiChatProvider(supabase, mock) : mock
  return provider
}
