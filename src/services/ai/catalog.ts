import type { AiProviderId, ProviderMetadata } from '../../types/ai'

export const PROVIDER_CATALOG: Record<AiProviderId, ProviderMetadata> = {
  mock: {
    id: 'mock',
    displayName: 'Demo replies',
    source: 'Built-in',
    modelLabel: 'Demo responses',
    description: 'Hardcoded demonstration responses.',
    pricing: { kind: 'free', description: 'No provider usage cost.' },
  },
  ollama: {
    id: 'ollama',
    displayName: 'Ollama (local)',
    source: 'Local Ollama server',
    modelLabel: 'Select a local model',
    description: 'Runs a model on your Ollama server; prompts are sent to its configured URL.',
    pricing: { kind: 'local', description: 'No per-token provider charge; uses your own hardware.' },
  },
  gemini: {
    id: 'gemini',
    displayName: 'Gemini',
    source: 'Supabase Edge Function',
    modelLabel: 'Configured in Supabase',
    description: 'Calls the configured Supabase Edge Function and falls back to demo replies.',
    pricing: {
      kind: 'unknown',
      description: 'Depends on the selected model and current provider pricing.',
    },
  },
}
