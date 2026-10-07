# Backlog

Product backlog for **ai-chat**. v1 = full chat experience with hardcoded replies; Gemini comes later.

Legend: ✅ done in the initial scaffold · ⬜ to do

---

## v1 user stories

### US-01 · Start a new conversation ✅
**As a** user **I want to** start a fresh chat **so that** I can ask about a new topic.

Acceptance criteria
- [x] A "New chat" button sits at the top of the sidebar (and in the header on mobile).
- [x] Clicking it clears the chat area and shows the empty state with suggestions.
- [x] No conversation row is created until the first message is sent (no empty chats).
- [x] The new conversation's title is the first message, cut to 40 characters with an ellipsis.

### US-02 · Send a message and get a reply ✅
**As a** user **I want to** type a message and get a reply **so that** I can have a conversation.

Acceptance criteria
- [x] Enter sends; Shift+Enter inserts a newline; IME composition doesn't trigger send.
- [x] Empty or whitespace-only messages can't be sent (button disabled).
- [x] My message appears right-aligned in a bubble right after I send it.
- [x] A typing indicator appears while the reply is being generated.
- [x] The assistant reply appears left-aligned with an avatar.
- [x] Input is disabled while a reply is pending, and a Stop button cancels it.
- [x] Replies are hardcoded: keyword matches (hello, help, gemini, thanks), otherwise rotating fallbacks.

### US-03 · See my past conversations ✅
**As a** user **I want to** see a list of my previous chats **so that** I can return to them.

Acceptance criteria
- [x] The sidebar lists conversations, most recently active first.
- [x] Clicking one loads its full message history in chronological order.
- [x] The active conversation is highlighted (`aria-current="page"`).
- [x] An empty list shows "No conversations yet."

### US-04 · Delete a conversation ✅
**As a** user **I want to** delete a chat **so that** I can keep my list tidy.

Acceptance criteria
- [x] Each row has a delete button (shown on hover on desktop, always on mobile).
- [x] Deleting removes the conversation and all its messages (cascade).
- [x] If the deleted chat was open, the view resets to a new chat.
- [ ] ⬜ Ask for confirmation, or offer an "Undo" toast.

### US-05 · Persist chats in Supabase ✅
**As a** user **I want** my chats saved to the cloud **so that** they survive reloads and cache clears.

Acceptance criteria
- [x] On first visit the app signs in anonymously; the session persists across reloads.
- [x] Conversations and messages are stored in Postgres.
- [x] RLS ensures a user can only read and write their own rows.
- [x] Without Supabase env vars, the app falls back to `localStorage` and labels itself "Local mode".
- [x] Auth or connection errors show a readable message instead of a blank screen.

### US-06 · Install and use as an app (PWA) ✅
**As a** user **I want to** install the chat on my phone or desktop **so that** it feels like a native app.

Acceptance criteria
- [x] A valid web manifest with name, theme colour, standalone display, and 192/512 + maskable icons.
- [x] The service worker precaches the app shell; the UI loads offline.
- [x] A toast says "ready to work offline" on first install, and "new version available" with a Reload button on update.
- [ ] ⬜ Lighthouse PWA/installability checks pass on the deployed URL.

### US-07 · Responsive, accessible UI ✅
**As a** user on any device **I want** a clean, readable interface **so that** chatting is comfortable.

Acceptance criteria
- [x] Desktop: fixed sidebar + centred chat column (max ~768px).
- [x] Mobile: the sidebar becomes a drawer opened from a hamburger button, with a backdrop.
- [x] Light and dark mode follow the OS preference.
- [x] Landmarks (`nav`, `main`, `form`), labelled icon buttons, and `aria-live` on the message list.
- [x] Safe-area insets respected on notched devices.

### US-08 · Clear error feedback ✅
**As a** user **I want** to know when something fails **so that** I can retry.

Acceptance criteria
- [x] A failed save or reply shows a dismissible inline error above the input.
- [x] My message stays saved if the reply fails.
- [ ] ⬜ A "Retry" action regenerates the last reply.

---

## Implementation plan

