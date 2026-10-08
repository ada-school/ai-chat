import { useState } from 'react'
import { ConnectivityNotice } from './components/ConnectivityNotice'
import { ChatWindow } from './components/ChatWindow'
import { ConversationList } from './components/ConversationList'
import { UpdatePrompt } from './components/UpdatePrompt'
import { CloseIcon } from './components/icons'
import { useAuth } from './hooks/useAuth'
import { useChat } from './hooks/useChat'
import { useConnectivity } from './hooks/useConnectivity'
import { env } from './lib/env'
import { getChatProvider } from './services/ai'
import { PROVIDER_CATALOG } from './services/ai/catalog'
import { getChatRepository } from './services/chat'

const repository = getChatRepository()
const provider = getChatProvider()

export default function App() {
  const isOnline = useConnectivity()
  const auth = useAuth()
  const chat = useChat({ repository, provider, enabled: auth.status === 'ready' })
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
          providerName={
            env.aiProvider === 'ollama'
              ? `${PROVIDER_CATALOG.ollama.displayName} · ${env.ollamaModel}`
              : PROVIDER_CATALOG[env.aiProvider].displayName
          }
          providerDescription={PROVIDER_CATALOG[env.aiProvider].description}
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
