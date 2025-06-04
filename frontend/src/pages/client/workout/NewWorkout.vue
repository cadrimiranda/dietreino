<template>
  <div class="w-full p-6">
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold">Criar Novo Treino</h1>
        <p class="text-gray-600">{{ client.name }}</p>
      </div>
      <div class="flex space-x-3">
        <a-button @click="$router.back()">
          Cancelar
        </a-button>
        <a-button @click="showUploadDialog = true">
          <upload-outlined /> Upload Treino
        </a-button>
        <a-button type="primary" @click="saveWorkout" :loading="saving">
          Salvar Treino
        </a-button>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow p-6">
      <!-- Workout Basic Info -->
      <div class="mb-6">
        <h3 class="text-lg font-semibold mb-4">Informações do Treino</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Nome do Treino</label>
            <a-input v-model:value="workoutForm.name" placeholder="Ex: Treino de Força" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Data de Início</label>
            <a-date-picker v-model:value="workoutForm.weekStart" format="DD/MM/YYYY" class="w-full" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Data de Fim</label>
            <a-date-picker v-model:value="workoutForm.weekEnd" format="DD/MM/YYYY" class="w-full" />
          </div>
        </div>
      </div>

      <!-- Training Days Section -->
      <div class="mb-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold">Dias de Treino</h3>
          <a-button type="dashed" @click="addTrainingDay" :disabled="workoutForm.trainingDays.length >= 7">
            <plus-outlined /> Adicionar Dia
          </a-button>
        </div>

        <!-- Training Days Drag and Drop -->
        <div class="training-days-container mb-4" v-if="workoutForm.trainingDays.length > 0">
          <div class="text-sm font-medium text-gray-700 mb-2">Arraste para reordenar:</div>
          <div 
            class="training-days-list"
            @dragover.prevent
            @drop="onDropTrainingDay"
          >
            <div
              v-for="(day, index) in workoutForm.trainingDays"
              :key="day.tempId"
              class="training-day-tab"
              :class="{ 'active': activeTab === index.toString() }"
              draggable="true"
              @dragstart="onDragStartTrainingDay($event, index)"
              @click="activeTab = index.toString()"
            >
              <div class="drag-handle">⋮⋮</div>
              <span class="day-name">{{ day.name || `Dia ${index + 1}` }}</span>
              <a-button
                type="text"
                size="small"
                danger
                @click.stop="removeTrainingDay(index)"
                v-if="workoutForm.trainingDays.length > 1"
              >
                <delete-outlined />
              </a-button>
            </div>
          </div>
        </div>

        <a-tabs v-model:activeKey="activeTab" v-if="workoutForm.trainingDays.length > 0">
          <a-tab-pane
            v-for="(day, index) in workoutForm.trainingDays"
            :key="index.toString()"
            :tab="day.name || `Dia ${index + 1}`"
          >
            <div class="day-header mb-4">
              <div class="flex flex-col gap-4">
                <a-input
                  v-model:value="day.name"
                  :placeholder="`Nome do Dia ${index + 1}`"
                  class="max-w-xs"
                />
                <DaySelector
                  v-model="day.selectedDays"
                  :label="`Dias da semana para ${day.name || `Dia ${index + 1}`}`"
                  :max-days="1"
                  @change="(selectedDays) => updateDayOfWeek(day, selectedDays)"
                />
              </div>
            </div>

            <a-table
              :columns="columns"
              :data-source="day.exercises"
              :pagination="false"
              bordered
              :rowKey="(record) => record.tempId"
            >
              <template #bodyCell="{ column, record, index }">
                <!-- Nome do Exercício -->
                <template v-if="column.dataIndex === 'name'">
                  <div
                    v-if="
                      editingCell?.tempId === record.tempId &&
                      editingCell?.field === 'name'
                    "
                  >
                    <a-select
                      v-model:value="record.exerciseId"
                      :options="exerciseOptions"
                      placeholder="Selecione um exercício"
                      style="width: 100%"
                      show-search
                      :filter-option="filterExerciseOption"
                      @change="() => saveCell(record)"
                    >
                      <template #notFoundContent>
                        <div class="p-2">
                          <a-button type="link" @click="createNewExercise(record)">
                            + Criar exercício "{{ record.searchTerm }}"
                          </a-button>
                        </div>
                      </template>
                    </a-select>
                  </div>
                  <div
                    v-else
                    @click="editCell(record, 'name')"
                    class="editable-cell"
                  >
                    {{ getExerciseName(record.exerciseId) }}
                  </div>
                </template>

                <!-- Séries -->
                <template v-else-if="column.dataIndex === 'sets'">
                  <div
                    v-if="
                      editingCell?.tempId === record.tempId &&
                      editingCell?.field === 'sets'
                    "
                  >
                    <a-input-number
                      v-model:value="record.totalSets"
                      :min="1"
                      :max="10"
                      @change="() => updateSetsField(record)"
                      @blur="() => saveCell(record)"
                    />
                  </div>
                  <div
                    v-else
                    @click="editCell(record, 'sets')"
                    class="editable-cell text-center"
                  >
                    {{ record.totalSets }}
                  </div>
                </template>

                <!-- Repetições -->
                <template v-else-if="column.dataIndex === 'reps'">
                  <div
                    v-if="
                      editingCell?.tempId === record.tempId &&
                      editingCell?.field === 'reps'
                    "
                  >
                    <a-input
                      v-model:value="record.repsString"
                      placeholder="Ex: 8-10"
                      @input="() => updateRepsField(record)"
                      @blur="() => saveCell(record)"
                    />
                  </div>
                  <div
                    v-else
                    @click="editCell(record, 'reps')"
                    class="editable-cell text-center"
                  >
                    {{ record.repsString }}
                  </div>
                </template>

                <!-- Descanso -->
                <template v-else-if="column.dataIndex === 'rest'">
                  <div
                    v-if="
                      editingCell?.tempId === record.tempId &&
                      editingCell?.field === 'rest'
                    "
                  >
                    <a-input
                      v-model:value="record.restString"
                      placeholder="Ex: 60s"
                      @input="() => updateRestField(record)"
                      @blur="() => saveCell(record)"
                    />
                  </div>
                  <div
                    v-else
                    @click="editCell(record, 'rest')"
                    class="editable-cell text-center"
                  >
                    {{ record.restString }}
                  </div>
                </template>

                <!-- Ações -->
                <template v-else-if="column.dataIndex === 'actions'">
                  <div class="flex gap-2 justify-center">
                    <a-button
                      type="text"
                      danger
                      size="small"
                      @click="removeExercise(day, index)"
                    >
                      <delete-outlined />
                    </a-button>
                    <a-button
                      type="text"
                      size="small"
                      :disabled="index === 0"
                      @click="moveExercise(day, index, -1)"
                    >
                      <arrow-up-outlined />
                    </a-button>
                    <a-button
                      type="text"
                      size="small"
                      :disabled="index === day.exercises.length - 1"
                      @click="moveExercise(day, index, 1)"
                    >
                      <arrow-down-outlined />
                    </a-button>
                  </div>
                </template>
              </template>
            </a-table>

            <a-button type="dashed" block class="mt-4" @click="addExercise(day)">
              <plus-outlined /> Adicionar Exercício
            </a-button>
          </a-tab-pane>
        </a-tabs>

        <div v-else class="text-center py-8">
          <p class="text-gray-500 mb-4">Nenhum dia de treino criado ainda</p>
          <a-button type="dashed" @click="addTrainingDay">
            <plus-outlined /> Adicionar Primeiro Dia
          </a-button>
        </div>
      </div>
    </div>

    <!-- Upload Dialog -->
    <a-modal
      v-model:visible="showUploadDialog"
      title="Upload de Treino"
      :footer="null"
      width="500px"
    >
      <div class="text-center py-8">
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

        <div class="flex justify-center space-x-4">
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
        
        <div class="mt-4 flex justify-center space-x-3">
          <a-button @click="showUploadDialog = false">
            Cancelar
          </a-button>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { message, Modal } from "ant-design-vue";
