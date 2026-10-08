import { useCallback, useEffect, useState } from 'react'
import { listOllamaModels, type OllamaModel } from '../services/ai/ollamaModels'

interface OllamaModelsState {
  models: OllamaModel[]
  isLoading: boolean
  error: boolean
  refresh: () => void
}

export function useOllamaModels(baseUrl: string): OllamaModelsState {
  const [models, setModels] = useState<OllamaModel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    listOllamaModels(baseUrl, controller.signal)
      .then(setModels)
      .catch(() => {
        if (!controller.signal.aborted) {
          setModels([])
          setError(true)
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })

    return () => controller.abort()
  }, [baseUrl, refreshKey])

  const refresh = useCallback(() => {
    setIsLoading(true)
    setError(false)
    setRefreshKey((key) => key + 1)
  }, [])

  return { models, isLoading, error, refresh }
}
