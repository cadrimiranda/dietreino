<template>
  <div class="workout-container">
    <div class="header">
      <h2 class="text-2xl font-bold text-gray-800 mb-2">Meus Exercícios</h2>
      <p class="text-gray-500 mb-6">Gerencie sua rotina de treinos</p>
    </div>

    <div class="overflow-x-auto bg-white rounded-xl shadow-lg">
      <a-table
        :columns="columns"
        :dataSource="workoutData"
        :pagination="false"
        :rowClassName="getRowClassName"
        bordered
        class="workout-table"
      >
        <template #bodyCell="{ column, record, index }">
          <!-- Exercício Column -->
          <template v-if="column.dataIndex === 'exercicio'">
            <div
              v-if="
                editingKey === record.key &&
                (editingCol === 'exercicio' || editingCol === '')
              "
            >
              <a-input
                v-model:value="editingData.exercicio"
                @pressEnter="save(record.key)"
                class="w-full"
                placeholder="Nome do exercício"
                autofocus
              />
            </div>
            <div
              v-else
              class="exercise-cell editable-cell"
              @click="edit(record.key, 'exercicio', record)"
            >
              <span class="text-gray-800 font-medium">{{
                record.exercicio
              }}</span>
            </div>
          </template>

          <!-- Série Column -->
          <template v-else-if="column.dataIndex === 'serie'">
            <div
              v-if="
                editingKey === record.key &&
                (editingCol === 'serie' || editingCol === '')
              "
            >
              <a-input-number
                v-model:value="editingData.serie"
                :min="1"
                :max="20"
                @pressEnter="save(record.key)"
                class="w-full"
              />
            </div>
            <div
              v-else
              class="editable-cell flex justify-center items-center"
              @click="edit(record.key, 'serie', record)"
            >
              <a-tag color="blue" class="px-3 py-1 text-center">
                {{ record.serie }}
              </a-tag>
            </div>
          </template>

          <!-- Repetição Column -->
          <template v-else-if="column.dataIndex === 'repeticao'">
            <div
              v-if="
                editingKey === record.key &&
                (editingCol === 'repeticao' || editingCol === '')
              "
            >
              <a-input
                v-model:value="editingData.repeticao"
                @pressEnter="save(record.key)"
                class="w-full"
                placeholder="Ex: 8 a 10"
              />
            </div>
            <div
              v-else
              class="editable-cell"
              @click="edit(record.key, 'repeticao', record)"
            >
              {{ record.repeticao }}
            </div>
          </template>

          <!-- Descanso Column -->
          <template v-else-if="column.dataIndex === 'descanso'">
            <div
              v-if="
                editingKey === record.key &&
                (editingCol === 'descanso' || editingCol === '')
              "
            >
              <a-input
                v-model:value="editingData.descanso"
                @pressEnter="save(record.key)"
                class="w-full"
                placeholder="Ex: 60s"
              />
            </div>
            <div
              v-else
              class="editable-cell"
              @click="edit(record.key, 'descanso', record)"
            >
              <a-tag color="orange" class="px-2 py-0.5">
                {{ record.descanso }}
              </a-tag>
            </div>
          </template>

          <!-- Link Column -->
          <template v-else-if="column.dataIndex === 'link'">
            <div
              v-if="
                editingKey === record.key &&
                (editingCol === 'link' || editingCol === '')
              "
            >
              <a-input
                v-model:value="editingData.link"
                @pressEnter="save(record.key)"
                class="w-full"
                placeholder="ID do vídeo ou URL"
              />
            </div>
            <div v-else class="flex justify-center">
              <template v-if="record.link">
                <a-button
                  type="link"
                  class="editable-cell"
                  @click="openVideo(record.link)"
                >
                  <template #icon>
                    <PlayCircleOutlined />
                  </template>
                  Ver Técnica
                </a-button>
              </template>
              <template v-else>
                <a-button
                  type="text"
                  class="text-gray-400 editable-cell"
                  @click="edit(record.key, 'link', record)"
                >
                  <template #icon>
                    <PlusOutlined />
                  </template>
                  Adicionar link
                </a-button>
              </template>
            </div>
          </template>

          <!-- Actions Column -->
          <template v-else-if="column.dataIndex === 'operation'">
            <div class="flex flex-col justify-center">
              <template v-if="editingKey === record.key">
                <!-- Salvar/Cancelar em coluna (mantido como estava) -->
                <a-button
                  type="primary"
                  size="small"
                  @click="save(record.key)"
                  class="flex items-center mb-2"
                >
                  <template #icon>
                    <CheckOutlined />
                  </template>
                  Salvar
                </a-button>
                <a-button
                  size="small"
                  @click="cancel"
                  class="flex items-center"
                >
                  <template #icon>
                    <CloseOutlined />
                  </template>
                  Cancelar
                </a-button>
              </template>
              <template v-else>
                <!-- Editar/Excluir em linha (modificado) -->
                <div class="flex flex-row space-x-2">
                  <a-button
                    type="text"
                    size="small"
                    @click="edit(record.key, 'all', record)"
                    class="text-blue-500 hover:text-blue-700 flex items-center"
                    title="Editar todas as células"
                  >
                    <template #icon>
                      <EditOutlined />
                    </template>
                    Editar
                  </a-button>
                  <a-popconfirm
                    title="Tem certeza que deseja deletar?"
                    ok-text="Sim"
                    cancel-text="Não"
                    @confirm="onDelete(record.key)"
                  >
                    <a-button
                      type="text"
                      size="small"
                      class="text-red-500 hover:text-red-700 flex items-center"
                    >
                      <template #icon>
                        <DeleteOutlined />
                      </template>
                      Excluir
                    </a-button>
                  </a-popconfirm>
                </div>
              </template>
            </div>
          </template>
        </template>
      </a-table>
    </div>

    <div class="mt-6 flex justify-between">
      <a-button
        type="primary"
        @click="addRow"
        class="flex items-center bg-blue-600 hover:bg-blue-700 border-none shadow-md"
        size="large"
      >
        <template #icon>
          <PlusOutlined />
        </template>
        Adicionar Exercício
      </a-button>

      <a-button
        type="default"
        @click="saveWorkout"
        class="flex items-center border-gray-300 shadow-md"
        size="large"
      >
        <template #icon>
          <SaveOutlined />
        </template>
        Salvar Treino
      </a-button>
    </div>

    <!-- Modal for video display -->
    <a-modal
      v-model:visible="videoModalVisible"
      :title="videoTitle"
      :footer="null"
      width="800px"
      centered
    >
      <div class="video-container">
        <iframe
          v-if="videoUrl"
          :src="videoUrl"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
          class="w-full aspect-video"
        ></iframe>
      </div>
    </a-modal>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed, h } from "vue";
