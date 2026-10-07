import type { Message } from '../types/chat'
import { SparkIcon } from './icons'

interface MessageBubbleProps {
  message: Pick<Message, 'role' | 'content'>
}

export function MessageBubble({ message }: MessageBubbleProps) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-3xl bg-neutral-100 px-5 py-2.5 whitespace-pre-wrap break-words dark:bg-neutral-800">
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-4">
      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-neutral-200 dark:border-neutral-700">
        <SparkIcon width={16} height={16} />
      </div>
      <div className="min-w-0 flex-1 pt-1 leading-7 whitespace-pre-wrap break-words">{message.content}</div>
    </div>
  )
}
