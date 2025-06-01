import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { nextTick } from 'vue'

// Mock das dependências
const mockTokenStorage = {
  getAccessToken: vi.fn(),
  getRefreshToken: vi.fn(), 
  getUser: vi.fn(),
  setAccessToken: vi.fn(),
  setRefreshToken: vi.fn(),
  setUser: vi.fn(),
  clearTokens: vi.fn()
}

const mockTokenValidator = {
  isTokenValid: vi.fn(),
  isRefreshTokenValid: vi.fn(),
  shouldRefreshToken: vi.fn()
}

const mockAuth = {
  isAuthenticated: { value: false },
  currentUser: { value: null },
  login: vi.fn(),
  logout: vi.fn(),
  setAuthData: vi.fn(),
  refreshToken: vi.fn()
}

vi.mock('@/security/authStorage', () => ({
  LocalStorageTokenService: vi.fn(() => mockTokenStorage),
  TokenValidator: vi.fn(() => mockTokenValidator)
}))

vi.mock('./useAuth', () => ({
  useAuth: () => mockAuth
}))

describe('useAuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.resetModules()
    
    // Reset mocks
    mockTokenStorage.getAccessToken.mockReturnValue('')
    mockTokenStorage.getRefreshToken.mockReturnValue('')
    mockTokenStorage.getUser.mockReturnValue(null)
    mockTokenValidator.isTokenValid.mockReturnValue(false)
    mockTokenValidator.isRefreshTokenValid.mockReturnValue(false)
    mockTokenValidator.shouldRefreshToken.mockReturnValue(false)
    mockAuth.isAuthenticated.value = false
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  describe('basic functionality', () => {
    it('deve criar auth provider com propriedades esperadas', async () => {
      const { createAuthProvider } = await import('../useAuthProvider')
      const authProvider = createAuthProvider()

      expect(authProvider).toHaveProperty('isInitialized')
      expect(authProvider).toHaveProperty('isLoading') 
      expect(authProvider).toHaveProperty('isAuthenticated')
      expect(authProvider).toHaveProperty('currentUser')
      expect(authProvider).toHaveProperty('initialize')
      expect(authProvider).toHaveProperty('login')
      expect(authProvider).toHaveProperty('logout')
      expect(authProvider).toHaveProperty('refreshToken')
    })

    it('deve inicializar corretamente', async () => {
      mockAuth.isAuthenticated.value = true

      const { createAuthProvider } = await import('../useAuthProvider')
      const authProvider = createAuthProvider()
      
      const result = await authProvider.initialize()
      
      expect(typeof result).toBe('boolean')
      expect(authProvider.isInitialized.value).toBe(true)
    })
  })
})