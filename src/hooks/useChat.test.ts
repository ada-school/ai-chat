import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { ChatProvider } from '../services/ai'
import type { ChatRepository } from '../services/chat'
import type { Conversation, Message } from '../types/chat'
import { titleFromMessage, useChat } from './useChat'

describe('titleFromMessage', () => {
  it('collapses whitespace', () => {
    expect(titleFromMessage('  hello\n\nworld  ')).toBe('hello world')
  })

  it('truncates long text with an ellipsis', () => {
    const title = titleFromMessage('a'.repeat(100))
    expect(title.length).toBe(40)
    expect(title.endsWith('…')).toBe(true)
  })

  it('keeps the user message and shows safe feedback when reply generation fails', async () => {
    const conversation: Conversation = {
      id: 'conversation-1',
      userId: 'user-1',
      title: 'Hello',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    }
    const userMessage: Message = {
      id: 'message-1',
      conversationId: conversation.id,
      role: 'user',
      content: 'Hello',
      createdAt: conversation.createdAt,
    }
    const repository: ChatRepository = {
      kind: 'local',
      listConversations: vi.fn().mockResolvedValue([]),
      createConversation: vi.fn().mockResolvedValue(conversation),
      renameConversation: vi.fn(),
      deleteConversation: vi.fn(),
      listMessages: vi.fn().mockResolvedValue([]),
      addMessage: vi.fn().mockResolvedValue(userMessage),
    }
    const provider: ChatProvider = {
      name: 'test',
      generateReply: vi.fn().mockRejectedValue(new Error('internal provider detail')),
    }
    const { result } = renderHook(() => useChat({ repository, provider, enabled: true }))

    await act(async () => result.current.sendMessage('Hello'))

    expect(result.current.error).toBe("We couldn't generate a reply. Your message is saved; please try again.")
    expect(result.current.error).not.toContain('internal provider detail')
    expect(result.current.messages).toEqual([userMessage])
  })
})
