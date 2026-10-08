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

  it('uses contextual safe copy for unknown failures', () => {
    const message = userFacingError(new Error('secret database host details'), 'savingMessage')

    expect(message).toBe("We couldn't save your message. Please try again.")
    expect(message).not.toContain('secret database host details')
  })
})
