import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { PROVIDER_CATALOG } from '../services/ai/catalog'
import { ProviderSelector } from './ProviderSelector'

afterEach(cleanup)

function renderSelector(overrides: Partial<Parameters<typeof ProviderSelector>[0]> = {}) {
  const onProviderChange = vi.fn()
  const onModelChange = vi.fn()
  const onRefreshModels = vi.fn()
  render(
    <ProviderSelector
      options={[
        { provider: PROVIDER_CATALOG.mock, available: true },
        { provider: PROVIDER_CATALOG.ollama, available: true },
      ]}
      selectedProvider="ollama"
      selectedModel="llama3.2"
      availableModels={['llama3.2', 'qwen2.5']}
      isLoadingModels={false}
      modelLoadFailed={false}
      disabled={false}
      onProviderChange={onProviderChange}
      onModelChange={onModelChange}
      onRefreshModels={onRefreshModels}
      {...overrides}
    />,
  )
  return { onProviderChange, onModelChange, onRefreshModels }
}

describe('ProviderSelector', () => {
  it('shows source and model selectors when alternatives are available', () => {
    renderSelector()

    expect(screen.getByRole('combobox', { name: 'AI source' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'AI model' })).toBeInTheDocument()
    expect(screen.getByText('· Local Ollama server')).toBeInTheDocument()
  })

  it('changes provider and model using selected options', () => {
    const { onProviderChange, onModelChange } = renderSelector()

    fireEvent.change(screen.getByRole('combobox', { name: 'AI source' }), { target: { value: 'mock' } })
    fireEvent.change(screen.getByRole('combobox', { name: 'AI model' }), { target: { value: 'qwen2.5' } })

    expect(onProviderChange).toHaveBeenCalledWith('mock')
    expect(onModelChange).toHaveBeenCalledWith('qwen2.5')
  })

  it('shows a model label instead of a selector when only one model is available', () => {
    renderSelector({ availableModels: ['llama3.2'] })

    expect(screen.queryByRole('combobox', { name: 'AI model' })).not.toBeInTheDocument()
    expect(screen.getByText('llama3.2')).toBeInTheDocument()
  })

  it('does not offer a source switch when only one provider is available', () => {
    renderSelector({
      options: [{ provider: PROVIDER_CATALOG.mock, available: true }],
      selectedProvider: 'mock',
    })

    expect(screen.queryByRole('combobox', { name: 'AI source' })).not.toBeInTheDocument()
    expect(screen.getByText('Demo replies')).toBeInTheDocument()
  })
})
