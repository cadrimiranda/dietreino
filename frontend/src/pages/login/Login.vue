<!-- src/pages/login/Login.vue -->
<template>
  <div class="flex min-h-screen bg-gray-100 items-center justify-center p-4">
    <a-card :bordered="false" class="w-full max-w-md shadow-lg">
      <template #title>
        <div class="text-center">
          <h1 class="text-2xl font-bold text-gray-800">Bem-vindo</h1>
          <p class="text-gray-600 mt-1">Entre para acessar sua conta</p>
        </div>
      </template>

      <a-form
        :model="formState"
        @finish="onFinish"
        layout="vertical"
        :disabled="loading"
      >
        <a-alert
          v-if="error"
          type="error"
          :message="error"
          class="mb-4"
          show-icon
        />

        <a-form-item
          name="email"
          label="Email"
          :rules="[
            { required: true, message: 'Por favor insira seu email' },
            { type: 'email', message: 'Email inválido' },
          ]"
        >
          <a-input
            v-model:value="formState.email"
            placeholder="Seu email"
            size="large"
          >
            <template #prefix>
              <UserOutlined class="text-gray-400" />
            </template>
          </a-input>
        </a-form-item>

        <a-form-item
          name="password"
          label="Senha"
          :rules="[
            { required: true, message: 'Por favor insira sua senha' },
            { min: 6, message: 'A senha deve ter pelo menos 6 caracteres' },
          ]"
        >
          <a-input-password
            v-model:value="formState.password"
            placeholder="Sua senha"
            size="large"
          >
            <template #prefix>
              <LockOutlined class="text-gray-400" />
            </template>
          </a-input-password>
        </a-form-item>

        <div class="flex justify-between items-center mb-4">
          <a-checkbox v-model:checked="formState.remember">Lembrar</a-checkbox>
          <a href="#" class="text-blue-600 hover:text-blue-800">
            Esqueceu a senha?
          </a>
        </div>

        <a-form-item>
          <a-button
            type="primary"
            html-type="submit"
            :loading="loading"
            class="w-full h-10 text-base"
          >
            Entrar
          </a-button>
        </a-form-item>

        <div class="text-center mt-4">
          <p class="text-gray-600">
            Ainda não tem uma conta?
            <router-link
              to="/register"
              class="text-blue-600 hover:text-blue-800 font-medium"
            >
              Registre-se
            </router-link>
          </p>
        </div>
      </a-form>
    </a-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs, onMounted } from "vue";
import { UserOutlined, LockOutlined } from "@ant-design/icons-vue";
import { useRouter } from "vue-router";
import { useAuth } from "../../composables/useAuth";

interface FormState {
  email: string;
  password: string;
  remember: boolean;
}

export default defineComponent({
  name: "LoginView",
  components: {
    UserOutlined,
    LockOutlined,
  },
  setup() {
    const router = useRouter();
    const auth = useAuth();

    const formState = reactive<FormState>({
      email: "",
      password: "",
      remember: false,
    });

    onMounted(() => {
      if (auth.isAuthenticated.value) {
        router.push("/dashboard");
      } else {
        const savedEmail = localStorage.getItem("email");
        if (savedEmail) {
          formState.email = savedEmail;
          formState.remember = true;
        }
      }
    });

    const onFinish = async (values: FormState): Promise<void> => {
      try {
        await auth.login(values.email, values.password);
        if (formState.remember) {
          localStorage.setItem("email", values.email);
        } else {
          localStorage.removeItem("email");
        }

        router.push("/dashboard");
      } catch (err) {
        console.error("Falha no login:", err);
      }
    };

    return {
      formState,
      onFinish,
      loading: auth.loading,
      error: auth.error,
    };
  },
});
</script>
