<template>
  <div class="flex flex-col items-center justify-center py-12 px-4">
    <div class="text-center mb-8">
      <div class="bg-blue-50 p-6 rounded-full inline-flex mb-4">
        <schedule-outlined class="text-4xl text-blue-500" />
      </div>
      <h2 class="text-2xl font-bold mb-2">Nenhum treino disponível</h2>
      <p class="text-gray-600 max-w-md mx-auto">
        Este cliente ainda não possui treinos atribuídos. Crie um novo treino
        para começar a jornada de fitness.
      </p>
    </div>

    <div class="flex space-x-4">
      <a-button @click="handleClick" :loading="isLoading" :disabled="isLoading">
        <plus-outlined /> Upload Novo Treino
      </a-button>
      <input
        ref="fileInput"
        type="file"
        :accept="accept"
        :multiple="multiple"
        :disabled="disabled"
        style="display: none"
        @change="emit('file-upload', $event)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { ScheduleOutlined, PlusOutlined } from "@ant-design/icons-vue";

interface FileUploadProps {
  accept: string;
  multiple: boolean;
  maxSize: number;
  disabled: boolean;
}

export default defineComponent({
  name: "EmptyWorkoutState",
  components: {
    ScheduleOutlined,
    PlusOutlined,
  },
  props: {
    isLoading: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["file-upload"],
  setup({ isLoading }, { emit }) {
    const fileInput = ref<HTMLInputElement | null>(null);

    const props: FileUploadProps = {
      accept: ".xlsx",
      multiple: false,
      maxSize: 10 * 1024 * 1024,
      disabled: false,
    };

    function handleClick() {
      fileInput.value?.click();
    }

    return {
      fileInput,
      handleClick,
      emit,
      isLoading,
      ...props,
    };
  },
});
</script>
