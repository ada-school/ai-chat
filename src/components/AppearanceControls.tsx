import type { ColorTheme, MessageTextSize } from '../hooks/useAppearance'
import { MoonIcon, SunIcon } from './icons'

interface AppearanceControlsProps {
  theme: ColorTheme
  textSize: MessageTextSize
  onThemeChange: (theme: ColorTheme) => void
  onTextSizeChange: (size: MessageTextSize) => void
}

const controlClassName =
  'mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:focus-visible:outline-blue-400'

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
    <section aria-labelledby="appearance-heading" className="grid gap-3">
      <h2 id="appearance-heading" className="text-sm font-semibold">Appearance</h2>
      <fieldset className="grid gap-2">
        <legend className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Color theme</legend>
        <div className="grid grid-cols-3 gap-2">
          {(['system', 'light', 'dark'] as const).map((option) => (
            <button
              key={option}
              type="button"
              aria-label={`${option === 'system' ? 'System' : option[0].toUpperCase() + option.slice(1)} theme`}
              aria-pressed={theme === option}
              onClick={() => onThemeChange(option)}
              className={`group flex min-w-0 flex-col items-center gap-1 rounded-xl border px-2 py-2 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:focus-visible:outline-blue-400 ${
                theme === option
                  ? 'border-blue-500 bg-blue-50 text-blue-800 dark:border-blue-400 dark:bg-blue-950 dark:text-blue-200'
                  : 'border-neutral-200 text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800'
              }`}
            >
              {option === 'light' ? (
                <SunIcon className="size-4 transition-transform duration-300 group-hover:rotate-45 motion-reduce:transition-none" />
              ) : option === 'dark' ? (
                <MoonIcon className="size-4 transition-transform duration-300 group-hover:-rotate-12 motion-reduce:transition-none" />
              ) : (
                <span aria-hidden="true" className="flex size-4 items-center justify-center font-semibold">A</span>
              )}
              <span>{option === 'system' ? 'System' : option[0].toUpperCase() + option.slice(1)}</span>
            </button>
          ))}
        </div>
      </fieldset>
      <div>
        <label htmlFor="message-text-size" className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
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
    </section>
  )
}
