export type AiProviderId = 'mock' | 'ollama' | 'gemini'

export type ProviderPricing =
  | { kind: 'local'; description: string }
  | { kind: 'free'; description: string }
  | {
      kind: 'per-token'
      currency: 'USD'
      inputPerMillionTokens: number
      outputPerMillionTokens: number
    }
  | { kind: 'unknown'; description: string }

export interface ProviderMetadata {
  id: AiProviderId
  displayName: string
  source: string
  modelLabel: string
  description: string
  pricing: ProviderPricing
}