import dayjs from "dayjs";
import {
  PlusOutlined,
  DeleteOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  UploadOutlined,
} from "@ant-design/icons-vue";
import { useExercises } from "@/composables/useExercises";
import { useUsers } from "@/composables/useUsers";
import { useMutation } from "@vue/apollo-composable";
import { Exercise, CreateWorkoutInput, WorkoutType, TrainingDay, TrainingDayExercise, RepScheme, RestInterval } from "@/generated/graphql";
import { CREATE_WORKOUT } from "@/graphql/mutations/workout";
import { useProcessWorkout } from "./useProcessWorkout";
import DaySelector from "@/components/DaySelector.vue";

interface EditableExercise {
  tempId: string;
  exerciseId: string;
  order: number;
  totalSets: number;
  repsString: string;
  restString: string;
  searchTerm?: string;
  repSchemes: Array<{
    sets: number;
    minReps: number;
    maxReps: number;
  }>;
  restIntervals: Array<{
    intervalTime: string;
    order: number;
  }>;
}

interface EditableTrainingDay {
  tempId: string;
  name: string;
  order: number;
  dayOfWeek: number;
  selectedDays: number[];
  exercises: EditableExercise[];
}

interface WorkoutForm {
  name: string;
  weekStart: dayjs.Dayjs | null;
  weekEnd: dayjs.Dayjs | null;
  trainingDays: EditableTrainingDay[];
}

