import { getCookie } from 'cookies-next/client'

export function getAuthHeaders(): HeadersInit {
  const token = getCookie('auth_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}
