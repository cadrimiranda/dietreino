import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { nextTick } from "vue";
import { useSessionControl } from "../useSessionControl";

// Mock dependencies
const mockTokenStorage = {
  getAccessToken: vi.fn(),
  getRefreshToken: vi.fn(),
  setAccessToken: vi.fn(),
  setRefreshToken: vi.fn(),
  setUser: vi.fn(),
  clearTokens: vi.fn(),
};

const mockTokenValidator = {
  isTokenValid: vi.fn(),
  isRefreshTokenValid: vi.fn(),
  shouldRefreshToken: vi.fn(),
};

const mockApolloClient = {
  mutate: vi.fn(),
};

const mockRouter = {
  push: vi.fn(),
  currentRoute: {
    value: {
      path: "/dashboard",
    },
  },
};

let mockMessage: any;

// Mock imports - will be setup in beforeEach
vi.mock("../security/authStorage");
vi.mock("vue-router");
vi.mock("@vue/apollo-composable");
vi.mock("ant-design-vue");

// Mock GraphQL mutation
vi.mock("graphql-tag", () => ({
  default: vi.fn(() => ({})),
}));

describe("useSessionControl", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup message mock
    mockMessage = {
      warning: vi.fn(),
    };

    // Setup mocks
    vi.doMock("../security/authStorage", () => ({
      LocalStorageTokenService: vi.fn(() => mockTokenStorage),
      TokenValidator: vi.fn(() => mockTokenValidator),
    }));

    vi.doMock("vue-router", () => ({
      useRouter: vi.fn(() => mockRouter),
    }));

    vi.doMock("@vue/apollo-composable", () => ({
      useApolloClient: vi.fn(() => ({
        resolveClient: () => mockApolloClient,
      })),
    }));

    vi.doMock("ant-design-vue", () => ({
      message: mockMessage,
    }));
    
    // Default mock returns
    mockTokenStorage.getAccessToken.mockReturnValue("valid-access-token");
    mockTokenStorage.getRefreshToken.mockReturnValue("valid-refresh-token");
    mockTokenValidator.isTokenValid.mockReturnValue(true);
    mockTokenValidator.isRefreshTokenValid.mockReturnValue(true);
    mockTokenValidator.shouldRefreshToken.mockReturnValue(false);
    
    // Mock window methods
    Object.defineProperty(window, "location", {
      value: { href: "" },
      writable: true,
    });
    
    global.setInterval = vi.fn();
    global.clearInterval = vi.fn();
    window.addEventListener = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("hasValidSession", () => {
    it("deve retornar true quando access token é válido", () => {
      mockTokenValidator.isTokenValid.mockReturnValue(true);
      
      const { hasValidSession } = useSessionControl();
      
      expect(hasValidSession.value).toBe(true);
    });

    it("deve retornar true quando access token inválido mas refresh token válido", () => {
      mockTokenValidator.isTokenValid.mockReturnValue(false);
      mockTokenValidator.isRefreshTokenValid.mockReturnValue(true);
      
      const { hasValidSession } = useSessionControl();
      
      expect(hasValidSession.value).toBe(true);
    });

    it("deve retornar false quando ambos tokens são inválidos", () => {
      mockTokenValidator.isTokenValid.mockReturnValue(false);
      mockTokenValidator.isRefreshTokenValid.mockReturnValue(false);
      
      const { hasValidSession } = useSessionControl();
      
      expect(hasValidSession.value).toBe(false);
    });
  });

  describe("shouldRefresh", () => {
    it("deve retornar true quando token precisa refresh e refresh token é válido", () => {
      mockTokenValidator.shouldRefreshToken.mockReturnValue(true);
      mockTokenValidator.isRefreshTokenValid.mockReturnValue(true);
      
      const { shouldRefresh } = useSessionControl();
      
      expect(shouldRefresh.value).toBe(true);
    });

    it("deve retornar false quando refresh token é inválido", () => {
      mockTokenValidator.shouldRefreshToken.mockReturnValue(true);
      mockTokenValidator.isRefreshTokenValid.mockReturnValue(false);
      
      const { shouldRefresh } = useSessionControl();
      
      expect(shouldRefresh.value).toBe(false);
    });
  });

  describe("refreshSession", () => {
    it("deve fazer refresh com sucesso", async () => {
      const mockResponse = {
        data: {
          refreshToken: {
            accessToken: "new-access-token",
            refreshToken: "new-refresh-token",
            user: { id: "1", name: "Test User" },
          },
        },
      };
      
      mockApolloClient.mutate.mockResolvedValue(mockResponse);
      
      const { refreshSession } = useSessionControl();
      const result = await refreshSession();
      
      expect(result).toBe(true);
      expect(mockTokenStorage.setAccessToken).toHaveBeenCalledWith("new-access-token");
      expect(mockTokenStorage.setRefreshToken).toHaveBeenCalledWith("new-refresh-token");
      expect(mockTokenStorage.setUser).toHaveBeenCalledWith({ id: "1", name: "Test User" });
    });

    it("deve falhar quando refresh token é inválido", async () => {
      mockTokenStorage.getRefreshToken.mockReturnValue(null);
      
      const { refreshSession } = useSessionControl();
      const result = await refreshSession();
      
      expect(result).toBe(false);
      expect(mockTokenStorage.clearTokens).toHaveBeenCalled();
    });

    it("deve falhar quando mutation falha", async () => {
      mockApolloClient.mutate.mockRejectedValue(new Error("Network error"));
      
      const { refreshSession } = useSessionControl();
      const result = await refreshSession();
      
      expect(result).toBe(false);
      expect(mockTokenStorage.clearTokens).toHaveBeenCalled();
    });

    it("não deve fazer múltiplos refreshes simultâneos", async () => {
      let resolveRefresh: any;
      const refreshPromise = new Promise((resolve) => {
        resolveRefresh = resolve;
      });
      
      mockApolloClient.mutate.mockReturnValue(refreshPromise);
      
      const { refreshSession } = useSessionControl();
      
      // Iniciar dois refreshes simultâneos
      const promise1 = refreshSession();
      const promise2 = refreshSession();
      
      // Resolver o primeiro
      resolveRefresh({
        data: {
          refreshToken: {
            accessToken: "new-token",
            refreshToken: "new-refresh",
          },
        },
      });
      
      const [result1, result2] = await Promise.all([promise1, promise2]);
      
      expect(mockApolloClient.mutate).toHaveBeenCalledTimes(1);
      expect(result1).toBe(true);
      expect(result2).toBe(true);
    });
  });

  describe("expireSession", () => {
    it("deve limpar tokens e redirecionar", () => {
      const { expireSession } = useSessionControl();
      
      expireSession();
      
      expect(mockTokenStorage.clearTokens).toHaveBeenCalled();
      expect(mockMessage.warning).toHaveBeenCalledWith(
        "Sua sessão expirou. Por favor, faça login novamente."
      );
      expect(mockRouter.push).toHaveBeenCalledWith("/login");
    });

    it("deve usar window.location quando router não disponível", () => {
      // Mock router como undefined
      vi.mocked(vi.doMock("vue-router", () => ({
        useRouter: vi.fn(() => null),
      })));
      
      const { expireSession } = useSessionControl();
      
      expireSession();
      
      expect(mockTokenStorage.clearTokens).toHaveBeenCalled();
    });
  });

  describe("checkSession", () => {
    it("deve retornar true para sessão válida", async () => {
      mockTokenValidator.isTokenValid.mockReturnValue(true);
      
      const { checkSession } = useSessionControl();
      const result = await checkSession();
      
      expect(result).toBe(true);
    });

    it("deve fazer refresh quando necessário", async () => {
      mockTokenValidator.isTokenValid.mockReturnValue(false);
      mockTokenValidator.isRefreshTokenValid.mockReturnValue(true);
      mockTokenValidator.shouldRefreshToken.mockReturnValue(true);
      
      mockApolloClient.mutate.mockResolvedValue({
        data: {
          refreshToken: {
            accessToken: "new-token",
            refreshToken: "new-refresh",
          },
        },
      });
      
      const { checkSession } = useSessionControl();
      const result = await checkSession();
      
      expect(result).toBe(true);
      expect(mockApolloClient.mutate).toHaveBeenCalled();
    });

    it("deve expirar sessão quando não há tokens válidos", async () => {
      mockTokenValidator.isTokenValid.mockReturnValue(false);
      mockTokenValidator.isRefreshTokenValid.mockReturnValue(false);
      
      const { checkSession } = useSessionControl();
      const result = await checkSession();
      
      expect(result).toBe(false);
      expect(mockTokenStorage.clearTokens).toHaveBeenCalled();
    });

    it("deve pular verificação quando intervalo não passou", async () => {
      const { checkSession } = useSessionControl();
      
      // Primeira chamada
      await checkSession();
      
      // Segunda chamada imediata (deve pular)
      const result = await checkSession();
      
      expect(result).toBe(true); // Retorna valor cached
    });
  });

  describe("initializeSession", () => {
    it("deve retornar true para token válido", () => {
      mockTokenValidator.isTokenValid.mockReturnValue(true);
      
      const { initializeSession } = useSessionControl();
      const result = initializeSession();
      
      expect(result).toBe(true);
    });

    it("deve iniciar refresh para token expirado com refresh válido", () => {
      mockTokenValidator.isTokenValid.mockReturnValue(false);
      mockTokenValidator.isRefreshTokenValid.mockReturnValue(true);
      
      mockApolloClient.mutate.mockResolvedValue({
        data: {
          refreshToken: {
            accessToken: "new-token",
            refreshToken: "new-refresh",
          },
        },
      });
      
      const { initializeSession } = useSessionControl();
      const result = initializeSession();
      
      expect(result).toBe(true);
    });

    it("deve retornar false quando não há tokens", () => {
      mockTokenStorage.getAccessToken.mockReturnValue(null);
      mockTokenStorage.getRefreshToken.mockReturnValue(null);
      
      const { initializeSession } = useSessionControl();
      const result = initializeSession();
      
      expect(result).toBe(false);
    });

    it("deve expirar sessão quando todos tokens são inválidos", () => {
      mockTokenValidator.isTokenValid.mockReturnValue(false);
      mockTokenValidator.isRefreshTokenValid.mockReturnValue(false);
      
      const { initializeSession } = useSessionControl();
      const result = initializeSession();
      
      expect(result).toBe(false);
      expect(mockTokenStorage.clearTokens).toHaveBeenCalled();
    });
  });

  describe("startSessionMonitoring", () => {
    it("deve configurar monitoramento de intervalo", () => {
      const { startSessionMonitoring } = useSessionControl();
      
      startSessionMonitoring();
      
      expect(setInterval).toHaveBeenCalled();
    });

    it("deve configurar listeners de eventos", () => {
      const { startSessionMonitoring } = useSessionControl();
      
      startSessionMonitoring();
      
      expect(window.addEventListener).toHaveBeenCalledWith("focus", expect.any(Function));
      expect(window.addEventListener).toHaveBeenCalledWith("storage", expect.any(Function));
    });

    it("deve responder a mudanças no localStorage", () => {
      const { startSessionMonitoring, expireSession } = useSessionControl();
      
      startSessionMonitoring();
      
      // Simular evento de storage
      const storageHandler = vi.mocked(window.addEventListener).mock.calls
        .find(call => call[0] === "storage")?.[1] as Function;
      
      if (storageHandler) {
        storageHandler({
          key: "access_token",
          newValue: null,
        });
      }
      
      expect(mockTokenStorage.clearTokens).toHaveBeenCalled();
    });
  });

  describe("Estados reativos", () => {
    it("deve atualizar isSessionActive após refresh bem-sucedido", async () => {
      mockApolloClient.mutate.mockResolvedValue({
        data: {
          refreshToken: {
            accessToken: "new-token",
            refreshToken: "new-refresh",
          },
        },
      });
      
      const { refreshSession, isSessionActive } = useSessionControl();
      
      await refreshSession();
      await nextTick();
      
      expect(isSessionActive.value).toBe(true);
    });

    it("deve marcar isRefreshing durante refresh", async () => {
      let resolveRefresh: any;
      const refreshPromise = new Promise((resolve) => {
        resolveRefresh = resolve;
      });
      
      mockApolloClient.mutate.mockReturnValue(refreshPromise);
      
      const { refreshSession, isRefreshing } = useSessionControl();
      
      const refreshPromiseResult = refreshSession();
      
      expect(isRefreshing.value).toBe(true);
      
      resolveRefresh({
        data: {
          refreshToken: {
            accessToken: "new-token",
            refreshToken: "new-refresh",
          },
        },
      });
      
      await refreshPromiseResult;
      
      expect(isRefreshing.value).toBe(false);
    });
  });
});