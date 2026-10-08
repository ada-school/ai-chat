import type { ChatProvider, GenerateReplyRequest } from './types'

interface OllamaChatResponse {
  content: string | undefined
  error: string | undefined
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function parseResponse(value: unknown): OllamaChatResponse {
  if (!isRecord(value)) return { content: undefined, error: undefined }

  const message = isRecord(value.message) ? value.message : undefined
  return {
    content: typeof message?.content === 'string' ? message.content : undefined,
    error: typeof value.error === 'string' ? value.error : undefined,
  }
}

export class OllamaRequestError extends Error {
  readonly status: number
  readonly code: string | undefined

  constructor(message: string, status: number, code?: string) {
    super(message)
    this.name = 'OllamaRequestError'
    this.status = status
    this.code = code
  }
}

export interface OllamaProviderOptions {
  baseUrl: string
  model: string
}

export class OllamaChatProvider implements ChatProvider {
  readonly name = 'Ollama'

  private readonly baseUrl: string
  private readonly model: string

  constructor({ baseUrl, model }: OllamaProviderOptions) {
    this.baseUrl = baseUrl.replace(/\/+$/, '')
    this.model = model
  }

  async generateReply({ messages, signal }: GenerateReplyRequest): Promise<string> {
    let response: Response
    try {
      response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          messages,
          stream: false,
        }),
        signal,
      })
    } catch (error) {
      if (signal?.aborted) throw error
      throw new OllamaRequestError('Ollama server could not be reached.', 0, 'OLLAMA_UNREACHABLE')
    }

    let data: OllamaChatResponse
    try {
      data = parseResponse(await response.json())
    } catch {
      throw new OllamaRequestError('Ollama returned an invalid response.', response.status)
    }

    if (!response.ok) {
      const modelNotFound = /model .* not found|pull model/i.test(data.error ?? '')
      throw new OllamaRequestError(
        data.error ?? 'Ollama could not complete the request.',
        response.status,
        modelNotFound ? 'MODEL_NOT_FOUND' : 'OLLAMA_HTTP_ERROR',
      )
    }

    const reply = data.content?.trim()
    if (!reply) throw new OllamaRequestError('Ollama returned an empty reply.', response.status)
    return reply
  }
}
