# CLAUDE.md

Technical specification and working guide for **ai-chat**, a ChatGPT-style Progressive Web App backed by Supabase, with local Ollama support and an extensible AI provider registry.

> The app supports hardcoded demo replies and local Ollama. Gemini is wired through a Supabase Edge Function placeholder; other hosted providers can be added behind the same provider contract.

---

## 1. Commands

| Command | What it does |
| --- | --- |
| `npm install` | Install dependencies |
| `npm run dev` | Vite dev server on http://localhost:5173 (service worker enabled in dev) |
| `npm run build` | Type-check (`tsc -b`) then production build to `dist/` |
| `npm run preview` | Serve the production build locally (best way to test install/offline) |
| `npm run lint` | ESLint (flat config) |
| `npm run typecheck` | `tsc -b --noEmit` style check |
| `npm test` | Vitest unit tests (run once) |
| `npm run generate-pwa-assets` | Regenerate PNG icons from `public/favicon.svg` |

The app runs **without Supabase configured**: if `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` are missing, it falls back to a `localStorage` repository and shows a "local mode" badge. This keeps `npm install && npm run dev` working on a fresh clone.

---

## 2. Architecture overview

```
┌──────────────────────────── Browser (PWA) ─────────────────────────────┐
│ React UI ──► hooks (useAuth, useChat) ──┬──► ChatRepository            │
│                                         │      ├─ Supabase repository  │
│                                         │      └─ localStorage         │
│                                         └──► ChatProvider registry     │
│                                                ├─ Mock provider         │
│                                                ├─ Ollama provider ──────┼──► local Ollama
│                                                └─ Gemini provider ─────┼──► Supabase Edge Function
│ Service worker (Workbox) precaches the app shell                        │
└─────────────────────────────────────────────────────────────────────────┘
                                                                          Edge Function ──► Gemini API (future)
```

### Layers

1. **UI (`src/components`)** – presentational React components. No data fetching, no Supabase imports. Receive data and callbacks via props.
2. **State/hooks (`src/hooks`)** – `useAuth` (session lifecycle) and `useChat` (conversations, messages, sending, optimistic updates). This is the only layer that orchestrates services.
3. **Services (`src/services`)**
   - `chat/` – **persistence**. `ChatRepository` interface with two implementations: Supabase (default when configured) and localStorage (offline/dev fallback).
   - `ai/` – **response generation**. `ChatProvider` interface, provider registry and pricing catalog; `MockChatProvider`, local `OllamaChatProvider`, and `GeminiChatProvider`.
4. **Infrastructure (`src/lib`)** – env parsing (`env.ts`) and the singleton Supabase client (`supabase.ts`).
5. **Backend (`supabase/`)** – SQL migrations (schema + RLS) and an Edge Function stub (`functions/chat`) that will proxy Gemini.

### Key design rules

- **Components never talk to Supabase or AI directly.** Swapping backends or providers must not change a component.
- **The AI provider is chosen in one place**: `src/services/ai/index.ts` → provider factory, driven by `VITE_AI_PROVIDER` (`mock` | `ollama` | `gemini`). New providers register a factory and catalog metadata; chat orchestration and UI remain provider-agnostic.
- **Provider pricing is explicit metadata** in `src/services/ai/catalog.ts`: local Ollama has no per-token provider charge but uses local hardware; hosted rates are not guessed and must be configured before cost estimates are added.
- **Ollama is configured by URL/model**, not by credentials in the client. The browser calls `/api/chat` directly; the Ollama server must allow the exact app origin using CORS. Avoid wildcard origins on exposed servers.
- **The Gemini API key never ships to the browser.** Any `VITE_*` variable is public. Gemini will be called from the Supabase Edge Function, which reads `GEMINI_API_KEY` from Supabase secrets. The browser calls the function with the user's JWT.
- **Persistence is the source of truth.** The user message is saved before the provider is invoked; the assistant message is saved after. A failed provider call leaves the user message intact and surfaces an error.
- **RLS everywhere.** Every table has Row Level Security enabled; users can only read/write their own rows (`auth.uid()`).

---

## 3. Tech stack & rationale

| Concern | Choice | Why |
| --- | --- | --- |
| Build tool | **Vite 8** | Fast dev server, first-class PWA plugin, static output deployable anywhere (Vercel, Netlify, Cloudflare Pages, Supabase hosting). |
| UI | **React 19 + TypeScript 6** | Ubiquitous, strong typing for the provider/repository contracts. Next.js was not chosen: the app is a client-side SPA with no SSR/SEO needs, and server logic lives in Supabase Edge Functions. TypeScript is pinned to 6.0 because `typescript-eslint` doesn't support TS 7 yet. |
| Styling | **Tailwind CSS v4** (`@tailwindcss/vite`) | Utility-first, no config file needed, easy dark mode, minimal CSS footprint. |
| PWA | **vite-plugin-pwa** (Workbox `generateSW`) | Generates manifest + service worker, precaches the app shell, handles update prompts. |
| Backend | **Supabase** (`@supabase/supabase-js` v2) | Postgres + Auth + RLS + Edge Functions in one managed service. |
| Auth (v1) | **Supabase anonymous sign-in** | Zero-friction: each device gets a real `auth.uid()`, so RLS works from day one. Can later be linked to email/OAuth identities without losing data. |
| AI | **Ollama locally**, with a `ChatProvider` registry for hosted/future providers | Local inference does not require a hosted API key; hosted-provider secrets must stay server-side. |
| Tests | **Vitest** + jsdom | Shares Vite config, fast. |
| Lint | **ESLint 10** flat config + typescript-eslint + react-hooks | Standard Vite React setup. |

