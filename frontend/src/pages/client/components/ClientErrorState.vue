<template>
  <a-card class="bg-red-50">
    <div class="flex flex-col items-center p-4">
      <div
        class="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4"
      >
        <ExclamationCircleOutlined class="text-red-600 text-2xl" />
      </div>
      <h3 class="text-lg font-medium text-red-900">
        Erro ao carregar clientes
      </h3>
      <p class="mt-2 text-red-600">{{ error.message }}</p>
      <a-button type="danger" class="mt-4" @click="$emit('retry')">
        <template #icon><RedoOutlined /></template>
        Tentar novamente
      </a-button>
    </div>
  </a-card>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { ExclamationCircleOutlined, RedoOutlined } from "@ant-design/icons-vue";

export default defineComponent({
  name: "ClientErrorState",
  components: {
    ExclamationCircleOutlined,
    RedoOutlined,
  },
  props: {
    error: {
      type: Object as PropType<Error>,
      required: true,
    },
  },
  emits: ["retry"],
});
</script>
