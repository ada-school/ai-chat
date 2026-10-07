-- ai-chat v1 schema: conversations + messages, owned by auth.users, protected by RLS.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table public.conversations (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  title       text not null default 'New chat' check (char_length(title) <= 200),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.messages (
  id               uuid primary key default gen_random_uuid(),
  conversation_id  uuid not null references public.conversations (id) on delete cascade,
  user_id          uuid not null references auth.users (id) on delete cascade,
  role             text not null check (role in ('user', 'assistant', 'system')),
  content          text not null check (char_length(content) <= 32000),
  created_at       timestamptz not null default now()
);

create index conversations_user_updated_idx on public.conversations (user_id, updated_at desc);
create index messages_conversation_created_idx on public.messages (conversation_id, created_at);

-- ---------------------------------------------------------------------------
-- Triggers: keep conversations.updated_at in sync
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger conversations_set_updated_at
  before update on public.conversations
  for each row execute function public.set_updated_at();

create or replace function public.touch_conversation_on_message()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  update public.conversations
     set updated_at = now()
   where id = new.conversation_id;
  return new;
end;
$$;

create trigger messages_touch_conversation
  after insert on public.messages
  for each row execute function public.touch_conversation_on_message();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- Anonymous sign-ins use the `authenticated` role too, so these cover them.
-- ---------------------------------------------------------------------------
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

create policy "Users read own conversations"
  on public.conversations for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users create own conversations"
  on public.conversations for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users update own conversations"
  on public.conversations for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users delete own conversations"
  on public.conversations for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users read own messages"
  on public.messages for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users add messages to own conversations"
  on public.messages for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.conversations c
       where c.id = conversation_id
         and c.user_id = (select auth.uid())
    )
  );

create policy "Users delete own messages"
  on public.messages for delete to authenticated
  using ((select auth.uid()) = user_id);
