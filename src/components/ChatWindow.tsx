import { useEffect, useRef } from 'react'
import type { Message } from '../types/chat'
import { InputArea } from './InputArea'
import { MessageBubble } from './MessageBubble'
import { TypingIndicator } from './TypingIndicator'
import { MenuIcon, PlusIcon } from './icons'

const SUGGESTIONS = ['Hello!', 'What can you do?', 'Tell me about Gemini']

interface ChatWindowProps {
  title: string
  messages: Message[]
  isLoading: boolean
  isGenerating: boolean
  isBusy: boolean
  error: string | null
  onDismissError: () => void
  onSend: (text: string) => void
  onStop: () => void
  onOpenSidebar: () => void
  onNewChat: () => void
}

export function ChatWindow({
  title,
  messages,
  isLoading,
  isGenerating,
  isBusy,
  error,
  onDismissError,
  onSend,
  onStop,
  onOpenSidebar,
  onNewChat,
}: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const isEmpty = !isLoading && messages.length === 0 && !isGenerating

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages.length, isGenerating])

  return (
    <main className="flex h-full min-w-0 flex-1 flex-col">
      <header className="flex h-14 shrink-0 items-center gap-2 px-3 md:px-5">
        <button
          type="button"
          onClick={onOpenSidebar}
          aria-label="Open conversations"
          className="rounded-lg p-2 hover:bg-neutral-100 md:hidden dark:hover:bg-neutral-800"
        >
          <MenuIcon />
        </button>
        <h1 className="flex-1 truncate text-base font-medium">{title}</h1>
        <button
          type="button"
          onClick={onNewChat}
          aria-label="New chat"
          className="rounded-lg p-2 hover:bg-neutral-100 md:hidden dark:hover:bg-neutral-800"
        >
          <PlusIcon />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto" aria-live="polite">
        {isEmpty ? (
          <div className="flex h-full flex-col items-center justify-center gap-6 px-4">
            <h2 className="text-2xl font-semibold">How can I help you today?</h2>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => onSend(suggestion)}
                  disabled={isBusy}
                  className="rounded-full border border-neutral-200 px-4 py-2 text-sm hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6">
            {isLoading && <p className="text-center text-sm text-neutral-500">Loading messages…</p>}
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isGenerating && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <div className="mx-auto w-full max-w-3xl px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        {error && (
          <div
            role="alert"
            className="mb-2 flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
          >
            <span>{error}</span>
            <button type="button" onClick={onDismissError} className="font-medium underline">
              Dismiss
            </button>
          </div>
        )}
        <InputArea onSend={onSend} onStop={onStop} isGenerating={isGenerating} disabled={isBusy && !isGenerating} />
        <p className="mt-2 text-center text-xs text-neutral-500">
          Replies are hardcoded in this version. AI integration is coming soon.
        </p>
      </div>
    </main>
  )
}
