<template>
  <a-modal
    v-model:visible="dialogVisible"
    :closable="true"
    :footer="false"
    width="500px"
    title="Usuário cadastrado com sucesso!"
    class="password-reveal-dialog"
  >
    <a-card class="border-none shadow-none p-0">
      <a-space direction="vertical w-full">
        <div class="flex justify-content-between align-items-center">
          <label for="username" disabled class="font-bold"
            >Nome de usuário</label
          >
        </div>
        <a-input-group compact>
          <a-input
            id="username"
            v-model:value="usernameValue"
            readonly
            style="width: calc(100% - 40px)"
          />
          <a-button
            @click="copyToClipboard(usernameValue)"
            title="Copiar nome de usuário"
          >
            <template #icon><CopyOutlined /></template>
          </a-button>
        </a-input-group>

        <div class="flex align-items-center flex-col">
          <label for="password" class="font-bold">Senha gerada</label>
          <small class="text-orange-500 font-italic">
            Esta é a única vez que a senha completa será mostrada
          </small>
        </div>
        <a-input-group compact>
          <a-input-password
            id="password"
            v-model:value="passwordValue"
            v-model:visible="passwordRevealed"
            :visibilityToggle="false"
            disabled
            :placeholder="passwordRevealed ? '' : '••••••••••'"
            style="width: calc(100% - 40px)"
          />
          <a-tooltip v-if="!passwordRevealed" title="Revelar senha">
            <a-button
              @click="promptPasswordReveal"
              title="Revelar senha"
              type="primary"
            >
              <template #icon><EyeOutlined /></template>
            </a-button>
          </a-tooltip>

          <a-tooltip v-else title="Copiar senha">
            <a-button
              @click="copyToClipboard(passwordValue)"
              title="Copiar senha"
            >
              <template #icon><CopyOutlined /></template>
            </a-button>
          </a-tooltip>
        </a-input-group>

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
      </a-space>
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

    function showToast(
      severity: "success" | "error" | "info" | "warning",
      summary: string,
      detail: string
    ): void {
      toastMessage.value = {
        type: severity,
        summary: summary,
        detail: detail,
      };

      message[severity](detail);

      setTimeout(() => {
        toastMessage.value = null;
      }, 3000);
    }

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
      toastMessage,
      promptPasswordReveal,
      revealPassword,
      hidePassword,
      copyToClipboard,
    };
  },
});
</script>

<style scoped>
.password-expiring {
  background-color: #ffcdd2;
}
</style>
