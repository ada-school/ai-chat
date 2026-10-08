/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_ANON_KEY?: string
  readonly VITE_AI_PROVIDER?: 'mock' | 'ollama' | 'gemini'
  readonly VITE_MOCK_REPLY_DELAY_MS?: string
  readonly VITE_OLLAMA_BASE_URL?: string
  readonly VITE_OLLAMA_MODEL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
