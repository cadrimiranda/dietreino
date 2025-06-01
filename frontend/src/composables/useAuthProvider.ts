import { provide, inject, ref, readonly, onMounted } from 'vue'
import { useAuth } from './useAuth'
import { LocalStorageTokenService, TokenValidator } from '@/security/authStorage'

const AuthProviderSymbol = Symbol('AuthProvider')

export function createAuthProvider() {
  const isInitialized = ref(false)
  const isLoading = ref(false)
  const auth = useAuth()
  const tokenStorage = new LocalStorageTokenService()
  const tokenValidator = new TokenValidator()
  
  const SESSION_CHECK_INTERVAL = 2 * 60 * 1000 // 2 minutes
  let sessionMonitorInterval: NodeJS.Timeout | null = null

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
    
    // Start session monitoring after initialization
    startSessionMonitoring()
  }

  function startSessionMonitoring() {
    if (sessionMonitorInterval) {
      clearInterval(sessionMonitorInterval)
    }
    
    sessionMonitorInterval = setInterval(async () => {
      if (!auth.isAuthenticated.value) return
      
      const accessToken = tokenStorage.getAccessToken()
      const refreshToken = tokenStorage.getRefreshToken()
      
      // Check if access token needs refresh
      if (tokenValidator.shouldRefreshToken(accessToken) && tokenValidator.isRefreshTokenValid(refreshToken)) {
        try {
          await auth.refreshToken()
        } catch (error) {
          console.error('Failed to refresh token:', error)
          auth.logout()
        }
      }
    }, SESSION_CHECK_INTERVAL)
    
    // Also check when window regains focus
    window.addEventListener('focus', async () => {
      if (!auth.isAuthenticated.value) return
      
      const accessToken = tokenStorage.getAccessToken()
      const refreshToken = tokenStorage.getRefreshToken()
      
      if (!tokenValidator.isTokenValid(accessToken) && !tokenValidator.isRefreshTokenValid(refreshToken)) {
        auth.logout()
      } else if (tokenValidator.shouldRefreshToken(accessToken) && tokenValidator.isRefreshTokenValid(refreshToken)) {
        try {
          await auth.refreshToken()
        } catch (error) {
          console.error('Failed to refresh token on focus:', error)
          auth.logout()
        }
      }
    })
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