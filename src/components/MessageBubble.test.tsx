import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { MessageBubble } from './MessageBubble'

afterEach(cleanup)

describe('MessageBubble', () => {
  it('renders assistant Markdown and GitHub-flavored tables semantically', () => {
    render(
      <MessageBubble
        message={{
          role: 'assistant',
          content: '# Answer\n\nA **formatted** reply.\n\n| Name | Value |\n| --- | --- |\n| One | `1` |',
        }}
        textSize="default"
        messageNumber={1}
      />,
    )

    expect(screen.getByRole('article', { name: 'Assistant message 1' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Answer' })).toBeInTheDocument()
    expect(screen.getByText('formatted').tagName).toBe('STRONG')
    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByText('1').tagName).toBe('CODE')
  })

  it('does not interpret embedded HTML as markup', () => {
    render(
      <MessageBubble
        message={{ role: 'assistant', content: '<img src=x onerror=alert(1) />' }}
        textSize="default"
        messageNumber={2}
      />,
    )

    expect(screen.getByText('<img src=x onerror=alert(1) />')).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('labels user messages and applies their selected text size', () => {
    render(
      <MessageBubble
        message={{ role: 'user', content: 'Hello' }}
        textSize="large"
        messageNumber={3}
      />,
    )

    expect(screen.getByRole('article', { name: 'Your message 3' })).toBeInTheDocument()
    expect(screen.getByText('Hello').parentElement).toHaveAttribute('data-text-size', 'large')
  })
})
