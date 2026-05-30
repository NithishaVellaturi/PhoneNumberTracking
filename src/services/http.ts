import axios, { type InternalAxiosRequestConfig } from 'axios'
import type { AuthSession, ErrorDetails } from '../types/api'
import { useAuthStore } from '../store/auth-store'

const baseURL = import.meta.env.VITE_API_BASE_URL ?? '/api'

interface RetryableRequestConfig {
  _retry?: boolean
  url?: string
}

export class ApiError extends Error {
  status?: number
  code?: string
  fieldErrors: Record<string, string>

  constructor(message: string, options?: { status?: number; code?: string; fieldErrors?: Record<string, string> }) {
    super(message)
    this.name = 'ApiError'
    this.status = options?.status
    this.code = options?.code
    this.fieldErrors = options?.fieldErrors ?? {}
  }
}

const sharedConfig = {
  baseURL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
}

export const http = axios.create(sharedConfig)
const sessionHttp = axios.create(sharedConfig)

export function isLocalHost() {
  if (typeof window === 'undefined') {
    return false
  }

  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
}

export function isRelativeProductionApi() {
  return baseURL === '/api' && !isLocalHost()
}

function readCookie(name: string) {
  return document.cookie
    .split('; ')
    .find((cookie) => cookie.startsWith(`${name}=`))
    ?.split('=')
    .slice(1)
    .join('=')
}

function addCsrfToken(config: InternalAxiosRequestConfig) {
  const csrfToken = readCookie('XSRF-TOKEN')
  if (csrfToken !== undefined) {
    config.headers.set('X-XSRF-TOKEN', decodeURIComponent(csrfToken))
  }
  return config
}

http.interceptors.request.use(addCsrfToken)
sessionHttp.interceptors.request.use(addCsrfToken)

let refreshPromise: Promise<AuthSession | null> | null = null

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const requestConfig = (error.config ?? {}) as RetryableRequestConfig
    const requestUrl = requestConfig.url ?? ''
    const canRetry =
      error.response?.status === 401 &&
      !requestConfig._retry &&
      !requestUrl.includes('/auth/login') &&
      !requestUrl.includes('/auth/register') &&
      !requestUrl.includes('/auth/refresh') &&
      !requestUrl.includes('/auth/csrf-token')

    if (canRetry) {
      requestConfig._retry = true

      try {
        refreshPromise ??= refreshSessionRequest()
        const refreshedSession = await refreshPromise
        refreshPromise = null

        if (refreshedSession !== null) {
          useAuthStore.getState().setSession(refreshedSession.user, refreshedSession.expiresAt)
          return http(requestConfig)
        }
      } catch {
        refreshPromise = null
      }

      useAuthStore.getState().clearSession()
    }

    return Promise.reject(toApiError(error))
  },
)

export async function primeCsrfToken() {
  await sessionHttp.get('/auth/csrf-token')
}

export async function refreshSessionRequest() {
  try {
    const { data } = await sessionHttp.post<{ data: AuthSession }>('/auth/refresh')
    return data.data
  } catch {
    return null
  }
}

export function toApiError(error: unknown) {
  if (!axios.isAxiosError(error)) {
    return new ApiError(error instanceof Error ? error.message : 'Something went wrong.')
  }

  const responseData = error.response?.data as { message?: string; data?: ErrorDetails } | undefined
  const requestUrl = typeof error.config?.url === 'string' ? error.config.url : ''
  const requestBaseUrl = typeof error.config?.baseURL === 'string' ? error.config.baseURL : baseURL
  const isMissingProductionApi =
    error.response?.status === 404 &&
    !isLocalHost() &&
    requestBaseUrl === '/api' &&
    requestUrl.startsWith('/')

  const message = isMissingProductionApi
    ? 'Backend API is not configured for this deployment. Set VITE_API_BASE_URL in Netlify and deploy the Spring Boot backend separately.'
    : responseData?.message ?? error.message ?? 'Request failed.'

  return new ApiError(message, {
    status: error.response?.status,
    code: responseData?.data?.code,
    fieldErrors: responseData?.data?.fieldErrors,
  })
}
