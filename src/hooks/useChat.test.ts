import { describe, expect, it } from 'vitest'
import { titleFromMessage } from './useChat'

describe('titleFromMessage', () => {
  it('collapses whitespace', () => {
    expect(titleFromMessage('  hello\n\nworld  ')).toBe('hello world')
  })

  it('truncates long text with an ellipsis', () => {
    const title = titleFromMessage('a'.repeat(100))
    expect(title.length).toBe(40)
    expect(title.endsWith('…')).toBe(true)
  })
})
