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
      <a-button 
        type="primary" 
        size="large"
        @click="showCreateWorkoutDialog = true" 
        :loading="isLoading" 
        :disabled="isLoading"
        class="px-8 py-4 h-auto"
      >
        <plus-outlined /> Adicionar Novo Treino
      </a-button>
    </div>

    <!-- Create Workout Dialog -->
    <a-modal
      v-model:visible="showCreateWorkoutDialog"
      title="Criar Novo Treino"
      :footer="null"
      width="500px"
    >
      <div class="text-center py-6">
        <div class="bg-blue-50 p-6 rounded-full inline-flex mb-6">
          <plus-outlined class="text-4xl text-blue-500" />
        </div>
        <h3 class="text-xl font-semibold mb-8 text-gray-800">Como você deseja criar o treino?</h3>
        
        <div class="flex flex-col gap-3">
          <a-button 
            type="primary" 
            size="large"
            @click="createFromScratch"
            :loading="creatingWorkout"
            class="w-full h-14 flex items-center justify-between px-6 text-left"
          >
            <div class="flex items-center">
              <edit-outlined class="text-lg mr-3" />
              <span class="font-medium">Criar do Zero</span>
            </div>
            <span class="text-sm opacity-75">Criar treino manualmente</span>
          </a-button>
          
          <a-button 
            size="large"
            @click="showUploadDialog = true"
            class="w-full h-14 flex items-center justify-between px-6 text-left border-gray-300 hover:border-blue-400"
          >
            <div class="flex items-center">
              <upload-outlined class="text-lg mr-3 text-gray-600" />
              <span class="font-medium text-gray-700">Importar de Arquivo</span>
            </div>
            <span class="text-sm text-gray-500">Upload de arquivo Excel</span>
          </a-button>
        </div>
        
        <div class="mt-8">
          <a-button 
            @click="showCreateWorkoutDialog = false"
            class="px-8 py-2"
          >
            Cancelar
          </a-button>
        </div>
      </div>
    </a-modal>

    <!-- Upload Dialog -->
    <a-modal
      v-model:visible="showUploadDialog"
      title="Upload de Treino"
      :footer="null"
      width="500px"
    >
      <div class="text-center py-4">
        <div class="bg-blue-50 p-6 rounded-full inline-flex mb-4">
          <upload-outlined class="text-4xl text-blue-500" />
        </div>
        <h3 class="text-lg font-semibold mb-2">Fazer Upload de Treino</h3>
        <p class="text-gray-600 mb-6">
          Selecione um arquivo Excel (.xlsx) para importar um treino existente
        </p>
        
        <div class="mb-6">
          <div class="grid grid-cols-1 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Nome do Treino</label>
              <a-input v-model:value="uploadForm.name" placeholder="Ex: Treino de Força" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Data de Início</label>
                <a-date-picker v-model:value="uploadForm.weekStart" format="DD/MM/YYYY" class="w-full" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Data de Fim</label>
                <a-date-picker v-model:value="uploadForm.weekEnd" format="DD/MM/YYYY" class="w-full" />
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-center space-x-4 mb-4">
          <a-button @click="handleUploadClick" :loading="uploadLoading" :disabled="uploadLoading">
            <upload-outlined /> Selecionar Arquivo
          </a-button>
          <input
            ref="fileInput"
            type="file"
            accept=".xlsx"
            style="display: none"
            @change="handleFileUpload"
          />
        </div>
        
        <div class="flex justify-center space-x-3">
          <a-button @click="showUploadDialog = false">
            Cancelar
          </a-button>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { message } from "ant-design-vue";
import dayjs from "dayjs";
import { 
  ScheduleOutlined, 
  PlusOutlined, 
  EditOutlined, 
  UploadOutlined 
} from "@ant-design/icons-vue";
import { useProcessWorkout } from "./useProcessWorkout";

export default defineComponent({
  name: "EmptyWorkoutState",
  components: {
    ScheduleOutlined,
    PlusOutlined,
    EditOutlined,
    UploadOutlined,
  },
  props: {
    clientId: {
      type: String,
      required: true,
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["file-upload", "workout-created", "workout-creating"],
  setup(props, { emit }) {
    const router = useRouter();
    const { processWorkout, loading: uploadLoading } = useProcessWorkout();
    
    const showCreateWorkoutDialog = ref(false);
    const showUploadDialog = ref(false);
    const creatingWorkout = ref(false);
    const fileInput = ref<HTMLInputElement | null>(null);
    
    const uploadForm = reactive({
      name: "Treino Importado",
      weekStart: dayjs(),
      weekEnd: dayjs().add(12, "week"),
    });

    function createFromScratch() {
      creatingWorkout.value = true;
      showCreateWorkoutDialog.value = false;
      
      // Navigate to NewWorkout page
      router.push({
        name: 'NewWorkout',
        params: { clientId: props.clientId }
      }).then(() => {
        creatingWorkout.value = false;
      }).catch((error) => {
        console.error('Navigation failed:', error);
        creatingWorkout.value = false;
        message.error('Erro ao navegar para criação de treino');
      });
    }

    function handleUploadClick() {
      fileInput.value?.click();
    }

    async function handleFileUpload(event: Event) {
      const target = event.target as HTMLInputElement;
      if (!target.files || target.files.length === 0) return;

      if (!uploadForm.name.trim()) {
        message.error("Nome do treino é obrigatório");
        return;
      }

      if (!uploadForm.weekStart || !uploadForm.weekEnd) {
        message.error("Datas de início e fim são obrigatórias");
        return;
      }

      try {
        // Emit loading state
        emit('workout-creating', true);
        
        await processWorkout({
          input: {
            file: target.files[0],
            userId: props.clientId,
            weekStart: uploadForm.weekStart!.format(),
            weekEnd: uploadForm.weekEnd!.format(),
            workoutName: uploadForm.name,
          },
        });
        
        message.success("Treino importado com sucesso!");
        showUploadDialog.value = false;
        showCreateWorkoutDialog.value = false;
        
        // Emit event to parent to refresh data
        emit('workout-created');
        
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
        message.error(errorMessage || "Erro ao importar treino");
        emit('workout-creating', false);
      } finally {
        // Reset file input
        if (target) {
          target.value = "";
        }
      }
    }

    return {
      showCreateWorkoutDialog,
      showUploadDialog,
      creatingWorkout,
      uploadLoading,
      uploadForm,
      fileInput,
      createFromScratch,
      handleUploadClick,
      handleFileUpload,
    };
  },
});
</script>
