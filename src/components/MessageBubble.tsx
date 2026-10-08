import { useState } from 'react'
import type { Message } from '../types/chat'
import type { Components } from 'react-markdown'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { CheckIcon, CopyIcon, SparkIcon } from './icons'

interface MessageBubbleProps {
  message: Pick<Message, 'role' | 'content' | 'createdAt' | 'modelDetails'>
  messageNumber: number
}

const markdownComponents: Components = {
  h1: ({ children }) => <h2>{children}</h2>,
  h2: ({ children }) => <h3>{children}</h3>,
  h3: ({ children }) => <h4>{children}</h4>,
  h4: ({ children }) => <h5>{children}</h5>,
  h5: ({ children }) => <h6>{children}</h6>,
  h6: ({ children }) => <p><strong>{children}</strong></p>,
}

const messageTimeFormat = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
})

function formatMessageTime(createdAt: string): string {
  const date = new Date(createdAt)
  return Number.isNaN(date.getTime()) ? createdAt : messageTimeFormat.format(date)
}

export function MessageBubble({ message, messageNumber }: MessageBubbleProps) {
  const [copyStatus, setCopyStatus] = useState<'copied' | 'failed' | null>(null)
  const timestamp = formatMessageTime(message.createdAt)

  async function copyMarkdown() {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard access is unavailable')
      await navigator.clipboard.writeText(message.content)
      setCopyStatus('copied')
    } catch {
      setCopyStatus('failed')
    }
  }

  if (message.role === 'user') {
    return (
      <article aria-label={`Your message ${messageNumber}`} className="conversation-content flex flex-col items-end">
        <div className="max-w-[85%] rounded-3xl bg-neutral-100 px-5 py-2.5 break-words dark:bg-neutral-800">
          <p className="m-0 whitespace-pre-wrap">{message.content}</p>
        </div>
        <time
          dateTime={message.createdAt}
          className="mt-1 max-w-[85%] text-right text-[10px] leading-4 text-neutral-400 dark:text-neutral-500"
        >
          {timestamp}
        </time>
      </article>
    )
  }

  return (
    <article aria-label={`Assistant message ${messageNumber}`} className="flex gap-4">
      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-neutral-200 dark:border-neutral-700" aria-hidden="true">
        <SparkIcon width={16} height={16} />
      </div>
      <div className="min-w-0 flex-1 pt-1">
        <div className="conversation-content break-words">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {message.content}
          </ReactMarkdown>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] leading-4 text-neutral-400 dark:text-neutral-500">
          <time dateTime={message.createdAt}>{timestamp}</time>
          {message.modelDetails && (
            <span>
              {message.modelDetails.source} · {message.modelDetails.model}
            </span>
          )}
          <button
            type="button"
            onClick={() => void copyMarkdown()}
            aria-label={copyStatus === 'copied' ? 'Markdown copied' : 'Copy Markdown'}
            className="ml-auto inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-600 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 dark:focus-visible:outline-blue-400"
          >
            {copyStatus === 'copied' ? <CheckIcon width={12} height={12} /> : <CopyIcon width={12} height={12} />}
            {copyStatus === 'copied' ? 'Copied' : 'Copy Markdown'}
          </button>
        </div>
        {copyStatus === 'failed' && (
          <p role="status" className="mt-1 text-[10px] text-red-600 dark:text-red-400">
            Copy failed. Check clipboard permissions and try again.
          </p>
        )}
      </div>
    </article>
  )
}
