<template>
  <a-modal
    v-model:visible="dialogVisible"
    :closable="false"
    width="500px"
    title="Usuário cadastrado com sucesso!"
    class="password-reveal-dialog"
  >
    <a-alert
      v-if="toastMessage"
      :message="toastMessage.summary"
      :description="toastMessage.detail"
      :type="toastMessage.type"
      show-icon
      class="mb-4"
    />

    <a-card class="border-none shadow-none p-0">
      <div class="p-fluid">
        <div class="field mb-4">
          <div class="flex justify-content-between align-items-center">
            <label for="username" class="font-bold">Nome de usuário</label>
          </div>
          <div class="flex">
            <a-input id="username" v-model:value="usernameValue" readonly />
            <a-button
              @click="copyToClipboard(usernameValue)"
              title="Copiar nome de usuário"
            >
              <template #icon><CopyOutlined /></template>
            </a-button>
          </div>
        </div>

        <div class="field">
          <div class="flex justify-content-between align-items-center">
            <label for="password" class="font-bold">Senha gerada</label>
            <small class="text-orange-500 font-italic">
              Esta é a única vez que a senha completa será mostrada
            </small>
          </div>
          <div class="flex">
            <a-input-password
              id="password"
              v-model:value="passwordValue"
              :visibilityToggle="false"
              disabled
              :class="{ 'password-fading': isFading }"
              :placeholder="passwordRevealed ? '' : '••••••••••'"
            />
            <a-button
              v-if="!passwordRevealed"
              @click="promptPasswordReveal"
              title="Revelar senha"
              type="primary"
            >
              <template #icon><EyeOutlined /></template>
            </a-button>
            <a-button
              v-else
              @click="copyToClipboard(passwordValue)"
              title="Copiar senha"
              type="success"
            >
              <template #icon><CopyOutlined /></template>
            </a-button>
          </div>

          <a-progress
            v-if="passwordRevealed"
            :percent="revealTimeRemaining"
            :show-info="false"
            class="mt-2"
            :status="revealTimeRemaining < 30 ? 'exception' : 'active'"
          />
          <small v-if="passwordRevealed" class="block text-right text-500">
            Tempo restante: {{ Math.ceil(revealTimeRemaining / 10) }} segundos
          </small>
        </div>

        <a-divider />

        <div class="mt-4 flex flex-column">
          <a-button class="mb-2" @click="sendPasswordEmail">
            <template #icon><MailOutlined /></template>
            Enviar senha por email
          </a-button>
          <a-button type="default" @click="sendPasswordSMS">
            <template #icon><MobileOutlined /></template>
            Enviar senha por SMS
          </a-button>
        </div>
      </div>

      <template #actions>
        <a-button type="text" @click="closeDialog">
          <template #icon><CloseOutlined /></template>
          Fechar
        </a-button>
      </template>
    </a-card>
  </a-modal>
</template>

<script lang="ts">
import { ref, watch, onUnmounted, defineComponent } from "vue";
import {
  CopyOutlined,
  EyeOutlined,
  MailOutlined,
  MobileOutlined,
  CloseOutlined,
} from "@ant-design/icons-vue";
import { message } from "ant-design-vue";

interface ToastMessage {
  type: "success" | "error" | "info" | "warning";
  summary: string;
  detail: string;
}

export default defineComponent({
  name: "PasswordRevealDialog",
  components: {
    CopyOutlined,
    EyeOutlined,
    MailOutlined,
    MobileOutlined,
    CloseOutlined,
  },
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
    username: {
      type: String,
      default: "",
    },
    password: {
      type: String,
      required: true,
    },
  },
  emits: ["close"],
  setup(props, { emit }) {
    const dialogVisible = ref<boolean>(props.visible);
    const usernameValue = ref<string>(props.username);
    const passwordValue = ref<string>(props.password);
    const passwordRevealed = ref<boolean>(false);
    const revealTimeRemaining = ref<number>(100);
    const revealTimer = ref<number | null>(null);
    const isFading = ref<boolean>(false);
    const toastMessage = ref<ToastMessage | null>(null);

    // Watch for changes in props.visible
    watch(
      () => props.visible,
      (newValue) => {
        dialogVisible.value = newValue;
      }
    );

    // Watch for changes in dialogVisible
    watch(
      () => dialogVisible.value,
      (newValue) => {
        if (!newValue) {
          emit("close");
        }
      }
    );

    function promptPasswordReveal(): void {
      revealPassword();
    }

    function revealPassword(): void {
      passwordRevealed.value = true;

      // Start 10-second timer (100 units)
      revealTimeRemaining.value = 100;
      revealTimer.value = window.setInterval(() => {
        revealTimeRemaining.value -= 1;

        // Activate fading effect in the last 3 seconds
        if (revealTimeRemaining.value <= 30) {
          isFading.value = true;
        }

        // End revelation when time is up
        if (revealTimeRemaining.value <= 0) {
          hidePassword();
        }
      }, 100); // Update every 100ms

      // Show toast notification
      showToast(
        "info",
        "Senha revelada",
        "A senha será ocultada automaticamente em 10 segundos"
      );
    }

    function hidePassword(): void {
      if (revealTimer.value) {
        clearInterval(revealTimer.value);
      }
      passwordRevealed.value = false;
      isFading.value = false;

      // Show toast notification
      showToast(
        "info",
        "Senha ocultada",
        "Por segurança, a senha não será mais exibida"
      );
    }

    function copyToClipboard(text: string): void {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          showToast(
            "success",
            "Copiado!",
            "Informação copiada para a área de transferência"
          );
        })
        .catch(() => {
          showToast(
            "error",
            "Erro",
            "Não foi possível copiar para a área de transferência"
          );
        });
    }

    function closeDialog(): void {
      dialogVisible.value = false;
    }

    function sendPasswordEmail(): void {
      // Simulate email sending
      showToast(
        "success",
        "Email enviado",
        "A senha foi enviada por email com link de uso único"
      );
    }

    function sendPasswordSMS(): void {
      // Simulate SMS sending
      showToast(
        "success",
        "SMS enviado",
        "A senha foi enviada por SMS com código de validade de 10 minutos"
      );
    }

    function showToast(
      severity: "success" | "error" | "info" | "warning",
      summary: string,
      detail: string
    ): void {
      // Using both local state for the alert and Ant Design's message system
      toastMessage.value = {
        type: severity,
        summary: summary,
        detail: detail,
      };

      // Also use Ant Design's message system
      message[severity](detail);

      // Clear the alert after 3 seconds
      setTimeout(() => {
        toastMessage.value = null;
      }, 3000);
    }

    // Clean up the timer when the component is unmounted
    onUnmounted(() => {
      if (revealTimer.value) {
        clearInterval(revealTimer.value);
      }
    });

    return {
      dialogVisible,
      usernameValue,
      passwordValue,
      passwordRevealed,
      revealTimeRemaining,
      isFading,
      toastMessage,
      promptPasswordReveal,
      revealPassword,
      hidePassword,
      copyToClipboard,
      closeDialog,
      sendPasswordEmail,
      sendPasswordSMS,
    };
  },
});
</script>

<style scoped>
.password-fading {
  animation: fadeInOut 1s infinite;
}

@keyframes fadeInOut {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
  100% {
    opacity: 1;
  }
}

.password-expiring {
  background-color: #ffcdd2;
}
</style>
