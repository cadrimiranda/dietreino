<template>
  <a-modal
    v-model:visible="visible"
    :title="`Editar Treino - ${workout.name}`"
    width="90%"
    :footer="null"
    :maskClosable="false"
  >
    <div class="workout-edit-container">
      <a-alert
        v-if="workout.startedAt"
        message="Treino já iniciado"
        description="Este treino já foi iniciado e não pode ser editado."
        type="warning"
        show-icon
        class="mb-4"
      />

      <div v-if="!workout.startedAt">
        <!-- Training Days Drag and Drop -->
        <div class="training-days-container mb-4">
          <div class="text-sm font-medium text-gray-700 mb-2">Dias de Treino (arraste para reordenar):</div>
          <div 
            class="training-days-list"
            @dragover.prevent
            @drop="onDropTrainingDay"
          >
            <div
              v-for="(day, index) in editableTrainingDays"
              :key="day.id || index"
              class="training-day-tab"
              :class="{ 'active': activeTab === index.toString() }"
              draggable="true"
              @dragstart="onDragStartTrainingDay($event, index)"
              @click="activeTab = index.toString()"
            >
              <div class="drag-handle">⋮⋮</div>
              <span class="day-name">{{ day.name }}</span>
              <span class="day-order">({{ index + 1 }})</span>
            </div>
          </div>
        </div>

        <a-tabs v-model:activeKey="activeTab">
        <a-tab-pane
          v-for="(day, index) in editableTrainingDays"
          :key="index.toString()"
          :tab="day.name"
        >
          <div class="day-header mb-4">
            <div class="flex flex-col gap-4">
              <a-input
                v-model:value="day.name"
                placeholder="Nome do dia"
                class="max-w-xs"
              />
              <DaySelector
                v-model="day.selectedDays"
                :label="`Dias da semana para ${day.name || 'este treino'}`"
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
                    @change="() => saveCell(record)"
                  />
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

        <div class="flex justify-end gap-2 mt-6">
          <a-button @click="cancel">Cancelar</a-button>
          <a-button type="primary" @click="confirmSave" :loading="saving">
            Salvar Alterações
          </a-button>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from "vue";
import { message, Modal } from "ant-design-vue";
import {
  DeleteOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  PlusOutlined,
} from "@ant-design/icons-vue";
import { useExercises } from "@/composables/useExercises";
import { useMutation } from "@vue/apollo-composable";
import { UPDATE_WORKOUT_EXERCISES } from "@/graphql/mutations/workout";
import { Exercise, UpdateWorkoutExercisesInput } from "@/generated/graphql";
import DaySelector from "@/components/DaySelector.vue";

interface EditableExercise {
  tempId: string;
  exerciseId: string;
  order: number;
  totalSets: number;
  repsString: string;
  restString: string;
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
  id?: string;
  name: string;
  order: number;
  dayOfWeek: number;
  selectedDays: number[];
  exercises: EditableExercise[];
}

