import type { ChatProvider, GenerateReplyRequest } from './types'

interface CannedReply {
  match: RegExp
  reply: string
}

const CANNED_REPLIES: CannedReply[] = [
  {
    match: /\b(hi|hello|hey|hola)\b/i,
    reply: "Hello! I'm a placeholder assistant. Real AI responses are coming soon — for now I reply with canned messages.",
  },
  {
    match: /\b(help|what can you do)\b/i,
    reply:
      'Right now I can:\n\n- Keep your conversations saved\n- Work offline as an installable app\n- Reply with hardcoded messages\n\nOnce Gemini is connected I will answer for real.',
  },
  {
    match: /\b(gemini|ai|model)\b/i,
    reply: 'This app is wired to use Google Gemini later. In v1 every reply comes from a mock provider.',
  },
  {
    match: /\b(thanks|thank you|gracias)\b/i,
    reply: "You're welcome!",
  },
]

const FALLBACK_REPLIES = [
  "That's interesting! (This is a hardcoded reply — AI isn't connected yet.)",
  'Got it. Once Gemini is plugged in, I will be able to give you a real answer.',
  "I'm a demo assistant for now, but your message has been saved.",
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
