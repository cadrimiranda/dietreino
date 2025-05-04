<template>
  <div class="w-full p-6">
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold">Treino do Cliente</h1>
        <p class="text-gray-600" v-if="hasWorkout">
          {{ workout.name }} - Semana {{ workout.weekStart }}-{{
            workout.weekEnd
          }}
        </p>
      </div>
      <div class="flex space-x-3">
        <a-button @click="$router.push('/clients')">
          Voltar para Clientes
        </a-button>
        <a-button type="primary" @click="printWorkout" v-if="hasWorkout">
          <printer-outlined /> Imprimir
        </a-button>
      </div>
    </div>

    <div v-if="!isLoading">
      <div class="bg-white rounded-lg shadow mb-6" ref="printArea">
        <div class="p-6">
          <div class="flex items-center mb-6">
            <div class="bg-blue-100 p-3 rounded-full mr-4">
              <user-outlined class="text-2xl text-blue-600" />
            </div>
            <div>
              <h2 class="text-xl font-semibold">{{ client.name }}</h2>
              <p class="text-gray-600">{{ client.email }}</p>
            </div>
            <div class="ml-auto">
              <a-tag color="green" v-if="workout.isActive">Ativo</a-tag>
              <a-tag color="gray" v-else>Inativo</a-tag>
            </div>
          </div>

          <div v-if="workoutSheets.length">
            <a-tabs>
              <a-tab-pane
                v-for="(sheet, index) in workoutSheets"
                :key="index"
                :tab="sheet.title"
              >
                <table class="min-w-full border-collapse">
                  <thead>
                    <tr class="bg-gray-100">
                      <th class="p-3 border text-left">Exercício</th>
                      <th class="p-3 border text-center w-24">Série</th>
                      <th class="p-3 border text-center w-40">Repetição</th>
                      <th class="p-3 border text-center w-32">Descanso</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(exercise, exIndex) in sheet.exercises"
                      :key="exIndex"
                      class="hover:bg-gray-50"
                    >
                      <td class="p-3 border font-medium">
                        {{ exercise.name }}
                      </td>
                      <td class="p-3 border text-center">
                        {{ exercise.sets }}
                      </td>
                      <td class="p-3 border text-center">
                        {{ exercise.reps }}
                      </td>
                      <td class="p-3 border text-center">
                        {{ exercise.rest }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </a-tab-pane>
            </a-tabs>
          </div>
          <EmptyWorkoutState v-else :clientId="userId" />
        </div>
      </div>
    </div>

    <div v-else class="flex justify-center py-12">
      <a-spin size="large" />
    </div>
  </div>
</template>

<script lang="ts">
import { ref, reactive, defineComponent, watch, computed } from "vue";
import { UserOutlined, PrinterOutlined } from "@ant-design/icons-vue";
import { message } from "ant-design-vue";
import { IUserEntity, useUsers } from "@/composables/useUsers";
import { useRoute } from "vue-router";
import EmptyWorkoutState from "./ClientEmptyWorkout.vue";

export default defineComponent({
  name: "ClientWorkoutDetails",
  components: {
    UserOutlined,
    PrinterOutlined,
    EmptyWorkoutState,
  },
  setup() {
    const route = useRoute();
    const userId = route.params.clientId as string;
    const workoutId = route.params.workoutId as string;
    const { user, userLoading: isLoading } = useUsers({ userId });

    const client = reactive<IUserEntity>({
      id: "",
      name: "",
      email: "",
      phone: "",
      createdAt: "",
      updatedAt: "",
    });

    const workout = reactive({
      id: "",
      name: "Treino de Força",
      weekStart: 1,
      weekEnd: 5,
      isActive: true,
    });

    interface WorkoutSheet {
      title: string;
      exercises: Array<{
        name: string;
        sets: string | number;
        reps: string;
        rest: string;
      }>;
    }
    const workoutSheets = ref<WorkoutSheet[]>([]);
    const hasWorkout = ref(false);

    // Observe as mudanças em user e atualize client e workouts quando os dados chegarem
    watch(
      user,
      (newUser) => {
        if (newUser?.user) {
          Object.assign(client, newUser.user);

          // Encontrar o workout específico pelo ID
          const foundWorkout = newUser.user.workouts?.find(
            (w) => w.id === workoutId
          );

          if (foundWorkout) {
            hasWorkout.value = true;
            // Atualizar dados do workout
            workout.id = foundWorkout.id;
            workout.name = foundWorkout.name;
            workout.weekStart = foundWorkout.weekStart;
            workout.weekEnd = foundWorkout.weekEnd;
            workout.isActive = foundWorkout.isActive || true;
            const exercisesMap = new Map();

            foundWorkout.workoutExercises?.forEach((workoutExercise) => {
              const exercise = workoutExercise.exercise;
              const repSchemes = workoutExercise.repSchemes || [];
              const restIntervals = workoutExercise.restIntervals || [];

              // Formatar as repetições
              let repsFormatted = "";
              if (repSchemes.length > 0) {
                repsFormatted = repSchemes
                  .map((scheme) => `${scheme.min_reps}-${scheme.max_reps}`)
                  .join(", ");
              }

              // Formatar o descanso
              let restFormatted = "";
              if (restIntervals.length > 0) {
                // Assumindo que queremos apenas o primeiro intervalo
                restFormatted = `${restIntervals[0].interval_time}s`;
              }

              // Determinar a folha (aqui estamos usando uma lógica simples - ajuste conforme necessário)
              // Neste exemplo, estamos criando uma única folha "Treino Completo"
              const sheetTitle = "Treino Completo";

              if (!exercisesMap.has(sheetTitle)) {
                exercisesMap.set(sheetTitle, []);
              }

              exercisesMap.get(sheetTitle).push({
                name: exercise?.name,
                sets: repSchemes.length > 0 ? repSchemes[0].sets : "-",
                reps: repsFormatted || "-",
                rest: restFormatted || "-",
              });
            });

            workoutSheets.value = Array.from(exercisesMap.entries()).map(
              ([title, exercises]) => ({
                title,
                exercises,
              })
            );
          } else {
            hasWorkout.value = false;
          }
        }
      },
      { immediate: true }
    );

    const printArea = ref(null);

    // Função para imprimir o treino em PDF
    const printWorkout = () => {
      const element = printArea.value;
      const opt = {
        margin: 10,
        filename: `treino-${client.name
          ?.toLowerCase()
          .replace(/\s+/g, "-")}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };

      message.loading({ content: "Gerando PDF...", key: "pdf" });
    };

    return {
      client,
      workout,
      workoutSheets,
      printArea,
      printWorkout,
      hasWorkout,
      isLoading,
      userId,
    };
  },
});
</script>
