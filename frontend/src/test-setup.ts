import { vi } from "vitest";

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Create global router mock
global.$router = {
  push: vi.fn(),
  currentRoute: {
    value: {
      path: "/",
      fullPath: "/",
      name: "home",
    },
  },
};

// Mock router
vi.mock("vue-router", () => ({
  useRouter: () => global.$router,
  createRouter: vi.fn(),
  createWebHistory: vi.fn(),
}));

// Mock Apollo
vi.mock("@vue/apollo-composable", () => ({
  useApolloClient: () => ({
    resolveClient: () => ({
      mutate: vi.fn(),
      query: vi.fn(),
      clearStore: vi.fn().mockResolvedValue(true),
    }),
  }),
  useMutation: vi.fn(),
  useQuery: vi.fn(),
}));

// Mock Ant Design
vi.mock("ant-design-vue", () => ({
  message: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}));

// Mock window events
Object.defineProperty(window, "dispatchEvent", {
  value: vi.fn(),
});

Object.defineProperty(window, "addEventListener", {
  value: vi.fn(),
});

// Global mocks for testing
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock fetch for API calls
global.fetch = vi.fn();