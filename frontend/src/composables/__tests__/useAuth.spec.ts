import { describe, it, expect, beforeEach, vi } from 'vitest'
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

vi.mock('@/security/authStorage', () => ({
  LocalStorageTokenService: vi.fn(() => mockTokenStorage),
  TokenValidator: vi.fn(() => mockTokenValidator)
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn()
  })
}))

vi.mock('@vue/apollo-composable', () => ({
  useApolloClient: () => ({
    resolveClient: () => ({
      mutate: vi.fn(),
      clearStore: vi.fn().mockResolvedValue(true)
    })
  })
}))

vi.mock('ant-design-vue', () => ({
  message: {
    success: vi.fn(),
    warning: vi.fn()
  }
}))

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    
    // Reset mocks
    mockTokenStorage.getAccessToken.mockReturnValue('')
    mockTokenStorage.getRefreshToken.mockReturnValue('')
    mockTokenStorage.getUser.mockReturnValue(null)
    mockTokenValidator.isTokenValid.mockReturnValue(false)
    mockTokenValidator.isRefreshTokenValid.mockReturnValue(false)
  })

  describe('isAuthenticated computed', () => {
    it('deve retornar true quando access token é válido', async () => {
      mockTokenStorage.getAccessToken.mockReturnValue('valid-access-token')
      mockTokenValidator.isTokenValid.mockReturnValue(true)
      mockTokenValidator.isRefreshTokenValid.mockReturnValue(false)

      const { useAuth } = await import('../useAuth')
      const { isAuthenticated } = useAuth()
      
      await nextTick()
      expect(isAuthenticated.value).toBe(true)
    })

    it('deve retornar true quando access token é inválido mas refresh token é válido', async () => {
      mockTokenStorage.getAccessToken.mockReturnValue('invalid-access-token')
      mockTokenStorage.getRefreshToken.mockReturnValue('valid-refresh-token')
      mockTokenValidator.isTokenValid.mockReturnValue(false)
      mockTokenValidator.isRefreshTokenValid.mockReturnValue(true)

      const { useAuth } = await import('../useAuth')
      const { isAuthenticated } = useAuth()
      
      await nextTick()
      expect(isAuthenticated.value).toBe(true)
    })

    it('deve retornar true quando ambos tokens são válidos', async () => {
      mockTokenStorage.getAccessToken.mockReturnValue('valid-access-token')
      mockTokenStorage.getRefreshToken.mockReturnValue('valid-refresh-token')
      mockTokenValidator.isTokenValid.mockReturnValue(true)
      mockTokenValidator.isRefreshTokenValid.mockReturnValue(true)

      const { useAuth } = await import('../useAuth')
      const { isAuthenticated } = useAuth()
      
      await nextTick()
      expect(isAuthenticated.value).toBe(true)
    })

    it('deve retornar false quando ambos tokens são inválidos', async () => {
      mockTokenStorage.getAccessToken.mockReturnValue('invalid-access-token')
      mockTokenStorage.getRefreshToken.mockReturnValue('invalid-refresh-token')
      mockTokenValidator.isTokenValid.mockReturnValue(false)
      mockTokenValidator.isRefreshTokenValid.mockReturnValue(false)

      const { useAuth } = await import('../useAuth')
      const { isAuthenticated } = useAuth()
      
      await nextTick()
      expect(isAuthenticated.value).toBe(false)
    })

    it('deve retornar false quando não há tokens', async () => {
      mockTokenStorage.getAccessToken.mockReturnValue('')
      mockTokenStorage.getRefreshToken.mockReturnValue('')
      mockTokenValidator.isTokenValid.mockReturnValue(false)
      mockTokenValidator.isRefreshTokenValid.mockReturnValue(false)

      const { useAuth } = await import('../useAuth')
      const { isAuthenticated } = useAuth()
      
      await nextTick()
      expect(isAuthenticated.value).toBe(false)
    })
  })
})