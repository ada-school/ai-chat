import { describe, expect, it } from 'vitest'
import { createChatProvider, PROVIDER_CATALOG } from './index'
import { OllamaChatProvider } from './ollamaProvider'

describe('AI provider registry', () => {
  it('creates the configured provider without coupling callers to its implementation', () => {
    const provider = createChatProvider('ollama', {
      mockReplyDelayMs: 0,
      ollamaBaseUrl: 'http://127.0.0.1:11434',
      ollamaModel: 'qwen2.5',
    })

    expect(provider).toBeInstanceOf(OllamaChatProvider)
    expect(provider.name).toBe('Ollama')
  })

  it('exposes pricing metadata without inventing cloud provider rates', () => {
    expect(PROVIDER_CATALOG.ollama.pricing.kind).toBe('local')
    expect(PROVIDER_CATALOG.gemini.pricing.kind).toBe('unknown')
  })
})
