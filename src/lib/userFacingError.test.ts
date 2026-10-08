import { describe, expect, it } from 'vitest'
import { userFacingError } from './userFacingError'

describe('userFacingError', () => {
  it('maps network errors without exposing their technical details', () => {
    expect(userFacingError(new TypeError('Failed to fetch'), 'savingMessage')).toBe(
      "You're offline or the connection was interrupted. Reconnect and try again.",
    )
  })

  it('recognizes network errors nested in a function error', () => {
    expect(
      userFacingError(
        { message: 'Edge Function failed', context: new TypeError('Load failed') },
        'generatingReply',
      ),
    ).toContain('Your message is saved')
  })

  it('maps permission and service errors from structured metadata', () => {
    expect(userFacingError({ code: '42501' }, 'deletingConversation')).toContain('permission')
    expect(userFacingError({ status: 503 }, 'loadingConversations')).toContain('temporarily unavailable')
  })

  it('gives Ollama-specific guidance when a local model is unavailable', () => {
    expect(
      userFacingError(
        { code: 'MODEL_NOT_FOUND', status: 404, message: "model 'missing' not found" },
        'generatingReply',
      ),
    ).toContain('Pull the model in Ollama')
  })

  it('points to Ollama server settings when its local endpoint cannot be reached', () => {
    expect(userFacingError({ code: 'OLLAMA_UNREACHABLE' }, 'generatingReply')).toContain(
      'VITE_OLLAMA_BASE_URL',
    )
  })

  it('uses contextual safe copy for unknown failures', () => {
    const message = userFacingError(new Error('secret database host details'), 'savingMessage')

    expect(message).toBe("We couldn't save your message. Please try again.")
    expect(message).not.toContain('secret database host details')
  })
})
