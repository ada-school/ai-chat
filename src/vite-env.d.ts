/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_ANON_KEY?: string
  readonly VITE_AI_PROVIDER?: 'mock' | 'gemini'
  readonly VITE_MOCK_REPLY_DELAY_MS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
