import { useRegisterSW } from 'virtual:pwa-register/react'

/** Toast shown when the service worker has a new version or finished precaching. */
export function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW()

  if (!needRefresh && !offlineReady) return null

  const close = () => {
    setNeedRefresh(false)
    setOfflineReady(false)
  }

  return (
    <div
      role="status"
      className="fixed right-4 bottom-24 z-50 flex max-w-sm items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm shadow-lg dark:border-neutral-700 dark:bg-neutral-800"
    >
      <span className="flex-1">
        {needRefresh ? 'A new version is available.' : 'App ready to work offline.'}
      </span>
      {needRefresh && (
        <button
          type="button"
          onClick={() => updateServiceWorker(true)}
          className="rounded-lg bg-neutral-900 px-3 py-1.5 font-medium text-white dark:bg-white dark:text-neutral-900"
        >
          Reload
        </button>
      )}
      <button type="button" onClick={close} className="text-neutral-500 hover:underline">
        Close
      </button>
    </div>
  )
}
