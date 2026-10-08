import { afterEach, describe, expect, it, vi } from 'vitest'
import { listOllamaModels } from './ollamaModels'

afterEach(() => vi.unstubAllGlobals())

describe('listOllamaModels', () => {
  it('returns model names from Ollama and normalizes the configured URL', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ models: [{ name: 'llama3.2:latest' }, { name: 'qwen2.5' }] })),
    )
    vi.stubGlobal('fetch', fetchMock)

    await expect(listOllamaModels('http://localhost:11434/')).resolves.toEqual([
      { name: 'llama3.2:latest' },
      { name: 'qwen2.5' },
    ])
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:11434/api/tags', { signal: undefined })
  })

  it('rejects malformed model-list responses', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ models: 'none' }))))

    await expect(listOllamaModels('http://localhost:11434')).rejects.toThrow('invalid model list')
  })
})
