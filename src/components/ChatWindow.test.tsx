import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ChatWindow } from './ChatWindow'

afterEach(cleanup)

describe('ChatWindow empty state', () => {
  it('shows one no-model message instead of sample prompts', () => {
    const onToggleSidebar = vi.fn()
    const { rerender } = render(
      <ChatWindow
        title="New chat"
        source="Local Ollama server"
        selectedProvider="ollama"
        modelLabel="Select a local model"
        modelOptions={[
          { id: 'mock:demo', provider: 'mock', model: 'demo', label: 'Demo responses', source: 'Built-in', available: true },
          { id: 'ollama:llama3.2', provider: 'ollama', model: 'llama3.2', label: 'llama3.2 (unavailable)', source: 'Local Ollama server', available: false },
        ]}
        selectedOptionId="ollama:llama3.2"
        isLoadingModels={false}
        modelLoadFailed={false}
        onModelSelect={vi.fn()}
        onRefreshModels={vi.fn()}
        emptyMessage="No models available to respond"
        theme="system"
        textSize="default"
        onThemeChange={vi.fn()}
        onTextSizeChange={vi.fn()}
        messages={[]}
        isLoading={false}
        isGenerating={false}
        isBusy={false}
        error={null}
        onDismissError={vi.fn()}
        onSend={vi.fn()}
        onStop={vi.fn()}
        onOpenSidebar={vi.fn()}
        isSidebarCollapsed={false}
        onToggleSidebar={onToggleSidebar}
        onNewChat={vi.fn()}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Collapse conversations' }))
    expect(onToggleSidebar).toHaveBeenCalledOnce()
    rerender(
      <ChatWindow
        title="New chat"
        source="Local Ollama server"
        selectedProvider="ollama"
        modelLabel="Select a local model"
        modelOptions={[
          { id: 'mock:demo', provider: 'mock', model: 'demo', label: 'Demo responses', source: 'Built-in', available: true },
          { id: 'ollama:llama3.2', provider: 'ollama', model: 'llama3.2', label: 'llama3.2 (unavailable)', source: 'Local Ollama server', available: false },
        ]}
        selectedOptionId="ollama:llama3.2"
        isLoadingModels={false}
        modelLoadFailed={false}
        onModelSelect={vi.fn()}
        onRefreshModels={vi.fn()}
        emptyMessage="No models available to respond"
        theme="system"
        textSize="default"
        onThemeChange={vi.fn()}
        onTextSizeChange={vi.fn()}
        messages={[]}
        isLoading={false}
        isGenerating={false}
        isBusy={false}
        error={null}
        onDismissError={vi.fn()}
        onSend={vi.fn()}
        onStop={vi.fn()}
        onOpenSidebar={vi.fn()}
        isSidebarCollapsed
        onToggleSidebar={onToggleSidebar}
        onNewChat={vi.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: 'Show conversations' })).toBeInTheDocument()
    expect(screen.getByText('No models available to respond')).toBeInTheDocument()
    expect(screen.getByText('llama3.2 (unavailable)')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Hello!' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'What can you do?' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Tell me about Gemini' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Display and chat settings' })).toBeInTheDocument()
    expect(screen.queryByLabelText('Chat configuration')).not.toBeInTheDocument()
  })
})
