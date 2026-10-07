import { useCallback, useEffect, useRef, useState } from 'react'
import type { ChatProvider } from '../services/ai'
import type { ChatRepository } from '../services/chat'
import type { Conversation, Message } from '../types/chat'

const TITLE_MAX_LENGTH = 40

export function titleFromMessage(text: string): string {
  const singleLine = text.replace(/\s+/g, ' ').trim()
  return singleLine.length > TITLE_MAX_LENGTH
    ? `${singleLine.slice(0, TITLE_MAX_LENGTH - 1).trimEnd()}…`
    : singleLine || 'New chat'
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : 'Something went wrong'
}

interface UseChatOptions {
  repository: ChatRepository
  provider: ChatProvider
  /** Wait until auth is ready before touching the repository. */
  enabled: boolean
}

export function useChat({ repository, provider, enabled }: UseChatOptions) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [generatingId, setGeneratingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Async callbacks read the latest active conversation from here so a reply
  // that lands after the user switched chats isn't shown in the wrong one.
  const activeIdRef = useRef<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const refreshConversations = useCallback(async () => {
    setConversations(await repository.listConversations())
  }, [repository])

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    repository
      .listConversations()
      .then((list) => !cancelled && setConversations(list))
      .catch((err) => !cancelled && setError(errorMessage(err)))
    return () => {
      cancelled = true
    }
  }, [enabled, repository])

  useEffect(() => () => abortRef.current?.abort(), [])

  const selectConversation = useCallback(
    async (id: string) => {
      activeIdRef.current = id
      setActiveId(id)
      setError(null)
      setIsLoadingMessages(true)
      try {
        const loaded = await repository.listMessages(id)
        if (activeIdRef.current === id) setMessages(loaded)
      } catch (err) {
        setError(errorMessage(err))
      } finally {
        if (activeIdRef.current === id) setIsLoadingMessages(false)
      }
    },
    [repository],
  )

  const startNewChat = useCallback(() => {
    activeIdRef.current = null
    setActiveId(null)
    setMessages([])
    setError(null)
  }, [])

  const deleteConversation = useCallback(
    async (id: string) => {
      try {
        await repository.deleteConversation(id)
        setConversations((prev) => prev.filter((c) => c.id !== id))
        if (activeIdRef.current === id) startNewChat()
      } catch (err) {
        setError(errorMessage(err))
      }
    },
    [repository, startNewChat],
  )

  const sendMessage = useCallback(
    async (rawText: string) => {
      const text = rawText.trim()
      if (!text || generatingId) return
      setError(null)

      let conversationId = activeIdRef.current
      const priorMessages = conversationId ? messages : []
      try {
        if (!conversationId) {
          const created = await repository.createConversation(titleFromMessage(text))
          conversationId = created.id
          activeIdRef.current = created.id
          setActiveId(created.id)
          setMessages([])
          setConversations((prev) => [created, ...prev])
        }

        const userMessage = await repository.addMessage({ conversationId, role: 'user', content: text })
        const history = [...priorMessages, userMessage]
        if (activeIdRef.current === conversationId) setMessages(history)

        setGeneratingId(conversationId)
        const controller = new AbortController()
        abortRef.current = controller

        const reply = await provider.generateReply({
          conversationId,
          messages: history.map(({ role, content }) => ({ role, content })),
          signal: controller.signal,
        })

        const assistantMessage = await repository.addMessage({
          conversationId,
          role: 'assistant',
          content: reply,
        })
        if (activeIdRef.current === conversationId) {
          setMessages((prev) => [...prev, assistantMessage])
        }
        await refreshConversations()
      } catch (err) {
        if (abortRef.current?.signal.aborted) return
        setError(errorMessage(err))
      } finally {
        abortRef.current = null
        setGeneratingId(null)
      }
    },
    [generatingId, messages, provider, refreshConversations, repository],
  )

  const stopGenerating = useCallback(() => abortRef.current?.abort(), [])

  return {
    conversations,
    activeId,
    messages,
    isLoadingMessages,
    isGenerating: generatingId !== null && generatingId === activeId,
    isBusy: generatingId !== null,
    error,
    dismissError: () => setError(null),
    selectConversation,
    startNewChat,
    deleteConversation,
    sendMessage,
    stopGenerating,
  }
}