---

## 4. Folder structure

```
.
├── CLAUDE.md                 # This file – specs & architecture
├── README.md                 # Setup, diagrams
├── docs/
│   └── BACKLOG.md            # User stories, acceptance criteria, plan
├── index.html                # Vite entry HTML (PWA meta tags)
├── public/
│   ├── favicon.svg           # Source icon (PNG icons are generated from it)
│   ├── pwa-*.png, apple-touch-icon-180x180.png, maskable-icon-512x512.png
│   └── robots.txt
├── pwa-assets.config.ts      # Icon generation config
├── vite.config.ts            # Vite + React + Tailwind + PWA manifest/SW config
├── src/
│   ├── main.tsx              # React root + service worker registration
│   ├── App.tsx               # Layout shell: sidebar + chat window
│   ├── index.css             # Tailwind import + base styles
│   ├── components/
│   │   ├── ChatWindow.tsx        # Message list + empty state + provider/model controls + input
│   │   ├── ConversationList.tsx  # Sidebar list, new chat, delete
│   │   ├── InputArea.tsx         # Auto-growing textarea, Enter to send
│   │   ├── MessageBubble.tsx     # Single message (user / assistant)
│   │   ├── TypingIndicator.tsx   # "Assistant is typing" dots
│   │   └── UpdatePrompt.tsx      # PWA "new version / offline ready" toast
│   ├── hooks/
│   │   ├── useAuth.ts        # Anonymous session bootstrap
│   │   └── useChat.ts        # Conversation + message state machine
│   ├── lib/
│   │   ├── env.ts            # Typed access to import.meta.env
│   │   └── supabase.ts       # Supabase client singleton (or null)
│   ├── services/
│   │   ├── ai/
│   │   │   ├── types.ts          # ChatProvider interface
│   │   │   ├── mockProvider.ts   # Demo hardcoded responses
│   │   │   ├── ollamaProvider.ts # Local Ollama /api/chat integration
│   │   │   ├── geminiProvider.ts # Edge Function placeholder, demo fallback
│   │   │   ├── catalog.ts        # Provider descriptions and pricing semantics
│   │   │   └── index.ts          # Provider registry and factory
│   │   └── chat/
│   │       ├── repository.ts         # ChatRepository interface
│   │       ├── supabaseRepository.ts # Postgres-backed implementation
│   │       ├── localRepository.ts    # localStorage implementation
│   │       └── index.ts              # Repository factory
│   ├── types/
│   │   ├── ai.ts             # Provider IDs, metadata and pricing contracts
│   │   └── chat.ts           # Domain types (Conversation, Message, Role)
│   └── test/setup.ts         # Vitest setup
└── supabase/
    ├── migrations/
    │   ├── 20261007000000_init.sql
    │   └── 20261008000000_add_message_model_details.sql
    └── functions/
        └── chat/index.ts     # Edge Function stub (future Gemini proxy, Deno)
```

---

## 5. Domain model

```ts
type Role = 'user' | 'assistant' | 'system';

interface Conversation { id; userId; title; createdAt; updatedAt }
interface Message      { id; conversationId; role; content; createdAt; modelDetails? }
```

### Database (Postgres, schema `public`)

| Table | Columns | Notes |
| --- | --- | --- |
| `auth.users` | managed by Supabase | Anonymous or identified users |
| `conversations` | `id uuid pk`, `user_id uuid fk → auth.users`, `title text`, `created_at`, `updated_at` | `updated_at` bumped by trigger when a message is inserted, so the sidebar sorts by recent activity |
| `messages` | `id uuid pk`, `conversation_id uuid fk → conversations (on delete cascade)`, `user_id uuid fk → auth.users`, `role text check in (user, assistant, system)`, `content text`, `created_at`, nullable `model_provider`, `model_name`, `model_source` | Assistant model metadata is stored with the reply; `user_id` is denormalized so RLS stays a simple equality check |

RLS policies: `select/insert/update/delete` allowed only when `user_id = auth.uid()`. Message insert also checks that the target conversation belongs to the caller.

Assistant messages display their timestamp and stored model metadata; their original Markdown can be copied from the reply actions.

---

## 6. Contracts

### `ChatProvider` (AI layer)

```ts
interface ChatProvider {
  readonly name: string;
  generateReply(request: { conversationId: string; messages: ChatTurn[]; signal?: AbortSignal }): Promise<string>;
}
```