export default defineComponent({
  name: "NewWorkout",
  components: {
    PlusOutlined,
    DeleteOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined,
    UploadOutlined,
    DaySelector,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const userId = route.params.clientId as string;
    const copyFromCurrent = route.query.copy === 'true';

    const { user } = useUsers({ userId });
    const { exercises } = useExercises();
    const { mutate: createWorkout } = useMutation(CREATE_WORKOUT);
    const { processWorkout, loading: uploadLoading } = useProcessWorkout();

    const client = reactive({
      id: "",
      name: "",
      email: "",
    });

    const workoutForm = reactive<WorkoutForm>({
      name: "Novo Treino",
      weekStart: dayjs(),
      weekEnd: dayjs().add(12, "week"),
      trainingDays: [],
    });

    const activeTab = ref("0");
    const editingCell = ref<{ tempId: string; field: string } | null>(null);
    const saving = ref(false);
    const draggedDayIndex = ref<number | null>(null);
    const showUploadDialog = ref(false);
    const fileInput = ref<HTMLInputElement | null>(null);
    
    const uploadForm = reactive({
      name: "Treino Importado",
      weekStart: dayjs(),
      weekEnd: dayjs().add(12, "week"),
    });

    const exerciseOptions = computed(() =>
      exercises.value.map((ex: Exercise) => ({
        label: ex.name,
        value: ex.id,
      }))
    );

    const columns = [
      {
        title: "Exercício",
        dataIndex: "name",
        width: "40%",
      },
      {
        title: "Séries",
        dataIndex: "sets",
        width: "15%",
        align: "center" as const,
      },
      {
        title: "Repetições",
        dataIndex: "reps",
        width: "20%",
        align: "center" as const,
      },
      {
        title: "Descanso",
        dataIndex: "rest",
        width: "15%",
        align: "center" as const,
      },
      {
        title: "Ações",
        dataIndex: "actions",
        width: "10%",
        align: "center" as const,
      },
    ] as const;

    watch(
      () => user.value,
      (newUser) => {
        if (newUser?.user) {
          Object.assign(client, newUser.user);
          
          if (copyFromCurrent) {
            const activeWorkout = newUser.user.workouts?.find((w) => w.isActive);
            if (activeWorkout) {
              loadWorkoutData(activeWorkout);
            }
          }
        }
      },
      { immediate: true }
    );

    function loadWorkoutData(workout: WorkoutType) {
      workoutForm.name = `${workout.name} - Cópia`;
      
      // Set dates properly for the date picker using dayjs
      workoutForm.weekStart = dayjs();
      workoutForm.weekEnd = dayjs().add(12, "week");
      
      if (workout.trainingDays && workout.trainingDays.length > 0) {
        // Ordenar por order e limitar a no máximo 7 dias de treino
        const sortedTrainingDays = [...workout.trainingDays]
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          .slice(0, 7);
        
        workoutForm.trainingDays = sortedTrainingDays.map((td: TrainingDay, tdIndex: number) => ({
            tempId: `day-${Date.now()}-${tdIndex}`,
            name: td.name,
            order: td.order ?? tdIndex,
            dayOfWeek: td.dayOfWeek ?? tdIndex,
            selectedDays: [td.dayOfWeek ?? tdIndex],
            exercises: [...(td.trainingDayExercises || [])]
              .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
              .map((tde: TrainingDayExercise, index: number) => ({
                tempId: `${td.id}-${index}-${Date.now()}`,
                exerciseId: tde.exercise.id,
                order: tde.order ?? index,
                totalSets: tde.repSchemes?.reduce((sum: number, rs: RepScheme) => sum + rs.sets, 0) || 3,
                repsString: formatRepsString(tde.repSchemes || []),
                restString: formatRestString(tde.restIntervals || []),
                repSchemes: tde.repSchemes?.map((rs: RepScheme) => ({
                  sets: rs.sets,
                  minReps: rs.minReps,
                  maxReps: rs.maxReps,
                })) || [{ sets: 3, minReps: 8, maxReps: 10 }],
                restIntervals: tde.restIntervals && tde.restIntervals.length > 0 
                  ? [...tde.restIntervals]
                      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                      .map((ri: RestInterval) => ({
                        intervalTime: ri.intervalTime,
                        order: ri.order,
                      }))
                  : [{ intervalTime: "60s", order: 0 }],
              }))
        }));
        
        // Set the active tab to the first day
        if (workoutForm.trainingDays.length > 0) {
          activeTab.value = "0";
        }
      }
    }

    function formatRepsString(repSchemes: RepScheme[]): string {
      if (!repSchemes.length) return "8-10";
      if (repSchemes.length === 1) {
        return `${repSchemes[0].minReps}-${repSchemes[0].maxReps}`;
      }
      return repSchemes
        .map((rs) => `${rs.sets}x ${rs.minReps}-${rs.maxReps}`)
        .join(", ");
    }

    function formatRestString(restIntervals: RestInterval[]): string {
      if (!restIntervals.length) return "60s";
      return restIntervals.map((ri) => ri.intervalTime).join(" - ");
    }

    function addTrainingDay() {
      if (workoutForm.trainingDays.length >= 7) {
        message.warning("Não é possível adicionar mais de 7 dias de treino");
        return;
      }
      
      // Encontra o próximo dia da semana disponível (começando da segunda-feira)
      const usedDays = workoutForm.trainingDays.map(td => td.dayOfWeek);
      let nextDay = 1; // Começa da segunda-feira
      while (usedDays.includes(nextDay) && nextDay <= 6) {
        nextDay++;
      }
      if (nextDay > 6) nextDay = 0; // Se chegou no sábado, vai para domingo
      
      const newDay: EditableTrainingDay = {
        tempId: `day-${Date.now()}`,
        name: `Dia ${workoutForm.trainingDays.length + 1}`,
        order: workoutForm.trainingDays.length,
        dayOfWeek: nextDay,
        selectedDays: [nextDay],
        exercises: [],
      };
      workoutForm.trainingDays.push(newDay);
      activeTab.value = (workoutForm.trainingDays.length - 1).toString();
    }

    function removeTrainingDay(index: number) {
      if (workoutForm.trainingDays.length <= 1) return;
      
      workoutForm.trainingDays.splice(index, 1);
      // Reorder remaining days
      workoutForm.trainingDays.forEach((day, i) => {
        day.order = i;
      });
      
      // Adjust active tab
      if (activeTab.value === index.toString() && index > 0) {
        activeTab.value = (index - 1).toString();
      } else if (activeTab.value === index.toString()) {
        activeTab.value = "0";
      }
    }

    function addExercise(day: EditableTrainingDay) {
      const newExercise: EditableExercise = {
        tempId: `exercise-${Date.now()}`,
        exerciseId: exercises.value[0]?.id || "",
        order: day.exercises.length,
        totalSets: 3,
        repsString: "8-10",
        restString: "60s",
        repSchemes: [{ sets: 3, minReps: 8, maxReps: 10 }],
        restIntervals: [{ intervalTime: "60s", order: 0 }],
      };
      day.exercises.push(newExercise);
    }

    function removeExercise(day: EditableTrainingDay, index: number) {
      day.exercises.splice(index, 1);
      day.exercises.forEach((ex, i) => {
        ex.order = i;
      });
    }

    function moveExercise(day: EditableTrainingDay, index: number, direction: number) {
      const newIndex = index + direction;
      if (newIndex >= 0 && newIndex < day.exercises.length) {
        const temp = day.exercises[index];
        day.exercises[index] = day.exercises[newIndex];
        day.exercises[newIndex] = temp;
        day.exercises[index].order = index;
        day.exercises[newIndex].order = newIndex;
      }
    }

    function getExerciseName(exerciseId: string): string {
      const exercise = exercises.value.find((ex) => ex.id === exerciseId);
      return exercise?.name || "Selecione um exercício";
    }

    function editCell(record: EditableExercise, field: string) {
      editingCell.value = { tempId: record.tempId, field };
    }

    function saveCell(record: EditableExercise) {
      editingCell.value = null;
    }

    function updateSetsField(record: EditableExercise) {
      if (record.repSchemes.length === 1) {
        record.repSchemes[0].sets = record.totalSets;
      } else {
        record.repSchemes = [
          {
            sets: record.totalSets,
            minReps: record.repSchemes[0]?.minReps || 8,
            maxReps: record.repSchemes[0]?.maxReps || 10,
          },
        ];
        record.repsString = formatRepsString(record.repSchemes);
      }
    }

    function updateRepsField(record: EditableExercise) {
      record.repSchemes = parseRepsString(record.repsString, record.totalSets);
    }

    function updateRestField(record: EditableExercise) {
      record.restIntervals = parseRestString(record.restString);
    }

    function parseRepsString(repsString: string, totalSets: number): { sets: number; minReps: number; maxReps: number }[] {
      const repSchemes = [];
      const parts = repsString.split(",").map((s) => s.trim());

      let totalSetsFound = 0;
      for (const part of parts) {
        const match = part.match(/(\d+)x\s*(\d+)-(\d+)/);
        if (match) {
          const sets = parseInt(match[1]);
          totalSetsFound += sets;
          repSchemes.push({
            sets: sets,
            minReps: parseInt(match[2]),
            maxReps: parseInt(match[3]),
          });
        } else {
          const simpleMatch = part.match(/(\d+)-(\d+)/);
          if (simpleMatch && totalSetsFound === 0) {
            repSchemes.push({
              sets: totalSets,
              minReps: parseInt(simpleMatch[1]),
              maxReps: parseInt(simpleMatch[2]),
            });
          }
        }
      }

      return repSchemes.length
        ? repSchemes
        : [{ sets: totalSets || 1, minReps: 8, maxReps: 10 }];
    }

    function parseRestString(restString: string): { intervalTime: string; order: number }[] {
      const intervals = restString.split("-").map((s) => s.trim());
      return intervals.map((interval, index) => ({
        intervalTime: interval,
        order: index,
      }));
    }

    function filterExerciseOption(input: string, option: { label: string; value: string }) {
      return option.label.toLowerCase().includes(input.toLowerCase());
    }

    function createNewExercise(record: EditableExercise) {
      // This would require implementing exercise creation
      message.info("Funcionalidade de criar exercício será implementada em breve");
    }

    function onDragStartTrainingDay(event: DragEvent, index: number) {
      draggedDayIndex.value = index;
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/html", "");
      }
    }

    function onDropTrainingDay(event: DragEvent) {
      event.preventDefault();
      const target = event.target as HTMLElement;
      const dropTarget = target.closest(".training-day-tab");
      
      if (dropTarget && draggedDayIndex.value !== null) {
        const dropIndex = Array.from(dropTarget.parentNode?.children || []).indexOf(dropTarget);
        
        if (dropIndex !== -1 && dropIndex !== draggedDayIndex.value) {
          const draggedDay = workoutForm.trainingDays.splice(draggedDayIndex.value, 1)[0];
          workoutForm.trainingDays.splice(dropIndex, 0, draggedDay);
          
          workoutForm.trainingDays.forEach((day, index) => {
            day.order = index;
          });
          
          activeTab.value = dropIndex.toString();
        }
      }
      
      draggedDayIndex.value = null;
    }

    function updateDayOfWeek(day: EditableTrainingDay, selectedDays: number[]) {
      if (selectedDays.length > 0) {
        const newDayOfWeek = selectedDays[0];
        
        // Verifica se o dia já está sendo usado por outro training day
        const conflictingDay = workoutForm.trainingDays.find(
          td => td !== day && td.dayOfWeek === newDayOfWeek
        );
        
        if (conflictingDay) {
          message.warning("Este dia da semana já está sendo usado por outro treino");
          // Reverte a seleção
          day.selectedDays = [day.dayOfWeek];
          return;
        }
        
        day.dayOfWeek = newDayOfWeek;
      }
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
        await processWorkout({
          input: {
            file: target.files[0],
            userId,
            weekStart: uploadForm.weekStart!.format(),
            weekEnd: uploadForm.weekEnd!.format(),
            workoutName: uploadForm.name,
          },
        });
        
        message.success("Treino importado com sucesso!");
        showUploadDialog.value = false;
        await router.push(`/clients/${userId}`);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
        message.error(errorMessage || "Erro ao importar treino");
      } finally {
        // Reset file input
        if (target) {
          target.value = "";
        }
      }
    }

    async function saveWorkout() {
      if (!workoutForm.name.trim()) {
        message.error("Nome do treino é obrigatório");
        return;
      }

      if (!workoutForm.weekStart || !workoutForm.weekEnd) {
        message.error("Datas de início e fim são obrigatórias");
        return;
      }

      if (workoutForm.trainingDays.length === 0) {
        message.error("Adicione pelo menos um dia de treino");
        return;
      }

      const hasEmptyDays = workoutForm.trainingDays.some((day) => day.exercises.length === 0);
      if (hasEmptyDays) {
        message.error("Todos os dias de treino devem ter pelo menos um exercício");
        return;
      }

      saving.value = true;
      try {
        const input: CreateWorkoutInput = {
          userId,
          name: workoutForm.name,
          weekStart: workoutForm.weekStart!.format(),
          weekEnd: workoutForm.weekEnd!.format(),
          trainingDays: workoutForm.trainingDays.map((day) => ({
            name: day.name,
            order: day.order,
            dayOfWeek: day.dayOfWeek,
            exercises: day.exercises.map((ex) => ({
              exerciseId: ex.exerciseId,
              order: ex.order,
              repSchemes: ex.repSchemes,
              restIntervals: ex.restIntervals,
            })),
          })),
        };

        await createWorkout({ input });
        message.success("Treino criado com sucesso!");
        await router.push(`/clients/${userId}`);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
        message.error(errorMessage || "Erro ao criar treino");
      } finally {
        saving.value = false;
      }
    }

    return {
      client,
      workoutForm,
      activeTab,
      editingCell,
      saving,
      columns,
      exerciseOptions,
      showUploadDialog,
      uploadForm,
      uploadLoading,
      fileInput,
      addTrainingDay,
      removeTrainingDay,
      addExercise,
      removeExercise,
      moveExercise,
      getExerciseName,
      editCell,
      saveCell,
      updateSetsField,
      updateRepsField,
      updateRestField,
      filterExerciseOption,
      createNewExercise,
      onDragStartTrainingDay,
      onDropTrainingDay,
      updateDayOfWeek,
      handleUploadClick,
      handleFileUpload,
      saveWorkout,
    };
  },
});
</script>

<style scoped>
.editable-cell {
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.editable-cell:hover {
  background-color: #f0f0f0;
}

.training-days-container {
  margin-bottom: 1rem;
}

.training-days-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  padding: 8px;
  background-color: #f5f5f5;
  border-radius: 8px;
  min-height: 60px;
}

.training-day-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background-color: white;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  cursor: move;
  user-select: none;
  transition: all 0.2s ease;
  min-width: 120px;
}

.training-day-tab:hover {
  border-color: #1890ff;
  box-shadow: 0 2px 4px rgba(24, 144, 255, 0.2);
}

.training-day-tab.active {
  background-color: #1890ff;
  color: white;
  border-color: #1890ff;
}

.training-day-tab:active {
  transform: scale(0.98);
}

.drag-handle {
  color: #999;
  font-size: 14px;
  cursor: grab;
}

.training-day-tab:active .drag-handle {
  cursor: grabbing;
}

.day-name {
  font-weight: 500;
  flex: 1;
}

.day-order {
  font-size: 12px;
  opacity: 0.7;
}
</style>