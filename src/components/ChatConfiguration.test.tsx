import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ConversationSettings } from './ConversationSettings'

afterEach(cleanup)

const defaultProps = {
  theme: 'system' as const,
  textSize: 'default' as const,
  onThemeChange: vi.fn(),
  onTextSizeChange: vi.fn(),
  source: 'Local Ollama server',
  provider: 'ollama' as const,
  modelLabel: 'Select a local model',
  modelOptions: [
    { id: 'mock:demo', provider: 'mock' as const, model: 'demo', label: 'Demo responses', source: 'Built-in', available: true },
    { id: 'ollama:llama3.2', provider: 'ollama' as const, model: 'llama3.2', label: 'llama3.2', source: 'Local Ollama server', available: true },
    { id: 'ollama:qwen2.5', provider: 'ollama' as const, model: 'qwen2.5', label: 'qwen2.5', source: 'Local Ollama server', available: true },
  ],
  selectedOptionId: 'ollama:llama3.2',
  isLoadingModels: false,
  modelLoadFailed: false,
  disabled: false,
  onModelSelect: vi.fn(),
  onRefreshModels: vi.fn(),
}

describe('ConversationSettings', () => {
  it('combines appearance and model settings in a header menu that closes on outside click', () => {
    render(<ConversationSettings {...defaultProps} />)
    const trigger = screen.getByRole('button', { name: 'Display and chat settings' })

    expect(screen.queryByLabelText('AI model')).not.toBeInTheDocument()
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(trigger)

    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByLabelText('AI model')).toHaveValue('ollama:llama3.2')
    expect(screen.getByRole('button', { name: 'Dark theme' })).toBeInTheDocument()
    expect(screen.getByLabelText('Message text size')).toBeInTheDocument()
    expect(screen.getByText('Local Ollama server')).toBeInTheDocument()
    expect(screen.queryByLabelText('AI source')).not.toBeInTheDocument()

    fireEvent.pointerDown(document.body)
    expect(screen.queryByLabelText('AI model')).not.toBeInTheDocument()
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('lets the user select a model and dismisses with Escape', () => {
    const onModelSelect = vi.fn()
    render(<ConversationSettings {...defaultProps} onModelSelect={onModelSelect} />)
    fireEvent.click(screen.getByRole('button', { name: 'Display and chat settings' }))

    fireEvent.change(screen.getByLabelText('AI model'), { target: { value: 'ollama:qwen2.5' } })

    expect(onModelSelect).toHaveBeenCalledWith(defaultProps.modelOptions[2])
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByLabelText('AI model')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Display and chat settings' })).toHaveFocus()
  })

  it('shows the requested empty-model status when Ollama has no installed models', () => {
    render(
      <ConversationSettings
        {...defaultProps}
        modelOptions={[
          defaultProps.modelOptions[0],
          { ...defaultProps.modelOptions[1], available: false },
        ]}
        selectedOptionId="ollama:llama3.2"
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Display and chat settings' }))

    expect(screen.getByText('No Ollama models found. Refresh the list or install one.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Refresh' })).toBeInTheDocument()
  })
})
