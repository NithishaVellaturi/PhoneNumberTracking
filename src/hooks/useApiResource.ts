import { startTransition, useCallback, useEffect, useRef, useState } from 'react'

interface ResourceState<T> {
  data: T | null
  error: string | null
  isLoading: boolean
  isRefreshing: boolean
}

interface UseApiResourceOptions<T> {
  enabled?: boolean
  initialData?: T | null
  pollMs?: number
  deps?: ReadonlyArray<unknown>
}

export function useApiResource<T>(
  loader: () => Promise<T>,
  options: UseApiResourceOptions<T> = {},
) {
  const {
    enabled = true,
    initialData = null,
    pollMs,
    deps = [],
  } = options

  const [state, setState] = useState<ResourceState<T>>({
    data: initialData,
    error: null,
    isLoading: enabled,
    isRefreshing: false,
  })
  const loaderRef = useRef(loader)
  const requestIdRef = useRef(0)

  useEffect(() => {
    loaderRef.current = loader
  }, [loader])

  const runLoad = useCallback(async (background: boolean) => {
    if (!enabled) {
      return
    }

    const requestId = ++requestIdRef.current

    setState((current) => ({
      ...current,
      isLoading: background ? current.isLoading : true,
      isRefreshing: background,
      error: background ? current.error : null,
    }))

    try {
      const data = await loaderRef.current()
      if (requestId !== requestIdRef.current) {
        return
      }

      startTransition(() => {
        setState({
          data,
          error: null,
          isLoading: false,
          isRefreshing: false,
        })
      })
    } catch (error) {
      if (requestId !== requestIdRef.current) {
        return
      }

      const message = error instanceof Error ? error.message : 'Something went wrong.'
      startTransition(() => {
        setState((current) => ({
          ...current,
          error: message,
          isLoading: false,
          isRefreshing: false,
        }))
      })
    }
  }, [enabled])

  /* eslint-disable react-hooks/exhaustive-deps -- callers provide explicit refresh dependencies via options.deps */
  useEffect(() => {
    if (!enabled) {
      requestIdRef.current += 1
      startTransition(() => {
        setState({
          data: initialData,
          error: null,
          isLoading: false,
          isRefreshing: false,
        })
      })
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      void runLoad(false)
    }, 0)

    return () => {
      requestIdRef.current += 1
      window.clearTimeout(timeoutId)
    }
  }, [enabled, initialData, runLoad, ...deps])

  useEffect(() => {
    if (!enabled || pollMs === undefined) {
      return undefined
    }

    const intervalId = window.setInterval(() => {
      void runLoad(true)
    }, pollMs)

    return () => {
      requestIdRef.current += 1
      window.clearInterval(intervalId)
    }
  }, [enabled, pollMs, runLoad, ...deps])
  /* eslint-enable react-hooks/exhaustive-deps */

  return {
    ...state,
    reload: async () => runLoad(false),
  }
}
