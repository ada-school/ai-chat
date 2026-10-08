import type { ColorTheme, MessageTextSize } from '../hooks/useAppearance'

interface AppearanceControlsProps {
  theme: ColorTheme
  textSize: MessageTextSize
  onThemeChange: (theme: ColorTheme) => void
  onTextSizeChange: (size: MessageTextSize) => void
}

const controlClassName =
  'mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus-visible:outline-blue-400'

function isColorTheme(value: string): value is ColorTheme {
  return value === 'system' || value === 'light' || value === 'dark'
}

function isMessageTextSize(value: string): value is MessageTextSize {
  return value === 'small' || value === 'default' || value === 'large' || value === 'extra-large'
}

export function AppearanceControls({
  theme,
  textSize,
  onThemeChange,
  onTextSizeChange,
}: AppearanceControlsProps) {
  return (
    <details className="relative">
      <summary className="cursor-pointer list-none rounded-lg px-2 py-2 text-sm font-medium text-neutral-700 outline-none hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-blue-600 dark:text-neutral-200 dark:hover:bg-neutral-800 dark:focus-visible:ring-blue-400">
        <span aria-hidden="true" className="mr-1 font-semibold">Aa</span>
        <span className="sr-only">Display settings</span>
        <span aria-hidden="true">Display</span>
      </summary>
      <div className="absolute top-full right-0 z-20 mt-2 grid w-64 gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-xl dark:border-neutral-700 dark:bg-neutral-900">
        <div>
          <label htmlFor="color-theme" className="text-sm font-medium">
            Color theme
          </label>
          <select
            id="color-theme"
            value={theme}
            onChange={(event) => {
              if (isColorTheme(event.target.value)) onThemeChange(event.target.value)
            }}
            className={controlClassName}
          >
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
        <div>
          <label htmlFor="message-text-size" className="text-sm font-medium">
            Message text size
          </label>
          <select
            id="message-text-size"
            value={textSize}
            onChange={(event) => {
              if (isMessageTextSize(event.target.value)) onTextSizeChange(event.target.value)
            }}
            className={controlClassName}
          >
            <option value="small">Small</option>
            <option value="default">Default</option>
            <option value="large">Large</option>
            <option value="extra-large">Extra large</option>
          </select>
        </div>
      </div>
    </details>
  )
}