- Receives the **full history** (oldest first) so a stateless LLM can use context.
- Must honour `signal` for cancellation.
- Future: add `streamReply(...)`: `AsyncIterable<string>` for token streaming. `useChat` is written so the assistant message is created once the reply completes; streaming will update a draft message in place.

### `ChatRepository` (persistence layer)

```ts
interface ChatRepository {
  listConversations(): Promise<Conversation[]>;
  createConversation(title: string): Promise<Conversation>;
  renameConversation(id: string, title: string): Promise<void>;
  deleteConversation(id: string): Promise<void>;
  listMessages(conversationId: string): Promise<Message[]>;
  addMessage(input: { conversationId; role; content }): Promise<Message>;
}
```

---

## 7. Chat flow (v1)

1. User types and presses Enter (Shift+Enter = newline).
2. If there's no active conversation, `useChat` creates one titled with the first ~40 chars of the message.
3. The user message is persisted and appended to state.
4. `isGenerating = true` → typing indicator shown, input disabled.
5. `provider.generateReply(history)` runs (selected provider: mock, local Ollama, or Gemini Edge Function with mock fallback).
6. The assistant message is persisted and appended; conversation moves to the top of the list.
7. On error, an inline error banner is shown and the input is re-enabled.

---

## 8. PWA

- Manifest generated by `vite-plugin-pwa` (name, theme colour, `display: standalone`, icons incl. maskable).
- Workbox `generateSW` precaches all built assets; navigation falls back to `index.html` (SPA).
- Supabase requests are **not** cached by the service worker (always network). Offline reads are a future enhancement (see backlog).
- `registerType: 'prompt'` → `UpdatePrompt` toast lets the user reload when a new version is deployed, and announces "ready to work offline" on first install.

---

## 9. Environment variables

| Variable | Where | Public? | Purpose |
| --- | --- | --- | --- |
| `VITE_SUPABASE_URL` | `.env.local` | yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | `.env.local` | yes (protected by RLS) | Supabase anon/publishable key |
| `VITE_AI_PROVIDER` | `.env.local` | yes | `mock` (default), `ollama`, or `gemini` |
| `VITE_MOCK_REPLY_DELAY_MS` | `.env.local` | yes | Simulated latency of the mock provider |
| `VITE_OLLAMA_BASE_URL` | `.env.local` | yes | Ollama URL, default `http://localhost:11434` |
| `VITE_OLLAMA_MODEL` | `.env.local` | yes | Installed local model, default `llama3.2` |
| `GEMINI_API_KEY` | Supabase secrets | **no** | Used only by the `chat` Edge Function |
| `GEMINI_MODEL` | Supabase secrets | no | Gemini model id, e.g. `gemini-2.5-flash` |

Never prefix a secret with `VITE_` — Vite inlines those into the client bundle.

## 10. Using Ollama locally

1. Install Ollama, start its server, and pull a model such as `ollama pull llama3.2`.
2. Configure Ollama's `OLLAMA_ORIGINS` to allow the exact frontend origin (for Vite, `http://localhost:5173`); restart Ollama after changing it. Do not use `*` on a server exposed to a network.
3. Set `VITE_AI_PROVIDER=ollama`, and optionally set `VITE_OLLAMA_BASE_URL` and `VITE_OLLAMA_MODEL`, then restart the frontend.
4. The browser sends full conversation history to the configured `/api/chat` endpoint with streaming disabled. Stop cancels the fetch. The user-facing provider status includes the selected model; missing models and server/network errors have actionable messages.

The provider catalog distinguishes free demo replies, locally hosted Ollama (no per-token provider fee; hardware costs still apply), and unknown hosted-provider prices. To add a provider such as Claude, implement `ChatProvider`, register a factory in `src/services/ai/index.ts`, and add accurate pricing metadata in `src/services/ai/catalog.ts`. Never put a hosted-provider API key in a `VITE_` variable.

---

## 11. Plugging in Gemini (future)

1. Implement the Gemini call in `supabase/functions/chat/index.ts` (the stub already validates the JWT shape of the request and returns a hardcoded reply). Use the official `@google/genai` SDK.
2. `supabase secrets set GEMINI_API_KEY=... GEMINI_MODEL=...` and `supabase functions deploy chat`.
3. Set `VITE_AI_PROVIDER=gemini`. `GeminiChatProvider` invokes the function via `supabase.functions.invoke('chat', ...)`; if Supabase isn't configured or the call fails, it falls back to `MockChatProvider` and logs a warning.
4. No component or hook changes required.

---

## 12. Conventions

- TypeScript `strict`; no `any`. Domain types live in `src/types`.
- Components: PascalCase filenames, one component per file, named exports.
- Hooks: `useX.ts`. Services: camelCase files, interfaces in `types.ts`/`repository.ts`.
- DB columns are `snake_case`; map to `camelCase` in the repository layer only.
- Tailwind utility classes for UI styling; global CSS styles generated Markdown typography and tables. No CSS modules.
- Support system, light and dark appearance, with a saved user override; message text size is adjustable.
- Accessibility: semantic landmarks (`aside`, `main`, `form`), labelled buttons, `aria-live` on the message list.
- Tests sit next to the code: `*.test.ts`.
