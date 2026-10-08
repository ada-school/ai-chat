interface ConnectivityNoticeProps {
  isOnline: boolean
  mode: 'local' | 'supabase'
}

export function ConnectivityNotice({ isOnline, mode }: ConnectivityNoticeProps) {
  if (isOnline) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="shrink-0 border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200"
    >
      {mode === 'local'
        ? "You're offline. Your local conversations are still available on this device."
        : "You're offline. Cloud features may be unavailable; reconnect and try again."}
    </div>
  )
}
