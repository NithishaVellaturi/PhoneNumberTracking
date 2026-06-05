import axios from 'axios'
import type { ErrorDetails } from '../types/api'

const baseURL = import.meta.env.VITE_API_BASE_URL ?? '/api'

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
  headers: {
    'Content-Type': 'application/json',
  },
}

export const http = axios.create(sharedConfig)

export function isLocalHost() {
  if (typeof window === 'undefined') {
    return false
  }

  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
}

export function isRelativeProductionApi() {
  return baseURL === '/api' && !isLocalHost()
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
