import type { ChatProvider, GenerateReplyRequest } from './types'

interface CannedReply {
  match: RegExp
  reply: string
}

const CANNED_REPLIES: CannedReply[] = [
  {
    match: /\b(hi|hello|hey|hola)\b/i,
    reply: "Hello! These are demo replies. Select the local Ollama provider to chat with a real model on your machine.",
  },
  {
    match: /\b(help|what can you do)\b/i,
    reply:
      'This app can:\n\n- Keep your conversations saved\n- Run an LLM locally through Ollama\n- Use demo replies without an LLM connection\n\nSelect Ollama in the AI provider settings to use a local model.',
  },
  {
    match: /\b(gemini|ai|model)\b/i,
    reply:
      'Ollama is available for local model responses. Gemini uses the configured Supabase Edge Function and currently falls back to demo replies if unavailable.',
  },
  {
    match: /\b(thanks|thank you|gracias)\b/i,
    reply: "You're welcome!",
  },
]

const FALLBACK_REPLIES = [
  "That's interesting! (This is a demo reply.)",
  'Got it. Select Ollama to generate a response with a local language model.',
  'This is a demo reply, and your message has been saved.',
]

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(signal.reason)
    const timer = setTimeout(resolve, ms)
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer)
        reject(signal.reason)
      },
      { once: true },
    )
  })
}

export function pickMockReply(input: string, turnIndex: number): string {
  const canned = CANNED_REPLIES.find(({ match }) => match.test(input))
  if (canned) return canned.reply
  return FALLBACK_REPLIES[turnIndex % FALLBACK_REPLIES.length]
}

export class MockChatProvider implements ChatProvider {
  readonly name = 'mock'

  private readonly delayMs: number

  constructor(delayMs = 700) {
    this.delayMs = delayMs
  }

  async generateReply({ messages, signal }: GenerateReplyRequest): Promise<string> {
    await sleep(this.delayMs, signal)
    const lastUser = [...messages].reverse().find((m) => m.role === 'user')
    const userTurns = messages.filter((m) => m.role === 'user').length
    return pickMockReply(lastUser?.content ?? '', Math.max(0, userTurns - 1))
  }
}
