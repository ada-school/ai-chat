import { useEffect, useRef } from 'react'
import type { AiProviderId } from '../types/ai'
import type { ColorTheme, MessageTextSize } from '../hooks/useAppearance'
import type { Message } from '../types/chat'
import { ConversationSettings } from './ConversationSettings'
import type { ChatModelOption } from './ChatConfiguration'
import { InputArea } from './InputArea'
import { MessageBubble } from './MessageBubble'
import { TypingIndicator } from './TypingIndicator'
import { MenuIcon, PanelLeftCloseIcon, PanelLeftOpenIcon, PlusIcon } from './icons'

interface ChatWindowProps {
  title: string
  source: string
  selectedProvider: AiProviderId
  modelLabel: string
  modelOptions: ChatModelOption[]
  selectedOptionId: string
  isLoadingModels: boolean
  modelLoadFailed: boolean
  onModelSelect: (option: ChatModelOption) => void
  onRefreshModels: () => void
  emptyMessage: string
  theme: ColorTheme
  textSize: MessageTextSize
  onThemeChange: (theme: ColorTheme) => void
  onTextSizeChange: (size: MessageTextSize) => void
  messages: Message[]
  isLoading: boolean
  isGenerating: boolean
  isBusy: boolean
  error: string | null
  onDismissError: () => void
  onSend: (text: string) => void
  onStop: () => void
  onOpenSidebar: () => void
  isSidebarCollapsed: boolean
  onToggleSidebar: () => void
  onNewChat: () => void
}

export function ChatWindow({
  title,
  source,
  selectedProvider,
  modelLabel,
  modelOptions,
  selectedOptionId,
  isLoadingModels,
  modelLoadFailed,
  onModelSelect,
  onRefreshModels,
  emptyMessage,
  theme,
  textSize,
  onThemeChange,
  onTextSizeChange,
  messages,
  isLoading,
  isGenerating,
  isBusy,
  error,
  onDismissError,
  onSend,
  onStop,
  onOpenSidebar,
  isSidebarCollapsed,
  onToggleSidebar,
  onNewChat,
}: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const isEmpty = !isLoading && messages.length === 0 && !isGenerating
  const activeModelLabel = modelOptions.find((option) => option.id === selectedOptionId)?.label ?? modelLabel

  useEffect(() => {
    const behavior = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
    bottomRef.current?.scrollIntoView({ behavior, block: 'end' })
  }, [messages.length, isGenerating])

  return (
    <main className="flex h-full min-w-0 flex-1 flex-col">
      <header className="flex min-h-14 shrink-0 items-center gap-2 px-3 md:px-5">
        <button
          type="button"
          onClick={onOpenSidebar}
          aria-label="Open conversations"
          className="rounded-lg p-2 hover:bg-neutral-100 md:hidden dark:hover:bg-neutral-800"
        >
          <MenuIcon />
        </button>
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label={isSidebarCollapsed ? 'Show conversations' : 'Collapse conversations'}
          title={isSidebarCollapsed ? 'Show conversations' : 'Collapse conversations'}
          className="hidden rounded-lg p-2 hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 md:flex dark:hover:bg-neutral-800 dark:focus-visible:outline-blue-400"
        >
          {isSidebarCollapsed ? <PanelLeftOpenIcon /> : <PanelLeftCloseIcon />}
        </button>
        <h1 className="flex-1 truncate text-base font-medium">{title}</h1>
        <ConversationSettings
          theme={theme}
          textSize={textSize}
          onThemeChange={onThemeChange}
          onTextSizeChange={onTextSizeChange}
          source={source}
          provider={selectedProvider}
          modelLabel={modelLabel}
          modelOptions={modelOptions}
          selectedOptionId={selectedOptionId}
          isLoadingModels={isLoadingModels}
          modelLoadFailed={modelLoadFailed}
          disabled={isBusy}
          onModelSelect={onModelSelect}
          onRefreshModels={onRefreshModels}
        />
        <button
          type="button"
          onClick={onNewChat}
          aria-label="New chat"
          className="rounded-lg p-2 hover:bg-neutral-100 md:hidden dark:hover:bg-neutral-800"
        >
          <PlusIcon />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto">
        {isEmpty ? (
          <div className="flex h-full flex-col items-center justify-center gap-6 px-4">
            <p role="status" className="text-center text-base text-neutral-500 dark:text-neutral-400">
              {emptyMessage}
            </p>
          </div>
        ) : (
          <div
            className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6"
            role="log"
            aria-label="Conversation messages"
            aria-live="polite"
            aria-relevant="additions"
            aria-atomic="false"
          >
            {isLoading && <p className="text-center text-sm text-neutral-500">Loading messages…</p>}
            {messages.map((message, index) => (
              <MessageBubble
                key={message.id}
                message={message}
                messageNumber={index + 1}
              />
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
        <p className="mb-2 truncate px-2 text-xs text-neutral-500 dark:text-neutral-400">
          Talking to <span className="font-medium text-neutral-700 dark:text-neutral-300">{activeModelLabel}</span>
        </p>
        <InputArea
          onSend={onSend}
          onStop={onStop}
          isGenerating={isGenerating}
          disabled={isBusy && !isGenerating}
        />
      </div>
    </main>
  )
}
