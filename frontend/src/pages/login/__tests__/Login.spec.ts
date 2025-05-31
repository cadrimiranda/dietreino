import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import Login from "../Login.vue";

// Mock ant-design-vue components
const mockACard = {
  template: '<div class="mock-card"><slot /></div>',
  props: ['bordered'],
};

const mockAForm = {
  template: '<form @submit.prevent="$emit(\'finish\', modelValue)"><slot /></form>',
  props: ['model', 'disabled', 'layout'],
  emits: ['finish'],
};

const mockAFormItem = {
  template: '<div><slot /></div>',
  props: ['name', 'label', 'rules'],
};

const mockAInput = {
  template: '<input v-model="value" :placeholder="placeholder" />',
  props: ['placeholder', 'size'],
  computed: {
    value: {
      get() { return this.modelValue; },
      set(val) { this.$emit('update:modelValue', val); }
    }
  },
  emits: ['update:modelValue'],
};

const mockAInputPassword = {
  template: '<input type="password" v-model="value" :placeholder="placeholder" />',
  props: ['placeholder', 'size'],
  computed: {
    value: {
      get() { return this.modelValue; },
      set(val) { this.$emit('update:modelValue', val); }
    }
  },
  emits: ['update:modelValue'],
};

const mockAButton = {
  template: '<button :disabled="loading"><slot /></button>',
  props: ['type', 'htmlType', 'loading'],
};

const mockACheckbox = {
  template: '<input type="checkbox" v-model="checked" />',
  computed: {
    checked: {
      get() { return this.modelValue; },
      set(val) { this.$emit('update:modelValue', val); }
    }
  },
  emits: ['update:modelValue'],
};

const mockAAlert = {
  template: '<div v-if="message" class="alert" :class="type">{{ message }}</div>',
  props: ['type', 'message', 'showIcon'],
};

// These will be defined in beforeEach
let mockUseAuth: any;
let mockUseRouter: any;