export default defineComponent({
  name: "WorkoutEditDialog",
  components: {
    DeleteOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined,
    PlusOutlined,
    DaySelector,
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    workout: {
      type: Object,
      required: true,
    },
  },
  emits: ["update:modelValue", "saved"],
  setup(props, { emit }) {
    const visible = computed({
      get: () => props.modelValue,
      set: (value) => emit("update:modelValue", value),
    });

    const activeTab = ref("0");
    const editableTrainingDays = ref<EditableTrainingDay[]>([]);
    const editingCell = ref<{ tempId: string; field: string } | null>(null);
    const saving = ref(false);
    const draggedDayIndex = ref<number | null>(null);

    const { exercises, loading: loadingExercises } = useExercises();
    const { mutate: updateWorkoutExercises } = useMutation(
      UPDATE_WORKOUT_EXERCISES
    );

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
        align: "center",
      },
      {
        title: "Repetições",
        dataIndex: "reps",
        width: "20%",
        align: "center",
      },
      {
        title: "Descanso",
        dataIndex: "rest",
        width: "15%",
        align: "center",
      },
      {
        title: "Ações",
        dataIndex: "actions",
        width: "10%",
        align: "center",
      },
    ];

    // Initialize editable data from workout
    watch(
      () => props.workout,
      (workout) => {
        if (workout?.trainingDays) {
          editableTrainingDays.value = workout.trainingDays.map(
            (td: any, tdIndex: number) => ({
              id: td.id,
              name: td.name,
              order: td.order !== null && td.order !== undefined && typeof td.order === "number" ? td.order : tdIndex,
              dayOfWeek:
                td.dayOfWeek !== null && td.dayOfWeek !== undefined && typeof td.dayOfWeek === "number" ? td.dayOfWeek : tdIndex,
              selectedDays: [td.dayOfWeek !== null && td.dayOfWeek !== undefined && typeof td.dayOfWeek === "number" ? td.dayOfWeek : tdIndex],
              exercises: td.trainingDayExercises.map(
                (tde: any, index: number) => ({
                  tempId: `${td.id}-${index}`,
                  exerciseId: tde.exercise.id,
                  order: index,
                  totalSets: tde.repSchemes.reduce(
                    (sum: number, rs: any) => sum + rs.sets,
                    0
                  ),
                  repsString: formatRepsString(tde.repSchemes),
                  restString: formatRestString(tde.restIntervals),
                  repSchemes: tde.repSchemes.map((rs: any) => ({
                    id: rs.id,
                    sets: rs.sets,
                    minReps: rs.minReps,
                    maxReps: rs.maxReps,
                  })),
                  restIntervals: tde.restIntervals.map((ri: any) => ({
                    id: ri.id,
                    intervalTime: ri.intervalTime,
                    order: ri.order,
                  })),
                })
              ),
            })
          );
        }
      },
      { immediate: true }
    );

    function formatRepsString(repSchemes: any[]): string {
      if (!repSchemes.length) return "-";
      if (repSchemes.length === 1) {
        return `${repSchemes[0].minReps}-${repSchemes[0].maxReps}`;
      }
      return repSchemes
        .map((rs) => `${rs.sets}x ${rs.minReps}-${rs.maxReps}`)
        .join(", ");
    }

    function formatRestString(restIntervals: any[]): string {
      if (!restIntervals.length) return "-";
      return restIntervals.map((ri) => ri.intervalTime).join(" - ");
    }

    function getExerciseName(exerciseId: string): string {
      const exercise = exercises.value.find((ex) => ex.id === exerciseId);
      return exercise?.name || "Exercício não encontrado";
    }

    function editCell(record: EditableExercise, field: string) {
      editingCell.value = { tempId: record.tempId, field };
    }

    function updateSetsField(record: EditableExercise) {
      const oldTotalSets = record.repSchemes.reduce(
        (sum, rs) => sum + rs.sets,
        0
      );
      if (record.totalSets !== oldTotalSets) {
        // If we have a simple rep scheme (one entry), just update its sets
        if (record.repSchemes.length === 1) {
          record.repSchemes[0].sets = record.totalSets;
        } else {
          // For complex rep schemes, recalculate proportionally or reset to simple
          record.repSchemes = [
            {
              sets: record.totalSets,
              minReps: record.repSchemes[0]?.minReps || 8,
              maxReps: record.repSchemes[0]?.maxReps || 10,
            },
          ];
          // Update the reps string to reflect the change
          record.repsString = formatRepsString(record.repSchemes);
        }
      }
    }

    function updateRepsField(record: EditableExercise) {
      record.repSchemes = parseRepsString(
        record.repsString,
        record.totalSets
      );
    }

    function updateRestField(record: EditableExercise) {
      record.restIntervals = parseRestString(record.restString);
    }

    function saveCell(record: EditableExercise) {
      editingCell.value = null;
    }

    function parseRepsString(repsString: string, totalSets: number): any[] {
      // Simple parser for formats like "8-10" or "2x 8-10, 1x 6-8"
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

    function parseRestString(restString: string): any[] {
      const intervals = restString.split("-").map((s) => s.trim());
      return intervals.map((interval, index) => ({
        intervalTime: interval,
        order: index,
      }));
    }

    function addExercise(day: EditableTrainingDay) {
      const newExercise: EditableExercise = {
        tempId: `new-${Date.now()}`,
        exerciseId: exercises.value[0]?.id || "",
        order: day.exercises.length,
        totalSets: 1,
        repsString: "8-10",
        restString: "60s",
        repSchemes: [{ sets: 1, minReps: 8, maxReps: 10 }],
        restIntervals: [{ intervalTime: "60s", order: 0 }],
      };
      day.exercises.push(newExercise);
    }

    function removeExercise(day: EditableTrainingDay, index: number) {
      day.exercises.splice(index, 1);
      // Reorder remaining exercises
      day.exercises.forEach((ex, i) => {
        ex.order = i;
      });
    }

    function moveExercise(
      day: EditableTrainingDay,
      index: number,
      direction: number
    ) {
      const newIndex = index + direction;
      if (newIndex >= 0 && newIndex < day.exercises.length) {
        const temp = day.exercises[index];
        day.exercises[index] = day.exercises[newIndex];
        day.exercises[newIndex] = temp;
        // Update order
        day.exercises[index].order = index;
        day.exercises[newIndex].order = newIndex;
      }
    }

    function onDragStartTrainingDay(event: DragEvent, index: number) {
      draggedDayIndex.value = index;
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/html', '');
      }
    }

    function onDropTrainingDay(event: DragEvent) {
      event.preventDefault();
      const target = event.target as HTMLElement;
      const dropTarget = target.closest('.training-day-tab');
      
      if (dropTarget && draggedDayIndex.value !== null) {
        const dropIndex = Array.from(dropTarget.parentNode?.children || []).indexOf(dropTarget);
        
        if (dropIndex !== -1 && dropIndex !== draggedDayIndex.value) {
          // Remove the dragged item and insert it at the new position
          const draggedDay = editableTrainingDays.value.splice(draggedDayIndex.value, 1)[0];
          editableTrainingDays.value.splice(dropIndex, 0, draggedDay);
          
          // Update all order properties to match new array positions
          editableTrainingDays.value.forEach((day, index) => {
            day.order = index;
          });
          
          // Update active tab to follow the moved day
          activeTab.value = dropIndex.toString();
        }
      }
      
      draggedDayIndex.value = null;
    }

    function updateDayOfWeek(day: EditableTrainingDay, selectedDays: number[]) {
      if (selectedDays.length > 0) {
        const newDayOfWeek = selectedDays[0];
        
        // Verifica se o dia já está sendo usado por outro training day
        const conflictingDay = editableTrainingDays.value.find(
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

    function cancel() {
      visible.value = false;
    }

    function confirmSave() {
      Modal.confirm({
        title: "Confirmar alterações",
        content:
          "Depois de editado, não será possível voltar atrás. Deseja continuar?",
        okText: "Sim, salvar",
        cancelText: "Cancelar",
        onOk: save,
      });
    }

    async function save() {
      saving.value = true;
      try {
        // Helper function to remove __typename from objects
        const removeTypename = (obj: any): any => {
          if (Array.isArray(obj)) {
            return obj.map(removeTypename);
          } else if (obj !== null && typeof obj === "object") {
            const { __typename, ...rest } = obj;
            return Object.keys(rest).reduce((acc, key) => {
              acc[key] = removeTypename(rest[key]);
              return acc;
            }, {} as any);
          }
          return obj;
        };

        // Create diff between original and current data
        const originalData = removeTypename(props.workout.trainingDays);
        const currentData = editableTrainingDays.value.map((day) => ({
          ...(day.id && { id: day.id }),
          name: day.name,
          order: day.order,
          dayOfWeek: day.dayOfWeek,
          exercises: day.exercises.map((ex) => ({
            exerciseId: ex.exerciseId,
            order: ex.order,
            repSchemes: removeTypename(ex.repSchemes),
            restIntervals: removeTypename(ex.restIntervals),
          })),
        }));

        const input: UpdateWorkoutExercisesInput = {
          workoutId: props.workout.id,
          trainingDays: currentData,
        };

        await updateWorkoutExercises({ input });
        message.success("Treino atualizado com sucesso!");
        emit("saved");
        visible.value = false;
      } catch (error: any) {
        console.error("Error updating workout:", error);
        message.error(error.message || "Erro ao atualizar treino");
      } finally {
        saving.value = false;
      }
    }

    return {
      visible,
      activeTab,
      editableTrainingDays,
      editingCell,
      saving,
      columns,
      exerciseOptions,
      getExerciseName,
      editCell,
      saveCell,
      updateSetsField,
      updateRepsField,
      updateRestField,
      addExercise,
      removeExercise,
      moveExercise,
      onDragStartTrainingDay,
      onDropTrainingDay,
      updateDayOfWeek,
      cancel,
      confirmSave,
    };
  },
});
</script>

<style scoped>
.workout-edit-container {
  max-height: 70vh;
  overflow-y: auto;
}

.editable-cell {
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.editable-cell:hover {
  background-color: #f0f0f0;
}

.day-header {
  display: flex;
  align-items: center;
  gap: 1rem;
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
