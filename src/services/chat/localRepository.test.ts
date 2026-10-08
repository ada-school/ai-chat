import { beforeEach, describe, expect, it } from 'vitest'
import { LocalChatRepository } from './localRepository'

describe('LocalChatRepository', () => {
  let repo: LocalChatRepository

  beforeEach(() => {
    localStorage.clear()
    repo = new LocalChatRepository(localStorage)
  })

  it('creates conversations and stores messages in order', async () => {
    const conversation = await repo.createConversation('First')
    await repo.addMessage({ conversationId: conversation.id, role: 'user', content: 'hi' })
    await repo.addMessage({ conversationId: conversation.id, role: 'assistant', content: 'hello' })

    const messages = await repo.listMessages(conversation.id)
    expect(messages.map((m) => m.content)).toEqual(['hi', 'hello'])
  })

  it('persists model details with assistant messages', async () => {
    const conversation = await repo.createConversation('Model metadata')
    const modelDetails = {
      provider: 'ollama' as const,
      model: 'llama3.2',
      source: 'Local Ollama server',
    }
    await repo.addMessage({
      conversationId: conversation.id,
      role: 'assistant',
      content: 'Hello',
      modelDetails,
    })

    expect(await repo.listMessages(conversation.id)).toMatchObject([{ modelDetails }])
  })

  it('lists the most recently active conversation first', async () => {
    const a = await repo.createConversation('A')
    await repo.createConversation('B')
    await new Promise((r) => setTimeout(r, 2))
    await repo.addMessage({ conversationId: a.id, role: 'user', content: 'bump' })

    const titles = (await repo.listConversations()).map((c) => c.title)
    expect(titles).toEqual(['A', 'B'])
  })

  it('deletes a conversation together with its messages', async () => {
    const conversation = await repo.createConversation('Gone')
    await repo.addMessage({ conversationId: conversation.id, role: 'user', content: 'x' })
    await repo.deleteConversation(conversation.id)

    expect(await repo.listConversations()).toEqual([])
    expect(await repo.listMessages(conversation.id)).toEqual([])
  })
})
