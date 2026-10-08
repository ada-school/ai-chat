import { useMemo, useState } from 'react'
import { ConnectivityNotice } from './components/ConnectivityNotice'
import { ChatWindow } from './components/ChatWindow'
import { ConversationList } from './components/ConversationList'
import { UpdatePrompt } from './components/UpdatePrompt'
import type { AiProviderId } from './types/ai'
import { CloseIcon } from './components/icons'
import { useAppearance } from './hooks/useAppearance'
import { useAuth } from './hooks/useAuth'
import { useChat } from './hooks/useChat'
import { useConnectivity } from './hooks/useConnectivity'
import { useOllamaModels } from './hooks/useOllamaModels'
import { env } from './lib/env'
import { createChatProvider } from './services/ai'
import { PROVIDER_CATALOG } from './services/ai/catalog'
import { getChatRepository } from './services/chat'

const repository = getChatRepository()

export default function App() {
  const isOnline = useConnectivity()
  const appearance = useAppearance()
  const auth = useAuth()
  const [selectedProvider, setSelectedProvider] = useState<AiProviderId>(env.aiProvider)
  const [selectedModel, setSelectedModel] = useState(env.ollamaModel)
  const ollama = useOllamaModels(env.ollamaBaseUrl)
  const providerOptions = [
    { provider: PROVIDER_CATALOG.mock, available: true },
    { provider: PROVIDER_CATALOG.ollama, available: true },
    ...(repository.kind === 'supabase' || selectedProvider === 'gemini'
      ? [{ provider: PROVIDER_CATALOG.gemini, available: repository.kind === 'supabase' }]
      : []),
  ]
  const effectiveModel = ollama.models.some((model) => model.name === selectedModel)
    ? selectedModel
    : ollama.models[0]?.name ?? selectedModel
  const activeProvider = useMemo(
    () => createChatProvider(selectedProvider, { ...env, ollamaModel: effectiveModel }),
    [selectedProvider, effectiveModel],
  )
  const chat = useChat({ repository, provider: activeProvider, enabled: auth.status === 'ready' })
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const activeTitle = chat.conversations.find((c) => c.id === chat.activeId)?.title ?? 'New chat'

  const closeSidebarThen = (action: () => void) => () => {
    action()
    setSidebarOpen(false)
  }

  if (auth.status === 'loading') {
    return (
      <div className="flex h-dvh flex-col">
        <ConnectivityNotice isOnline={isOnline} mode={repository.kind} />
        <div className="flex flex-1 items-center justify-center text-neutral-500">Loading…</div>
      </div>
    )
  }

  if (auth.status === 'error') {
    return (
      <div className="flex h-dvh flex-col">
        <ConnectivityNotice isOnline={isOnline} mode={repository.kind} />
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
          <p className="font-medium">Could not connect to your account.</p>
          <p className="text-sm text-neutral-500">{auth.error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <ConnectivityNotice isOnline={isOnline} mode={repository.kind} />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/40 md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-72 bg-neutral-50 transition-transform md:static md:translate-x-0 dark:bg-neutral-900 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close conversations"
            className="absolute top-3 right-3 rounded-lg p-1.5 hover:bg-neutral-200 md:hidden dark:hover:bg-neutral-800"
          >
            <CloseIcon width={18} height={18} />
          </button>
          <ConversationList
            conversations={chat.conversations}
            activeId={chat.activeId}
            onSelect={(id) => {
              void chat.selectConversation(id)
              setSidebarOpen(false)
            }}
            onNewChat={closeSidebarThen(chat.startNewChat)}
            onDelete={(id) => void chat.deleteConversation(id)}
            storageMode={repository.kind}
          />
        </aside>

        <ChatWindow
          title={activeTitle}
          providerOptions={providerOptions}
          selectedProvider={selectedProvider}
          selectedModel={effectiveModel}
          availableModels={ollama.models.map((model) => model.name)}
          isLoadingModels={ollama.isLoading}
          modelLoadFailed={ollama.error}
          onProviderChange={setSelectedProvider}
          onModelChange={setSelectedModel}
          onRefreshModels={ollama.refresh}
          theme={appearance.theme}
          textSize={appearance.textSize}
          onThemeChange={appearance.setTheme}
          onTextSizeChange={appearance.setTextSize}
          messages={chat.messages}
          isLoading={chat.isLoadingMessages}
          isGenerating={chat.isGenerating}
          isBusy={chat.isBusy}
          error={chat.error}
          onDismissError={chat.dismissError}
          onSend={(text) => void chat.sendMessage(text)}
          onStop={chat.stopGenerating}
          onOpenSidebar={() => setSidebarOpen(true)}
          onNewChat={chat.startNewChat}
        />
      </div>

      <UpdatePrompt />
    </div>
  )
}
