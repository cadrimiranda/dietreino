import { provide, inject, ref, readonly } from 'vue'
import { useAuth } from './useAuth'
import { LocalStorageTokenService, TokenValidator } from '@/security/authStorage'

const AuthProviderSymbol = Symbol('AuthProvider')

export function createAuthProvider() {
  const isInitialized = ref(false)
  const isLoading = ref(false)
  const auth = useAuth()
  const tokenStorage = new LocalStorageTokenService()
  const tokenValidator = new TokenValidator()

  async function initialize(): Promise<boolean> {
    if (isInitialized.value) {
      return auth.isAuthenticated.value
    }

    isLoading.value = true

    try {
      const accessToken = tokenStorage.getAccessToken()
      const refreshToken = tokenStorage.getRefreshToken()

      if (!accessToken && !refreshToken) {
        auth.logout()
        return false
      }

      if (accessToken && tokenValidator.isTokenValid(accessToken)) {
        const user = tokenStorage.getUser()
        if (user) {
          auth.setAuthData(accessToken, refreshToken || '', user)
          return true
        }
      }

      if (refreshToken && tokenValidator.isRefreshTokenValid(refreshToken)) {
        const user = tokenStorage.getUser()
        if (user) {
          auth.setAuthData('', refreshToken, user)
          return true
        }
      }

      auth.logout()
      return false
    } catch (error) {
      console.error('Error during auth initialization:', error)
      auth.logout()
      return false
    } finally {
      isLoading.value = false
      isInitialized.value = true
    }
  }

  return {
    isInitialized: readonly(isInitialized),
    isLoading: readonly(isLoading),
    isAuthenticated: auth.isAuthenticated,
    currentUser: auth.currentUser,
    initialize,
    login: auth.login,
    logout: auth.logout,
    refreshToken: auth.refreshToken
  }
}

export function provideAuth() {
  const authProvider = createAuthProvider()
  provide(AuthProviderSymbol, authProvider)
  return authProvider
}

export function useAuthProvider() {
  const authProvider = inject(AuthProviderSymbol)
  if (!authProvider) {
    throw new Error('useAuthProvider must be used within an auth provider')
  }
  return authProvider
}