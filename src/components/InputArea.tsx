import {
  useLayoutEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from 'react'
import { SendIcon, StopIcon } from './icons'

const MAX_HEIGHT_PX = 200

interface InputAreaProps {
  onSend: (text: string) => void
  onStop?: () => void
  isGenerating: boolean
  disabled?: boolean
}

export function InputArea({
  onSend,
  onStop,
  isGenerating,
  disabled = false,
}: InputAreaProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const canSend = value.trim().length > 0 && !isGenerating && !disabled

  useLayoutEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT_PX)}px`
  }, [value])

  function submit() {
    if (!canSend) return
    onSend(value)
    setValue('')
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    submit()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    // isComposing guards IME input (e.g. Japanese) where Enter confirms a candidate.
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      submit()
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-2 rounded-3xl border border-neutral-200 bg-white p-2 shadow-sm focus-within:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-800 dark:focus-within:border-neutral-500"
    >
      <label htmlFor="chat-input" className="sr-only">
        Message
      </label>
      <textarea
        id="chat-input"
        ref={textareaRef}
        rows={1}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Message AI Chat"
        disabled={disabled}
        autoFocus
        className="max-h-[200px] min-w-0 flex-1 resize-none bg-transparent px-2 py-2 leading-6 outline-none placeholder:text-neutral-400 disabled:opacity-50"
      />
      {isGenerating && onStop ? (
        <button
          type="button"
          onClick={onStop}
          aria-label="Stop generating"
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          <StopIcon width={16} height={16} />
        </button>
      ) : (
        <button
          type="submit"
          disabled={!canSend}
          aria-label="Send message"
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 dark:disabled:bg-neutral-700 dark:disabled:text-neutral-500"
        >
          <SendIcon width={18} height={18} />
        </button>
      )}
    </form>
  )
}
