import type { AiProviderId } from '../types/ai'

function readProvider(value: string | undefined): AiProviderId {
  return value === 'ollama' || value === 'gemini' ? value : 'mock'
}

function readNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback
}

export const env = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL?.trim() || undefined,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || undefined,
  aiProvider: readProvider(import.meta.env.VITE_AI_PROVIDER),
  mockReplyDelayMs: readNumber(import.meta.env.VITE_MOCK_REPLY_DELAY_MS, 700),
  ollamaBaseUrl: import.meta.env.VITE_OLLAMA_BASE_URL?.trim().replace(/\/+$/, '') || 'http://localhost:11434',
  ollamaModel: import.meta.env.VITE_OLLAMA_MODEL?.trim() || 'llama3.2',
} as const

export const isSupabaseConfigured = Boolean(env.supabaseUrl && env.supabaseAnonKey)
