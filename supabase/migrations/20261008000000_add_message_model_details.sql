alter table public.messages
  add column model_provider text
    check (model_provider in ('mock', 'ollama', 'gemini')),
  add column model_name text,
  add column model_source text,
  add constraint messages_model_details_check
    check (
      (
        model_provider is null
        and model_name is null
        and model_source is null
      )
      or (
        role = 'assistant'
        and model_provider is not null
        and model_name is not null
        and model_source is not null
      )
    );
