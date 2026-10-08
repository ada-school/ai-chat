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
import type { ChatModelOption } from './components/ChatConfiguration'

const repository = getChatRepository()

export default function App() {
  const isOnline = useConnectivity()
  const appearance = useAppearance()
  const auth = useAuth()
  const [selectedProvider, setSelectedProvider] = useState<AiProviderId>(env.aiProvider)
  const [selectedModel, setSelectedModel] = useState(env.ollamaModel)
  const ollama = useOllamaModels(env.ollamaBaseUrl)
  const modelOptions: ChatModelOption[] = [
    {
      id: 'mock:demo',
      provider: 'mock',
      model: 'demo',
      label: PROVIDER_CATALOG.mock.modelLabel,
      source: PROVIDER_CATALOG.mock.source,
      available: true,
    },
    ...ollama.models.map((model) => ({
      id: `ollama:${model.name}`,
      provider: 'ollama' as const,
      model: model.name,
      label: model.name,
      source: PROVIDER_CATALOG.ollama.source,
      available: true,
    })),
    ...(repository.kind === 'supabase' || selectedProvider === 'gemini'
      ? [{
          id: 'gemini:configured',
          provider: 'gemini' as const,
          model: PROVIDER_CATALOG.gemini.modelLabel,
          label: PROVIDER_CATALOG.gemini.modelLabel,
          source: PROVIDER_CATALOG.gemini.source,
          available: repository.kind === 'supabase',
        }]
      : []),
  ]
  const effectiveModel = selectedProvider === 'ollama' && !ollama.models.some((model) => model.name === selectedModel)
    ? ollama.models[0]?.name ?? selectedModel
    : selectedModel
  const currentOptionId = selectedProvider === 'ollama'
    ? `ollama:${effectiveModel}`
    : selectedProvider === 'gemini'
      ? 'gemini:configured'
      : 'mock:demo'
  const currentOptionAvailable = modelOptions.some((option) => option.id === currentOptionId)
  if (!currentOptionAvailable) {
    modelOptions.push({
      id: currentOptionId,
      provider: selectedProvider,
      model: selectedModel,
      label: ollama.isLoading ? 'Loading Ollama models…' : `${selectedModel} (unavailable)`,
      source: PROVIDER_CATALOG[selectedProvider].source,
      available: false,
    })
  }
  const selectedOption = modelOptions.find((option) => option.id === currentOptionId)
  const handleModelSelect = (option: ChatModelOption) => {
    setSelectedProvider(option.provider)
    setSelectedModel(option.model)
  }
  const activeProvider = useMemo(
    () => createChatProvider(selectedProvider, { ...env, ollamaModel: effectiveModel }),
    [selectedProvider, effectiveModel],
  )
  const chat = useChat({
    repository,
    provider: activeProvider,
    modelDetails: {
      provider: selectedProvider,
      model: selectedOption?.model ?? effectiveModel,
      source: selectedOption?.source ?? PROVIDER_CATALOG[selectedProvider].source,
    },
    enabled: auth.status === 'ready',
  })
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

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
          aria-hidden={sidebarCollapsed || undefined}
          inert={sidebarCollapsed}
          className={`fixed inset-y-0 left-0 z-40 w-72 shrink-0 overflow-hidden bg-neutral-50 transition-[transform,width] duration-200 md:static md:translate-x-0 dark:bg-neutral-900 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } ${sidebarCollapsed ? 'md:w-0' : 'md:w-72'}`}
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
          source={selectedOption?.source ?? PROVIDER_CATALOG[selectedProvider].source}
          selectedProvider={selectedProvider}
          modelLabel={PROVIDER_CATALOG[selectedProvider].modelLabel}
          modelOptions={modelOptions}
          selectedOptionId={currentOptionId}
          isLoadingModels={ollama.isLoading}
          modelLoadFailed={ollama.error}
          onModelSelect={handleModelSelect}
          onRefreshModels={ollama.refresh}
          emptyMessage={
            selectedProvider === 'ollama' && ollama.isLoading
              ? 'Loading models…'
              : selectedProvider === 'ollama' && ollama.error
                ? 'Could not check available models.'
                : selectedProvider === 'ollama' && ollama.models.length > 0
                  ? 'No messages yet. Start a conversation.'
                  : 'No models available to respond'
          }
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
          onOpenSidebar={() => {
            setSidebarCollapsed(false)
            setSidebarOpen(true)
          }}
          isSidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed((collapsed) => !collapsed)}
          onNewChat={chat.startNewChat}
        />
      </div>

      <UpdatePrompt />
    </div>
  )
}
