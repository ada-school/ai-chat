import { SparkIcon } from './icons'

export function TypingIndicator() {
  return (
    <div className="flex gap-4" role="status" aria-label="Assistant is typing">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-neutral-200 dark:border-neutral-700">
        <SparkIcon width={16} height={16} />
      </div>
      <div className="flex items-center gap-1 pt-1">
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className="size-2 animate-bounce rounded-full bg-neutral-400"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </div>
    </div>
  )
}
