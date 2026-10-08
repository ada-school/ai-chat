import { describe, expect, it } from 'vitest'
import { MockChatProvider, pickMockReply } from './mockProvider'

describe('pickMockReply', () => {
  it('matches canned replies by keyword', () => {
    expect(pickMockReply('hello there', 0)).toMatch(/demo replies/)
  })

  it('cycles fallback replies for unmatched input', () => {
    expect(pickMockReply('xyz', 0)).not.toBe(pickMockReply('xyz', 1))
  })
})

describe('MockChatProvider', () => {
  it('replies to the latest user message', async () => {
    const provider = new MockChatProvider(0)
    const reply = await provider.generateReply({
      conversationId: 'c1',
      messages: [
        { role: 'user', content: 'random' },
        { role: 'assistant', content: 'ok' },
        { role: 'user', content: 'thanks!' },
      ],
    })
    expect(reply).toBe("You're welcome!")
  })

  it('rejects when aborted', async () => {
    const provider = new MockChatProvider(1000)
    const controller = new AbortController()
    const pending = provider.generateReply({
      conversationId: 'c1',
      messages: [{ role: 'user', content: 'hi' }],
      signal: controller.signal,
    })
    controller.abort()
    await expect(pending).rejects.toBeDefined()
  })
})
