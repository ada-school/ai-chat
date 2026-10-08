import type { Message } from '../types/chat'
import type { MessageTextSize } from '../hooks/useAppearance'
import type { Components } from 'react-markdown'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { SparkIcon } from './icons'

interface MessageBubbleProps {
  message: Pick<Message, 'role' | 'content'>
  textSize: MessageTextSize
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

export function MessageBubble({ message, textSize, messageNumber }: MessageBubbleProps) {
  if (message.role === 'user') {
    return (
      <article
        aria-label={`Your message ${messageNumber}`}
        className="flex justify-end"
      >
        <div
          className="conversation-content max-w-[85%] rounded-3xl bg-neutral-100 px-5 py-2.5 break-words dark:bg-neutral-800"
          data-text-size={textSize}
        >
          <p className="m-0 whitespace-pre-wrap">{message.content}</p>
        </div>
      </article>
    )
  }

  return (
    <article aria-label={`Assistant message ${messageNumber}`} className="flex gap-4">
      <div
        aria-hidden="true"
        className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-neutral-200 dark:border-neutral-700"
      >
        <SparkIcon width={16} height={16} />
      </div>
      <div
        className="conversation-content min-w-0 flex-1 pt-1 break-words"
        data-text-size={textSize}
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
          {message.content}
        </ReactMarkdown>
      </div>
    </article>
  )
}
