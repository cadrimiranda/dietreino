<template>
  <div
    class="h-screen flex flex-col items-center justify-center bg-gray-50 px-4"
  >
    <div class="text-center">
      <h1 class="text-9xl font-bold text-primary-dark">404</h1>

      <div class="mt-4 mb-8">
        <h2 class="text-2xl font-semibold text-gray-800">
          Página não encontrada
        </h2>
        <p class="text-gray-600 mt-2">
          A página que você está procurando não existe ou foi movida.
        </p>
      </div>

      <div class="space-y-4">
        <a-button type="primary" size="large" @click="goHome">
          <template #icon><HomeOutlined /></template>
          Voltar ao início
        </a-button>

        <div class="mt-6">
          <p class="text-gray-500">
            Ou entre em contato com o suporte se acredita que isso é um erro.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { useRouter } from "vue-router";
import { HomeOutlined } from "@ant-design/icons-vue";
import { useAuth } from "../composables/useAuth";

export default defineComponent({
  name: "NotFoundView",
  components: {
    HomeOutlined,
  },
  setup() {
    const router = useRouter();
    const { isAuthenticated } = useAuth();

    // Navegar para a página inicial apropriada com base no estado de autenticação
    const goHome = () => {
      if (isAuthenticated.value) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    };

    return {
      goHome,
    };
  },
});
</script>