### Phase 1 — Project setup ✅
- [x] Vite + React + TypeScript (strict), ESLint flat config, Vitest.
- [x] Tailwind CSS v4 via `@tailwindcss/vite`.
- [x] `.gitignore`, `.env.example`, `CLAUDE.md`, `README.md`, this backlog.
- [ ] ⬜ CI (GitHub Actions): `npm ci && npm run lint && npm run typecheck && npm test && npm run build`.
- [ ] ⬜ Prettier + pre-commit hook (lint-staged).

### Phase 2 — UI ✅
- [x] `ConversationList`, `ChatWindow`, `MessageBubble`, `InputArea`, `TypingIndicator`.
- [x] Empty state with suggestion chips.
- [x] Auto-growing textarea, auto-scroll to the latest message.
- [ ] ⬜ Markdown rendering for assistant messages (`react-markdown` + sanitisation), code blocks with copy button.

### Phase 3 — Supabase integration ✅
- [x] Supabase client singleton with env-based enable/disable.
- [x] Migration: `conversations`, `messages`, indexes, `updated_at` triggers, RLS policies.
- [x] Anonymous auth bootstrap (`useAuth`).
- [x] `ChatRepository` interface + `SupabaseChatRepository` + `LocalChatRepository`.
- [ ] ⬜ Generate DB types with `supabase gen types typescript` and use them in the repository.
- [ ] ⬜ Integration tests against a local Supabase (`supabase start`).

### Phase 4 — Chat logic ✅
- [x] `useChat` state: conversations, active chat, messages, generating flag, errors.
- [x] Lazy conversation creation on first message, auto-title.
- [x] `ChatProvider` interface + `MockChatProvider` with abort support.
- [x] `GeminiChatProvider` placeholder → Edge Function, with mock fallback.
- [x] Replies that land after switching chats are saved to the right conversation and not shown in the current one.
- [ ] ⬜ Component tests for `useChat` with a fake repository and provider.

### Phase 5 — PWA features ✅
- [x] `vite-plugin-pwa` manifest + Workbox `generateSW`, prompt-based updates.
- [x] Icons generated from `public/favicon.svg` (`npm run generate-pwa-assets`).
- [ ] ⬜ Offline read access to past chats (cache last N conversations in IndexedDB).
- [ ] ⬜ Offline send queue: store outgoing messages and sync when back online (Background Sync).
- [ ] ⬜ Deploy to a static host (Vercel / Netlify / Cloudflare Pages) with SPA fallback.

---

## Future enhancements

### Gemini integration
- [ ] Implement `supabase/functions/chat` with `@google/genai`; map `ChatTurn[]` to Gemini `contents` (`assistant` → `model`).
- [ ] System prompt and safety settings configured server-side.
- [ ] **Streaming**: add `streamReply()` to `ChatProvider`; the Edge Function returns SSE; the UI renders tokens into a draft bubble.
- [ ] Persist assistant messages server-side (the function writes to `messages`) so a reply isn't lost if the tab closes.
- [ ] Per-user rate limiting and token/usage tracking table.
- [ ] Context window management: truncate or summarise long histories.
- [ ] AI-generated conversation titles after the first exchange.
- [ ] Model picker (e.g. flash vs pro) stored per conversation.

### Auth flows
- [ ] Email magic link and OAuth (Google, GitHub) sign-in.
- [ ] Upgrade an anonymous user to a permanent account without losing chats (`linkIdentity` / `updateUser`).
- [ ] Sign out, account menu, delete account (GDPR).
- [ ] Clean up stale anonymous users (scheduled job).

### Conversation management
- [ ] Rename conversations inline (repository method already exists).
- [ ] Search across conversations (Postgres full-text search).
- [ ] Group the sidebar by date (Today, Yesterday, Previous 7 days…).
- [ ] Pin and archive conversations.
- [ ] Edit a sent message and regenerate from that point; copy message; regenerate reply.
- [ ] Export a conversation as Markdown or JSON; shareable read-only links.
- [ ] Realtime sync across devices (Supabase Realtime on `messages`).

### Quality & ops
- [ ] E2E tests with Playwright (send message, reload, persistence, offline shell).
- [ ] Error monitoring (Sentry) and privacy-friendly analytics.
- [ ] i18n (English / Spanish).
- [ ] Theme toggle overriding the OS preference.
