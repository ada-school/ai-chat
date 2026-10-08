import type { AiProviderId, ProviderMetadata } from '../types/ai'

export interface ProviderOption {
  provider: ProviderMetadata
  available: boolean
}

interface ProviderSelectorProps {
  options: ProviderOption[]
  selectedProvider: AiProviderId
  selectedModel: string
  availableModels: string[]
  isLoadingModels: boolean
  modelLoadFailed: boolean
  disabled: boolean
  onProviderChange: (provider: AiProviderId) => void
  onModelChange: (model: string) => void
  onRefreshModels: () => void
}

export function ProviderSelector({
  options,
  selectedProvider,
  selectedModel,
  availableModels,
  isLoadingModels,
  modelLoadFailed,
  disabled,
  onProviderChange,
  onModelChange,
  onRefreshModels,
}: ProviderSelectorProps) {
  const selected = options.find(({ provider }) => provider.id === selectedProvider)?.provider
  const canSwitchProvider = options.filter(({ available }) => available).length > 1
  const canChooseModel = selectedProvider === 'ollama' && availableModels.length > 1

  return (
    <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-2 px-1 text-xs text-neutral-600 dark:text-neutral-300">
      <div className="flex items-center gap-2">
        <span className="font-medium text-neutral-500 dark:text-neutral-400">Source</span>
        {canSwitchProvider ? (
          <select
            aria-label="AI source"
            value={selectedProvider}
            disabled={disabled}
            onChange={(event) => {
              const option = options.find(({ provider }) => provider.id === event.target.value)
              if (option?.available) onProviderChange(option.provider.id)
            }}
            className="max-w-48 rounded-md border border-neutral-200 bg-white px-2 py-1 text-neutral-800 disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          >
            {options.map(({ provider, available }) => (
              <option key={provider.id} value={provider.id} disabled={!available}>
                {provider.displayName}{available ? '' : ' (unavailable)'}
              </option>
            ))}
          </select>
        ) : (
          <span className="font-medium text-neutral-800 dark:text-neutral-100">
            {selected?.displayName ?? selectedProvider}
          </span>
        )}
        <span className="max-w-48 truncate text-neutral-500 dark:text-neutral-400">· {selected?.source}</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="font-medium text-neutral-500 dark:text-neutral-400">Model</span>
        {canChooseModel ? (
          <select
            aria-label="AI model"
            value={availableModels.includes(selectedModel) ? selectedModel : availableModels[0]}
            disabled={disabled || isLoadingModels}
            onChange={(event) => onModelChange(event.target.value)}
            className="max-w-52 rounded-md border border-neutral-200 bg-white px-2 py-1 text-neutral-800 disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          >
            {availableModels.map((model) => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>
        ) : (
          <span className="max-w-52 truncate font-medium text-neutral-800 dark:text-neutral-100">
            {selectedProvider === 'ollama' ? selectedModel : selected?.modelLabel}
          </span>
        )}
        {selectedProvider === 'ollama' && (
          <button
            type="button"
            onClick={onRefreshModels}
            disabled={disabled || isLoadingModels}
            className="underline decoration-neutral-400 underline-offset-2 hover:text-neutral-900 disabled:opacity-50 dark:hover:text-white"
          >
            {isLoadingModels ? 'Loading…' : modelLoadFailed ? 'Retry' : 'Refresh'}
          </button>
        )}
      </div>

      {selectedProvider === 'ollama' && modelLoadFailed && (
        <span role="status" className="w-full text-amber-700 dark:text-amber-300">
          Couldn’t load Ollama models. Check the server and CORS settings.
        </span>
      )}
      {selectedProvider === 'ollama' && !modelLoadFailed && !isLoadingModels && availableModels.length === 0 && (
        <span role="status" className="w-full text-neutral-500">
          No Ollama models found. Pull a model, then refresh.
        </span>
      )}
    </div>
  )
}
