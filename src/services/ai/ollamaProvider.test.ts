import { afterEach, describe, expect, it, vi } from 'vitest'
import { OllamaChatProvider } from './ollamaProvider'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('OllamaChatProvider', () => {
  it('sends the conversation to the configured Ollama model', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ message: { content: '  A local answer.  ' } }), { status: 200 }),
    )
    vi.stubGlobal('fetch', fetchMock)
    const provider = new OllamaChatProvider({
      baseUrl: 'http://localhost:11434/',
      model: 'llama3.2',
    })
    const controller = new AbortController()
    const messages = [
      { role: 'user' as const, content: 'Hello' },
      { role: 'assistant' as const, content: 'Hi' },
    ]

    await expect(
      provider.generateReply({ conversationId: 'conversation-1', messages, signal: controller.signal }),
    ).resolves.toBe('A local answer.')

    expect(fetchMock).toHaveBeenCalledWith('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'llama3.2', messages, stream: false }),
      signal: controller.signal,
    })
  })

  it('surfaces a typed error when the configured model is missing', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: "model 'missing-model' not found" }), { status: 404 }),
      ),
    )
    const provider = new OllamaChatProvider({
      baseUrl: 'http://localhost:11434',
      model: 'missing-model',
    })

    await expect(
      provider.generateReply({
        conversationId: 'conversation-1',
        messages: [{ role: 'user', content: 'Hello' }],
      }),
    ).rejects.toMatchObject({ status: 404, code: 'MODEL_NOT_FOUND' })
  })

  it('reports a dedicated error when the local server cannot be reached', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
    const provider = new OllamaChatProvider({
      baseUrl: 'http://localhost:11434',
      model: 'llama3.2',
    })

    await expect(
      provider.generateReply({
        conversationId: 'conversation-1',
        messages: [{ role: 'user', content: 'Hello' }],
      }),
    ).rejects.toMatchObject({ code: 'OLLAMA_UNREACHABLE' })
  })
})
