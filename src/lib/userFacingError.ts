export type UserErrorContext =
  | 'authentication'
  | 'loadingConversations'
  | 'loadingMessages'
  | 'savingMessage'
  | 'deletingConversation'
  | 'generatingReply'

interface ErrorDetails {
  messages: string[]
  codes: string[]
  statuses: number[]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function errorDetails(error: unknown): ErrorDetails {
  const details: ErrorDetails = { messages: [], codes: [], statuses: [] }
  const pending: unknown[] = [error]
  const visited = new Set<object>()

  while (pending.length > 0) {
    const current = pending.shift()
    if (typeof current === 'string') {
      details.messages.push(current)
      continue
    }
    if (!isRecord(current) || visited.has(current)) continue
    visited.add(current)

    if (typeof current.message === 'string') details.messages.push(current.message)
    if (typeof current.code === 'string') details.codes.push(current.code)
    if (typeof current.status === 'number') details.statuses.push(current.status)
    if (typeof current.status === 'string' && /^\d{3}$/.test(current.status)) {
      details.statuses.push(Number(current.status))
    }
    if (current.context !== undefined) pending.push(current.context)
    if (current.cause !== undefined) pending.push(current.cause)
  }

  return details
}

function defaultMessage(context: UserErrorContext): string {
  switch (context) {
    case 'authentication':
      return "We couldn't sign you in. Please refresh the page and try again."
    case 'loadingConversations':
      return "We couldn't load your conversations. Please try again."
    case 'loadingMessages':
      return "We couldn't load this conversation. Please try again."
    case 'savingMessage':
      return "We couldn't save your message. Please try again."
    case 'deletingConversation':
      return "We couldn't delete this conversation. Please try again."
    case 'generatingReply':
      return "We couldn't generate a reply. Your message is saved; please try again."
  }
}

export function userFacingError(error: unknown, context: UserErrorContext): string {
  const details = errorDetails(error)
  const combinedMessage = details.messages.join(' ')

  const isOffline =
    (typeof navigator !== 'undefined' && !navigator.onLine) ||
    /failed to fetch|fetch failed|networkerror|network request failed|load failed|offline|connection refused|connection lost|internet disconnected/i.test(
      combinedMessage,
    )
  if (isOffline) {
    if (context === 'generatingReply') {
      return "You're offline or the connection was interrupted. Your message is saved; reconnect and try again."
    }
    return "You're offline or the connection was interrupted. Reconnect and try again."
  }

  if (details.statuses.includes(401)) {
    return "Your session couldn't be verified. Please refresh the page and try again."
  }
  if (details.statuses.includes(403) || details.codes.includes('42501')) {
    return "You don't have permission to complete this action. Please refresh the page and try again."
  }
  if (details.statuses.includes(429)) {
    return 'The service is receiving too many requests. Wait a moment and try again.'
  }
  if (details.statuses.some((status) => status >= 500)) {
    return 'The service is temporarily unavailable. Please try again shortly.'
  }

  return defaultMessage(context)
}
