import type { ApiResponse, AuthPayload, AuthSession, RegisterPayload, User } from '../types/api'
import { http, primeCsrfToken } from './http'

export const authService = {
  login: async (payload: AuthPayload) => {
    await primeCsrfToken()
    const { data } = await http.post<ApiResponse<AuthSession>>('/auth/login', payload)
    return data
  },
  register: async (payload: RegisterPayload) => {
    await primeCsrfToken()
    const { data } = await http.post<ApiResponse<User>>('/auth/register', payload)
    return data
  },
  session: async () => {
    const { data } = await http.get<ApiResponse<{ authenticated: boolean; user: User | null }>>('/auth/session')
    return data
  },
  profile: async () => {
    const { data } = await http.get<ApiResponse<User>>('/auth/profile')
    return data
  },
  logout: async () => {
    await primeCsrfToken()
    const { data } = await http.post<ApiResponse<null>>('/auth/logout')
    return data
  },
}
