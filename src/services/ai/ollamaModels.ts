export interface OllamaModel {
  name: string
  modifiedAt?: string
  size?: number
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export async function listOllamaModels(baseUrl: string, signal?: AbortSignal): Promise<OllamaModel[]> {
  const response = await fetch(`${baseUrl.replace(/\/+$/, '')}/api/tags`, { signal })
  if (!response.ok) throw new Error(`Ollama model request failed (${response.status}).`)

  const payload: unknown = await response.json()
  if (!isRecord(payload) || !Array.isArray(payload.models)) {
    throw new Error('Ollama returned an invalid model list.')
  }

  return payload.models.flatMap((model): OllamaModel[] => {
    if (!isRecord(model) || typeof model.name !== 'string' || !model.name.trim()) return []
    return [{
      name: model.name,
      ...(typeof model.modified_at === 'string' ? { modifiedAt: model.modified_at } : {}),
      ...(typeof model.size === 'number' ? { size: model.size } : {}),
    }]
  })
}