import {
  Table,
  Input,
  InputNumber,
  Button,
  Popconfirm,
  message,
  Modal,
  Tag,
} from "ant-design-vue";
import {
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined,
  PlayCircleOutlined,
  PlusOutlined,
  SaveOutlined,
} from "@ant-design/icons-vue";

interface WorkoutData {
  key: string;
  exercicio: string;
  serie: number;
  repeticao: string;
  descanso: string;
  link: string;
}

export default defineComponent({
  name: "WorkoutTable",
  components: {
    ATable: Table,
    AInput: Input,
    AInputNumber: InputNumber,
    AButton: Button,
    APopconfirm: Popconfirm,
    AModal: Modal,
    ATag: Tag,
    EditOutlined,
    DeleteOutlined,
    CheckOutlined,
    CloseOutlined,
    PlayCircleOutlined,
    PlusOutlined,
    SaveOutlined,
  },
  setup() {
    const columns = [
      {
        title: "Exercício",
        dataIndex: "exercicio",
        width: "30%",
        className: "bg-blue-700 text-white",
      },
      {
        title: "Séries",
        dataIndex: "serie",
        width: "10%",
      },
      {
        title: "Repetições",
        dataIndex: "repeticao",
        width: "15%",
      },
      {
        title: "Descanso",
        dataIndex: "descanso",
        width: "15%",
      },
      {
        title: "Vídeo",
        dataIndex: "link",
        width: "15%",
      },
      {
        title: "Ações",
        dataIndex: "operation",
        width: "15%",
      },
    ];

    const initialData: WorkoutData[] = [
      {
        key: "1",
        exercicio: "Remada curvada barra pronada",
        serie: 3,
        repeticao: "1x 10 a 12/ 2x 8 a 10",
        descanso: "2-3min.",
        link: "35",
      },
      {
        key: "2",
        exercicio: "Remada baixa barra romana",
        serie: 4,
        repeticao: "2x 8 a 10/ 2x 6 a 8",
        descanso: "2min.",
        link: "60",
      },
      {
        key: "3",
        exercicio: "Puxador frente triângulo",
        serie: 3,
        repeticao: "8 a 10",
        descanso: "2min.",
        link: "55",
      },
      {
        key: "4",
        exercicio: "Posterior de ombro na polia",
        serie: 2,
        repeticao: "8 a 10",
        descanso: "60-90s",
        link: "18",
      },
      {
        key: "5",
        exercicio: "Crucifixo invertido maq. neutra",
        serie: 3,
        repeticao: "6 a 8",
        descanso: "2min.",
        link: "72",
      },
      {
        key: "6",
        exercicio: "Panturrilha em pé maq.",
        serie: 4,
        repeticao: "8 a 10",
        descanso: "60-90s",
        link: "55",
      },
    ];

    const workoutData = ref<WorkoutData[]>(initialData);
    const editingKey = ref<string>("");
    const editingCol = ref<string>("");
    const editingData = reactive<Partial<WorkoutData>>({});
    const videoModalVisible = ref<boolean>(false);
    const videoUrl = ref<string>("");
    const videoTitle = ref<string>("");

    const isEditing = (key: string) => key === editingKey.value;

    const edit = (key: string, colName: string, record: any) => {
      // Garantir que o record seja convertido para o tipo correto
      const typedRecord: WorkoutData = {
        key: record.key,
        exercicio: record.exercicio,
        serie: Number(record.serie),
        repeticao: record.repeticao,
        descanso: record.descanso,
        link: record.link,
      };

      editingData.exercicio = typedRecord.exercicio;
      editingData.serie = typedRecord.serie;
      editingData.repeticao = typedRecord.repeticao;
      editingData.descanso = typedRecord.descanso;
      editingData.link = typedRecord.link;
      editingKey.value = key;

      // Se colName for 'all', não definimos um editingCol específico
      // o que fará com que todas as células fiquem editáveis
      editingCol.value = colName === "all" ? "" : colName;
    };

    const save = (key: string) => {
      const index = workoutData.value.findIndex((item) => item.key === key);

      if (index > -1) {
        // Criar um objeto completo combinando o valor existente com as edições
        const updatedRecord: WorkoutData = {
          ...workoutData.value[index],
          exercicio:
            editingData.exercicio || workoutData.value[index].exercicio,
          serie:
            editingData.serie !== undefined
              ? editingData.serie
              : workoutData.value[index].serie,
          repeticao:
            editingData.repeticao || workoutData.value[index].repeticao,
          descanso: editingData.descanso || workoutData.value[index].descanso,
          link:
            editingData.link !== undefined
              ? editingData.link
              : workoutData.value[index].link,
        };

        // Atribuir o objeto completo
        workoutData.value[index] = updatedRecord;

        editingKey.value = "";
        editingCol.value = "";
        message.success({
          content: "Dados salvos com sucesso!",
          icon: () => h(CheckOutlined, { style: "color: #52c41a" }),
        });
      }
    };

    const cancel = () => {
      editingKey.value = "";
      editingCol.value = "";
    };

    const onDelete = (key: string) => {
      workoutData.value = workoutData.value.filter((item) => item.key !== key);
      message.success({
        content: "Exercício removido com sucesso!",
        icon: () => h(DeleteOutlined, { style: "color: #ff4d4f" }),
      });
    };

    const addRow = () => {
      const newKey = Date.now().toString();
      const newRow: WorkoutData = {
        key: newKey,
        exercicio: "Novo exercício",
        serie: 3,
        repeticao: "8 a 10",
        descanso: "60s",
        link: "",
      };

      workoutData.value.push(newRow);
      edit(newKey, "exercicio", newRow);

      // Scroll to the new row
      setTimeout(() => {
        const element = document.querySelector(`.row-${newKey}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
    };

    // Função para adicionar animação de hover apenas nas células editáveis
    const getRowClassName = (record: WorkoutData) => {
      return `row-${record.key} ${isEditing(record.key) ? "editing-row" : ""}`;
    };

    const openVideo = (link: string) => {
      const exerciseRecord = workoutData.value.find(
        (item) => item.link === link
      );
      videoTitle.value = exerciseRecord
        ? exerciseRecord.exercicio
        : "Técnica do Exercício";

      // Check if link is a YouTube ID or full URL
      if (link.includes("youtube.com") || link.includes("youtu.be")) {
        videoUrl.value = link;
      } else {
        // Assume it's a YouTube video ID
        videoUrl.value = `https://www.youtube.com/embed/${link}`;
      }

      videoModalVisible.value = true;
    };

    const saveWorkout = () => {
      // This would typically save to a backend
      message.success({
        content: "Treino salvo com sucesso!",
        icon: () => h(CheckOutlined, { style: "color: #52c41a" }),
      });
    };

    return {
      columns,
      workoutData,
      editingKey,
      editingCol,
      editingData,
      videoModalVisible,
      videoUrl,
      videoTitle,
      isEditing,
      edit,
      save,
      cancel,
      onDelete,
      addRow,
      getRowClassName,
      openVideo,
      saveWorkout,
    };
  },
});
</script>

<style scoped>
@keyframes pulse-border {
  0% {
    border-color: #e5e7eb;
  }
  50% {
    border-color: #3b82f6;
  }
  100% {
    border-color: #e5e7eb;
  }
}

.workout-container {
  @apply p-6 max-w-6xl mx-auto;
}

.workout-table :deep(.ant-table-thead > tr > th) {
  @apply bg-blue-600 text-white font-bold text-center;
  font-size: 15px;
}

.workout-table :deep(.ant-table-tbody > tr > td:first-child) {
  @apply bg-blue-50 text-gray-800 font-medium;
}

.workout-table :deep(.ant-table-tbody > tr > td) {
  @apply text-center py-4;
}

.workout-table :deep(.ant-table-tbody > tr.editing-row > td) {
  @apply bg-blue-50;
  transition: background-color 0.3s ease;
}

.workout-table :deep(.ant-table-tbody > tr.editing-row > td input),
.workout-table :deep(.ant-table-tbody > tr.editing-row > td .ant-input-number) {
  @apply shadow-sm;
  animation: pulse-border 2s infinite;
}

.workout-table :deep(.ant-table-tbody > tr:hover > td) {
  @apply bg-gray-50;
}

.workout-table :deep(.ant-table) {
  @apply rounded-lg overflow-hidden;
}

.editable-cell {
  @apply cursor-pointer hover:bg-gray-100 py-2 px-3 rounded-md transition duration-200;
}

.editable-cell:hover::after {
  content: "✎";
  @apply ml-1 text-blue-500;
}

.exercise-cell.editable-cell {
  @apply cursor-pointer hover:bg-blue-50 p-2 rounded-md transition duration-200;
}

.exercise-cell.editable-cell:hover::after {
  content: "✎";
  @apply ml-1 text-blue-500;
}

.header {
  @apply mb-8 text-center;
}

/* Fade animation for modal */
.workout-table :deep(.ant-modal-content) {
  @apply rounded-xl overflow-hidden;
}

.workout-table :deep(.ant-input:focus),
.workout-table :deep(.ant-input-number-focused) {
  @apply border-blue-500 shadow-none;
}

.workout-table :deep(.ant-tag) {
  @apply rounded-full;
}
</style>
