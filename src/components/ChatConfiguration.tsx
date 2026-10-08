import type { AiProviderId } from '../types/ai'

export interface ChatModelOption {
  id: string
  provider: AiProviderId
  model: string
  label: string
  source: string
  available: boolean
}

interface ChatConfigurationProps {
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

export function ChatConfiguration({
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
}: ChatConfigurationProps) {
  const hasModels = modelOptions.some((option) => option.provider === 'ollama' && option.available)
  const ollamaModelCount = modelOptions.filter((option) => option.provider === 'ollama' && option.available).length

  return (
    <section aria-labelledby="chat-configuration-heading" className="grid gap-3">
      <h2 id="chat-configuration-heading" className="text-sm font-semibold">Chat</h2>
      <div>
        <span className="block text-xs font-medium text-neutral-500 dark:text-neutral-400">Source</span>
        <span className="mt-1 block font-medium text-neutral-900 dark:text-neutral-100">{source}</span>
      </div>

      <div>
        <span className="block text-xs font-medium text-neutral-500 dark:text-neutral-400">Model</span>
        {modelOptions.length > 1 ? (
          <select
            aria-label="AI model"
            value={selectedOptionId}
            disabled={disabled}
            onChange={(event) => {
              const option = modelOptions.find(({ id }) => id === event.target.value)
              if (option?.available) onModelSelect(option)
            }}
            className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:focus-visible:outline-blue-400"
          >
            {modelOptions.map((option) => (
              <option key={option.id} value={option.id} disabled={!option.available}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <span className="mt-1 block break-words font-medium text-neutral-900 dark:text-neutral-100">
            {provider === 'ollama' ? 'No model installed' : modelLabel}
          </span>
        )}
      </div>

      {provider === 'ollama' && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p
            role={modelLoadFailed || !hasModels ? 'status' : undefined}
            className="m-0 text-xs text-neutral-500 dark:text-neutral-400"
          >
            {isLoadingModels
              ? 'Loading models…'
              : modelLoadFailed
                ? 'Could not load models. Check Ollama and CORS settings.'
                : !hasModels
                  ? 'No Ollama models found. Refresh the list or install one.'
                  : `Available locally · ${ollamaModelCount} ${ollamaModelCount === 1 ? 'model' : 'models'}`}
          </p>
          <button
            type="button"
            onClick={onRefreshModels}
            disabled={disabled || isLoadingModels}
            className="rounded-md px-2 py-1 font-medium text-neutral-700 underline underline-offset-2 hover:bg-neutral-100 disabled:opacity-50 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            {modelLoadFailed ? 'Retry' : 'Refresh'}
          </button>
        </div>
      )}
    </section>
  )
}
