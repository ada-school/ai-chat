import type { AiProviderId, ProviderMetadata } from '../../types/ai'

export const PROVIDER_CATALOG: Record<AiProviderId, ProviderMetadata> = {
  mock: {
    id: 'mock',
    displayName: 'Demo replies',
    description: 'Hardcoded demonstration responses.',
    pricing: { kind: 'free', description: 'No provider usage cost.' },
  },
  ollama: {
    id: 'ollama',
    displayName: 'Ollama (local)',
    description: 'Runs a model on your Ollama server; prompts are sent to its configured URL.',
    pricing: { kind: 'local', description: 'No per-token provider charge; uses your own hardware.' },
  },
  gemini: {
    id: 'gemini',
    displayName: 'Gemini',
    description: 'Calls the configured Supabase Edge Function and falls back to demo replies.',
    pricing: {
      kind: 'unknown',
      description: 'Depends on the selected model and current provider pricing.',
    },
  },
}
