import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import * as SecureStore from 'expo-secure-store'

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000'

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

const STORE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
}

export const storage = {
  async saveTokens(accessToken: string, refreshToken: string) {
    await SecureStore.setItemAsync(STORE_KEYS.ACCESS_TOKEN, accessToken)
    await SecureStore.setItemAsync(STORE_KEYS.REFRESH_TOKEN, refreshToken)
  },
  async getAccessToken() {
    return SecureStore.getItemAsync(STORE_KEYS.ACCESS_TOKEN)
  },
  async getRefreshToken() {
    return SecureStore.getItemAsync(STORE_KEYS.REFRESH_TOKEN)
  },
  async saveUser(user: object) {
    await SecureStore.setItemAsync(STORE_KEYS.USER, JSON.stringify(user))
  },
  async getUser() {
    const raw = await SecureStore.getItemAsync(STORE_KEYS.USER)
    return raw ? JSON.parse(raw) : null
  },
  async clear() {
    await SecureStore.deleteItemAsync(STORE_KEYS.ACCESS_TOKEN)
    await SecureStore.deleteItemAsync(STORE_KEYS.REFRESH_TOKEN)
    await SecureStore.deleteItemAsync(STORE_KEYS.USER)
  },
}

let isRefreshing = false
let pendingQueue: {
  resolve: (token: string) => void
  reject: (err: unknown) => void
}[] = []

function processQueue(error: unknown, token: string | null) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve(token!)
  })
  pendingQueue = []
}

let onAuthFailure: (() => void) | null = null

export function setAuthFailureHandler(handler: () => void) {
  onAuthFailure = handler
}

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await storage.getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({ resolve, reject })
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`
        return api(original)
      })
    }

    original._retry = true
    isRefreshing = true

    try {
      const refreshToken = await storage.getRefreshToken()
      if (!refreshToken) throw new Error('No refresh token')

      const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken })
      const newToken: string = data.data.accessToken

      await storage.saveTokens(newToken, refreshToken)
      api.defaults.headers.common.Authorization = `Bearer ${newToken}`
      processQueue(null, newToken)

      original.headers.Authorization = `Bearer ${newToken}`
      return api(original)
    } catch (refreshError) {
      processQueue(refreshError, null)
      await storage.clear()
      onAuthFailure?.()
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)
