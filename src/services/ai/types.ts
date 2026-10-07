import type { ChatTurn } from '../../types/chat'

export interface GenerateReplyRequest {
  conversationId: string
  /** Full history including the latest user message, oldest first. */
  messages: ChatTurn[]
  signal?: AbortSignal
}

/**
 * Anything that can produce an assistant reply. The UI and hooks depend only
 * on this interface, so swapping mock → Gemini is a one-line change in the factory.
 */
export interface ChatProvider {
  readonly name: string
  generateReply(request: GenerateReplyRequest): Promise<string>
}
