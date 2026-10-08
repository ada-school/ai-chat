import { useEffect, useId, useRef, useState } from 'react'
import type { ColorTheme, MessageTextSize } from '../hooks/useAppearance'
import type { AiProviderId } from '../types/ai'
import { AppearanceControls } from './AppearanceControls'
import { ChatConfiguration, type ChatModelOption } from './ChatConfiguration'
import { GearIcon } from './icons'

interface ConversationSettingsProps {
  theme: ColorTheme
  textSize: MessageTextSize
  onThemeChange: (theme: ColorTheme) => void
  onTextSizeChange: (size: MessageTextSize) => void
  source: string
  provider: AiProviderId
  modelLabel: string
  modelOptions: ChatModelOption[]
  selectedOptionId: string
  isLoadingModels: boolean
  modelLoadFailed: boolean
  disabled: boolean
  onModelSelect: (option: ChatModelOption) => void
  onRefreshModels: () => void
}

export function ConversationSettings({
  theme,
  textSize,
  onThemeChange,
  onTextSizeChange,
  source,
  provider,
  modelLabel,
  modelOptions,
  selectedOptionId,
  isLoadingModels,
  modelLoadFailed,
  disabled,
  onModelSelect,
  onRefreshModels,
}: ConversationSettingsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelId = useId()

  useEffect(() => {
    if (!isOpen) return

    function handlePointerDown(event: PointerEvent) {
      if (event.target instanceof Node && !containerRef.current?.contains(event.target)) {
        setIsOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
        triggerRef.current?.focus()
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-label="Display and chat settings"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen((open) => !open)}
        className="flex size-8 items-center justify-center rounded-lg bg-transparent text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white dark:focus-visible:outline-blue-400"
      >
        <GearIcon className={`size-5 shrink-0 ${isOpen ? 'settings-gear-spinning' : 'transition-transform duration-300 hover:rotate-45 motion-reduce:transition-none'}`} />
      </button>

      {isOpen && (
        <section
          id={panelId}
          role="dialog"
          aria-label="Display and chat settings"
          className="absolute top-full right-0 z-30 mt-2 grid max-h-[min(80dvh,36rem)] w-[min(22rem,calc(100vw-1.5rem))] gap-4 overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-4 text-neutral-900 shadow-xl shadow-neutral-900/10 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:shadow-black/30"
        >
          <AppearanceControls
            theme={theme}
            textSize={textSize}
            onThemeChange={onThemeChange}
            onTextSizeChange={onTextSizeChange}
          />
          <div className="h-px bg-neutral-200 dark:bg-neutral-700" />
          <ChatConfiguration
            source={source}
            provider={provider}
            modelLabel={modelLabel}
            modelOptions={modelOptions}
            selectedOptionId={selectedOptionId}
            isLoadingModels={isLoadingModels}
            modelLoadFailed={modelLoadFailed}
            disabled={disabled}
            onModelSelect={onModelSelect}
            onRefreshModels={onRefreshModels}
          />
        </section>
      )}
    </div>
  )
}