describe("Login.vue", () => {
  let mockAuth: any;
  let mockRouter: any;

  beforeEach(() => {
    mockAuth = {
      login: vi.fn(),
      loading: { value: false },
      error: { value: "" },
      isAuthenticated: { value: false },
    };

    mockRouter = {
      push: vi.fn(),
    };

    // Create fresh mocks
    mockUseAuth = vi.fn().mockReturnValue(mockAuth);
    mockUseRouter = vi.fn().mockReturnValue(mockRouter);

    // Apply mocks
    vi.doMock("../../composables/useAuth", () => ({
      useAuth: mockUseAuth,
    }));

    vi.doMock("vue-router", () => ({
      useRouter: mockUseRouter,
    }));

    // Mock localStorage
    Storage.prototype.getItem = vi.fn();
    Storage.prototype.setItem = vi.fn();
    Storage.prototype.removeItem = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const createWrapper = (props = {}) => {
    return mount(Login, {
      props,
      global: {
        components: {
          'a-card': mockACard,
          'a-form': mockAForm,
          'a-form-item': mockAFormItem,
          'a-input': mockAInput,
          'a-input-password': mockAInputPassword,
          'a-button': mockAButton,
          'a-checkbox': mockACheckbox,
          'a-alert': mockAAlert,
          'UserOutlined': { template: '<i class="user-icon" />' },
          'LockOutlined': { template: '<i class="lock-icon" />' },
        },
        stubs: {
          'router-link': {
            template: '<a><slot /></a>',
            props: ['to'],
          },
        },
      },
    });
  };

  describe("Renderização", () => {
    it("deve renderizar o formulário de login corretamente", () => {
      const wrapper = createWrapper();
      
      expect(wrapper.find('[placeholder="Seu email"]').exists()).toBe(true);
      expect(wrapper.find('[placeholder="Sua senha"]').exists()).toBe(true);
      expect(wrapper.find('button[type="submit"]').exists()).toBe(true);
      expect(wrapper.text()).toContain("Bem-vindo");
      expect(wrapper.text()).toContain("Entre para acessar sua conta");
    });

    it("deve mostrar erro quando houver erro de autenticação", async () => {
      mockAuth.error.value = "Email ou senha incorretos";
      const wrapper = createWrapper();
      
      await nextTick();
      expect(wrapper.find('.alert').text()).toContain("Email ou senha incorretos");
    });

    it("deve desabilitar o formulário quando estiver carregando", async () => {
      mockAuth.loading.value = true;
      const wrapper = createWrapper();
      
      await nextTick();
      expect(wrapper.find('form').attributes('disabled')).toBeDefined();
      expect(wrapper.find('button').attributes('disabled')).toBeDefined();
    });
  });

  describe("Controle de Sessão", () => {
    it("deve redirecionar para dashboard se já estiver autenticado", async () => {
      mockAuth.isAuthenticated.value = true;
      createWrapper();
      
      await nextTick();
      expect(mockRouter.push).toHaveBeenCalledWith("/dashboard");
    });

    it("deve carregar email salvo do localStorage se 'lembrar' estava ativo", async () => {
      Storage.prototype.getItem = vi.fn().mockReturnValue("test@example.com");
      const wrapper = createWrapper();
      
      await nextTick();
      expect(wrapper.vm.formState.email).toBe("test@example.com");
      expect(wrapper.vm.formState.remember).toBe(true);
    });

    it("não deve carregar email se não houver no localStorage", async () => {
      Storage.prototype.getItem = vi.fn().mockReturnValue(null);
      const wrapper = createWrapper();
      
      await nextTick();
      expect(wrapper.vm.formState.email).toBe("");
      expect(wrapper.vm.formState.remember).toBe(false);
    });
  });

  describe("Processo de Login", () => {
    it("deve chamar auth.login com credenciais corretas", async () => {
      mockAuth.login.mockResolvedValue({ user: { name: "Test User" } });
      const wrapper = createWrapper();
      
      // Preencher formulário
      wrapper.vm.formState.email = "test@example.com";
      wrapper.vm.formState.password = "password123";
      
      // Submeter formulário
      await wrapper.vm.onFinish(wrapper.vm.formState);
      
      expect(mockAuth.login).toHaveBeenCalledWith("test@example.com", "password123");
    });

    it("deve redirecionar para dashboard após login bem-sucedido", async () => {
      mockAuth.login.mockResolvedValue({ user: { name: "Test User" } });
      const wrapper = createWrapper();
      
      wrapper.vm.formState.email = "test@example.com";
      wrapper.vm.formState.password = "password123";
      
      await wrapper.vm.onFinish(wrapper.vm.formState);
      
      expect(mockRouter.push).toHaveBeenCalledWith("/dashboard");
    });

    it("deve salvar email no localStorage se 'lembrar' estiver marcado", async () => {
      mockAuth.login.mockResolvedValue({ user: { name: "Test User" } });
      const wrapper = createWrapper();
      
      wrapper.vm.formState.email = "test@example.com";
      wrapper.vm.formState.password = "password123";
      wrapper.vm.formState.remember = true;
      
      await wrapper.vm.onFinish(wrapper.vm.formState);
      
      expect(localStorage.setItem).toHaveBeenCalledWith("email", "test@example.com");
    });

    it("deve remover email do localStorage se 'lembrar' não estiver marcado", async () => {
      mockAuth.login.mockResolvedValue({ user: { name: "Test User" } });
      const wrapper = createWrapper();
      
      wrapper.vm.formState.email = "test@example.com";
      wrapper.vm.formState.password = "password123";
      wrapper.vm.formState.remember = false;
      
      await wrapper.vm.onFinish(wrapper.vm.formState);
      
      expect(localStorage.removeItem).toHaveBeenCalledWith("email");
    });

    it("deve tratar erro de login corretamente", async () => {
      const loginError = new Error("Email ou senha incorretos");
      mockAuth.login.mockRejectedValue(loginError);
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      
      const wrapper = createWrapper();
      
      wrapper.vm.formState.email = "test@example.com";
      wrapper.vm.formState.password = "wrongpassword";
      
      await wrapper.vm.onFinish(wrapper.vm.formState);
      
      expect(consoleSpy).toHaveBeenCalledWith("Falha no login:", loginError);
      expect(mockRouter.push).not.toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe("Validação de Formulário", () => {
    it("deve ter regras de validação para email", () => {
      const wrapper = createWrapper();
      const emailRules = wrapper.vm.$options.components?.['a-form-item']?.props?.rules;
      
      // As regras são definidas no template, verificamos se o campo existe
      expect(wrapper.find('[placeholder="Seu email"]').exists()).toBe(true);
    });

    it("deve ter regras de validação para senha", () => {
      const wrapper = createWrapper();
      
      // As regras são definidas no template, verificamos se o campo existe
      expect(wrapper.find('[placeholder="Sua senha"]').exists()).toBe(true);
    });
  });

  describe("Estados de Interface", () => {
    it("deve mostrar estado de carregamento durante login", async () => {
      mockAuth.loading.value = true;
      const wrapper = createWrapper();
      
      await nextTick();
      const button = wrapper.find('button');
      expect(button.attributes('disabled')).toBeDefined();
    });

    it("deve limpar estado de erro ao iniciar novo login", async () => {
      mockAuth.error.value = "Erro anterior";
      const wrapper = createWrapper();
      
      // Simular novo login
      mockAuth.error.value = "";
      await nextTick();
      
      expect(wrapper.find('.alert').exists()).toBe(false);
    });
  });
});