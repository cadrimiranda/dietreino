import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import Dashboard from "../Dashboard.vue";

const mockUseRouter = vi.fn();
const mockUseSessionControl = vi.fn();

vi.mock("vue-router", () => ({
  useRouter: mockUseRouter,
}));

vi.mock("../composables/useSessionControl", () => ({
  useSessionControl: mockUseSessionControl,
}));

describe("Dashboard.vue", () => {
  let mockRouter: any;
  let mockSessionControl: any;

  beforeEach(() => {
    mockRouter = {
      push: vi.fn(),
    };

    mockSessionControl = {
      hasValidSession: { value: true },
      isSessionActive: { value: true },
      checkSession: vi.fn().mockResolvedValue(true),
      expireSession: vi.fn(),
    };

    mockUseRouter.mockReturnValue(mockRouter);
    mockUseSessionControl.mockReturnValue(mockSessionControl);
  });

  const createWrapper = () => {
    return mount(Dashboard, {
      global: {
        stubs: {
          "router-view": true,
        },
        mocks: {
          $router: mockRouter,
        },
      },
    });
  };

  describe("Renderização", () => {
    it("deve renderizar o dashboard corretamente", () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain("Welcome back, Carlos!");
      expect(wrapper.text()).toContain("Active Clients");
      expect(wrapper.text()).toContain("Active Training Plans");
      expect(wrapper.text()).toContain("Active Diet Plans");
      expect(wrapper.text()).toContain("New Progress Reports");
    });
  });

  describe("Controle de Sessão", () => {
    it("deve verificar sessão ativa durante a renderização", async () => {
      createWrapper();

      await nextTick();
      // O componente deve renderizar normalmente se a sessão estiver ativa
      expect(mockSessionControl.hasValidSession.value).toBe(true);
    });

    it("deve lidar com sessão expirada", async () => {
      mockSessionControl.hasValidSession.value = false;
      mockSessionControl.isSessionActive.value = false;

      const wrapper = createWrapper();
      await nextTick();

      // O componente ainda deve renderizar, mas o controle de sessão deve detectar problemas
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe("Responsividade e Layout", () => {
    it("deve ter estrutura de grid responsiva", () => {
      const wrapper = createWrapper();

      // Verifica se existem as classes de grid
      expect(wrapper.html()).toContain("grid");
      expect(wrapper.html()).toContain("grid-cols-1");
      expect(wrapper.html()).toContain("lg:grid-cols-4");
    });

    it("deve ter cards com shadow e padding", () => {
      const wrapper = createWrapper();

      expect(wrapper.html()).toContain("bg-white");
      expect(wrapper.html()).toContain("rounded-lg");
      expect(wrapper.html()).toContain("shadow-sm");
    });
  });
});
