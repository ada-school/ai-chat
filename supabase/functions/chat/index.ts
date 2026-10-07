// Supabase Edge Function (Deno): future server-side proxy to Google Gemini.
//
// v1 returns a hardcoded reply so the full request path (browser → function
// → reply) can be tested before Gemini is connected.
//
// Deploy:   supabase functions deploy chat
// Secrets:  supabase secrets set GEMINI_API_KEY=... GEMINI_MODEL=gemini-2.5-flash
//
// To enable Gemini, replace `generateReply` with a call to the official SDK:
//   import { GoogleGenAI } from 'npm:@google/genai'
//   const ai = new GoogleGenAI({ apiKey: Deno.env.get('GEMINI_API_KEY') })
//   const res = await ai.models.generateContent({ model, contents })
//   return res.text

interface ChatTurn {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface ChatRequest {
  conversationId: string
  messages: ChatTurn[]
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

async function generateReply(messages: ChatTurn[]): Promise<string> {
  const last = messages.filter((m) => m.role === 'user').at(-1)?.content ?? ''
  const configured = Boolean(Deno.env.get('GEMINI_API_KEY'))
  return configured
    ? `Gemini is configured but not implemented yet. You said: "${last}"`
    : `Hardcoded reply from the chat Edge Function. You said: "${last}"`
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  // JWT verification is enforced by the Supabase gateway (verify_jwt = true by default).
  let body: ChatRequest
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return json({ error: '`messages` must be a non-empty array' }, 400)
  }

  try {
    return json({ reply: await generateReply(body.messages) })
  } catch (err) {
    console.error('chat function failed', err)
    return json({ error: 'Failed to generate reply' }, 500)
  }
})
