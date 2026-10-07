import type { Conversation } from '../types/chat'
import { PlusIcon, TrashIcon } from './icons'

interface ConversationListProps {
  conversations: Conversation[]
  activeId: string | null
  onSelect: (id: string) => void
  onNewChat: () => void
  onDelete: (id: string) => void
  storageMode: 'supabase' | 'local'
}

export function ConversationList({
  conversations,
  activeId,
  onSelect,
  onNewChat,
  onDelete,
  storageMode,
}: ConversationListProps) {
  return (
    <nav aria-label="Conversations" className="flex h-full flex-col">
      <div className="p-3">
        <button
          type="button"
          onClick={onNewChat}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-neutral-200 dark:hover:bg-neutral-800"
        >
          <PlusIcon width={18} height={18} />
          New chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-3">
        {conversations.length === 0 ? (
          <p className="px-3 py-2 text-sm text-neutral-500">No conversations yet.</p>
        ) : (
          <ul className="space-y-0.5">
            {conversations.map((conversation) => {
              const isActive = conversation.id === activeId
              return (
                <li key={conversation.id} className="group relative">
                  <button
                    type="button"
                    onClick={() => onSelect(conversation.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`w-full truncate rounded-lg py-2 pr-9 pl-3 text-left text-sm ${
                      isActive
                        ? 'bg-neutral-200 dark:bg-neutral-800'
                        : 'hover:bg-neutral-200/70 dark:hover:bg-neutral-800/70'
                    }`}
                  >
                    {conversation.title}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(conversation.id)}
                    aria-label={`Delete "${conversation.title}"`}
                    className="absolute top-1/2 right-1.5 -translate-y-1/2 rounded-md p-1 text-neutral-500 opacity-0 group-hover:opacity-100 hover:text-red-600 focus-visible:opacity-100 max-md:opacity-100"
                  >
                    <TrashIcon width={16} height={16} />
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <div className="border-t border-neutral-200 p-3 text-xs text-neutral-500 dark:border-neutral-800">
        {storageMode === 'local' ? (
          <span title="Supabase is not configured. Chats are saved in this browser only.">
            Local mode · saved on this device
          </span>
        ) : (
          <span>Synced with Supabase</span>
        )}
      </div>
    </nav>
  )
}
