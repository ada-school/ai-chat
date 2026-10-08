import { env } from '../../lib/env'
import { supabase } from '../../lib/supabase'
import type { AiProviderId } from '../../types/ai'
import { GeminiChatProvider } from './geminiProvider'
import { MockChatProvider } from './mockProvider'
import { OllamaChatProvider } from './ollamaProvider'
import type { ChatProvider } from './types'

export type { ChatProvider, GenerateReplyRequest } from './types'
export type { AiProviderId, ProviderMetadata, ProviderPricing } from '../../types/ai'
export { PROVIDER_CATALOG } from './catalog'

let provider: ChatProvider | undefined

interface ProviderConfiguration {
  mockReplyDelayMs: number
  ollamaBaseUrl: string
  ollamaModel: string
}

const providerFactories: Record<AiProviderId, (config: ProviderConfiguration) => ChatProvider> = {
  mock: (config) => new MockChatProvider(config.mockReplyDelayMs),
  ollama: (config) => new OllamaChatProvider({ baseUrl: config.ollamaBaseUrl, model: config.ollamaModel }),
  gemini: () => new GeminiChatProvider(supabase, new MockChatProvider(env.mockReplyDelayMs)),
}

/** Builds the selected provider from the decoupled provider registry. */
export function createChatProvider(
  id: AiProviderId,
  config: ProviderConfiguration = env,
): ChatProvider {
  return providerFactories[id](config)
}

/** Single place where the AI backend is chosen (driven by VITE_AI_PROVIDER). */
export function getChatProvider(): ChatProvider {
  if (provider) return provider
  provider = createChatProvider(env.aiProvider)
  return provider
}
