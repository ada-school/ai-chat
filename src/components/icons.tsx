import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const

export const PlusIcon = (p: IconProps) => (
  <svg {...base} {...p}><path d="M12 5v14M5 12h14" /></svg>
)
export const SendIcon = (p: IconProps) => (
  <svg {...base} {...p}><path d="M12 19V5M5 12l7-7 7 7" /></svg>
)
export const StopIcon = (p: IconProps) => (
  <svg {...base} {...p}><rect x="7" y="7" width="10" height="10" rx="1.5" fill="currentColor" /></svg>
)
export const TrashIcon = (p: IconProps) => (
  <svg {...base} {...p}><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" /></svg>
)
export const MenuIcon = (p: IconProps) => (
  <svg {...base} {...p}><path d="M4 6h16M4 12h16M4 18h16" /></svg>
)
export const PanelLeftCloseIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M9 4v16m6-11-2 3 2 3" />
  </svg>
)
export const PanelLeftOpenIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M9 4v16m6-10 2 3-2 3" />
  </svg>
)
export const CloseIcon = (p: IconProps) => (
  <svg {...base} {...p}><path d="M6 6l12 12M18 6L6 18" /></svg>
)
export const SparkIcon = (p: IconProps) => (
  <svg {...base} {...p}><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" /></svg>
)
export const GearIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M10 2.5h4v2.8a7.2 7.2 0 0 1 1.7.7l2-2 2.8 2.8-2 2a7.2 7.2 0 0 1 .7 1.7H22v4h-2.8a7.2 7.2 0 0 1-.7 1.7l2 2-2.8 2.8-2-2a7.2 7.2 0 0 1-1.7.7v2.8h-4v-2.8a7.2 7.2 0 0 1-1.7-.7l-2 2-2.8-2.8 2-2a7.2 7.2 0 0 1-.7-1.7H2v-4h2.8a7.2 7.2 0 0 1 .7-1.7l-2-2 2.8-2.8 2 2a7.2 7.2 0 0 1 1.7-.7z" />
    <circle cx="12" cy="12" r="3.25" />
  </svg>
)
export const SunIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
  </svg>
)
export const MoonIcon = (p: IconProps) => (
  <svg {...base} {...p}><path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z" /></svg>
)
