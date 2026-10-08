import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MessageBubble } from './MessageBubble'

const originalClipboardDescriptor = Object.getOwnPropertyDescriptor(navigator, 'clipboard')

afterEach(() => {
  cleanup()
  if (originalClipboardDescriptor) {
    Object.defineProperty(navigator, 'clipboard', originalClipboardDescriptor)
  } else {
    Reflect.deleteProperty(navigator, 'clipboard')
  }
})

describe('MessageBubble', () => {
  it('renders assistant Markdown and GitHub-flavored tables semantically', () => {
    render(
      <MessageBubble
        message={{
          role: 'assistant',
          content: '# Answer\n\nA **formatted** reply.\n\n| Name | Value |\n| --- | --- |\n| One | `1` |',
          createdAt: '2026-10-08T12:30:00.000Z',
          modelDetails: { provider: 'ollama', model: 'llama3.2', source: 'Local Ollama server' },
        }}
        messageNumber={1}
      />,
    )

    expect(screen.getByRole('article', { name: 'Assistant message 1' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Answer' })).toBeInTheDocument()
    expect(screen.getByText('formatted').tagName).toBe('STRONG')
    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByText('1').tagName).toBe('CODE')
    expect(screen.getByText('Local Ollama server · llama3.2')).toBeInTheDocument()
    expect(screen.getByRole('time')).toHaveAttribute('datetime', '2026-10-08T12:30:00.000Z')
  })

  it('does not interpret embedded HTML as markup', () => {
    render(
      <MessageBubble
        message={{
          role: 'assistant',
          content: '<img src=x onerror=alert(1) />',
          createdAt: '2026-10-08T12:30:00.000Z',
        }}
        messageNumber={2}
      />,
    )

    expect(screen.getByText('<img src=x onerror=alert(1) />')).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('labels user messages and inherits the application text size', () => {
    render(
      <MessageBubble
        message={{ role: 'user', content: 'Hello', createdAt: '2026-10-08T12:30:00.000Z' }}
        messageNumber={3}
      />,
    )

    expect(screen.getByRole('article', { name: 'Your message 3' })).toBeInTheDocument()
    expect(screen.getByRole('article', { name: 'Your message 3' })).toHaveClass('conversation-content')
    expect(screen.getByRole('time')).toHaveAttribute('datetime', '2026-10-08T12:30:00.000Z')
  })

  it('copies the original assistant Markdown to the clipboard', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    })
    render(
      <MessageBubble
        message={{
          role: 'assistant',
          content: '# Copy **this**\n\n- Original markdown',
          createdAt: '2026-10-08T12:30:00.000Z',
        }}
        messageNumber={4}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Copy Markdown' }))

    expect(writeText).toHaveBeenCalledWith('# Copy **this**\n\n- Original markdown')
    expect(await screen.findByRole('button', { name: 'Markdown copied' })).toHaveTextContent('Copied')
  })

  it('shows feedback if the browser denies clipboard access', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: vi.fn().mockRejectedValue(new Error('Permission denied')) },
    })
    render(
      <MessageBubble
        message={{
          role: 'assistant',
          content: 'Unable to copy',
          createdAt: '2026-10-08T12:30:00.000Z',
        }}
        messageNumber={5}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Copy Markdown' }))

    expect(await screen.findByRole('status')).toHaveTextContent('Copy failed')
  })
})
