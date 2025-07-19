<template>
  <div class="w-full p-6">
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold">Treino do Cliente</h1>
        <p class="text-gray-600" v-if="hasWorkout">
          {{ workout.name }} - {{ formatDate(workout.weekStart) }} - {{
            formatDate(workout.weekEnd)
          }}
        </p>
      </div>
      <div class="flex space-x-3">
        <a-button @click="$router.push('/clients')">
          Voltar para Clientes
        </a-button>
        <a-button @click="showHistoryView" v-if="hasWorkout">
          <history-outlined /> Histórico
        </a-button>
        <a-button @click="editWorkout" v-if="hasWorkout && !workout.startedAt">
          <edit-outlined /> Editar Treino
        </a-button>
        <a-button type="primary" @click="createNewWorkout">
          <plus-outlined /> Novo Treino
        </a-button>
      </div>
    </div>

    <div v-if="!isLoading">
      <div class="bg-white rounded-lg shadow mb-6">
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
              <a-tab-pane key="history" tab="Histórico">
                <WorkoutHistoryDashboard
                  :userId="userId"
                  :preSelectedWorkoutId="workout.id"
                />
              </a-tab-pane>
            </a-tabs>
          </div>
          <EmptyWorkoutState
            v-else
            :clientId="userId"
            @file-upload="handleFileChange"
          />
        </div>
      </div>
    </div>

    <div v-else class="flex justify-center py-12">
      <a-spin size="large" />
    </div>

    <!-- Edit Workout Dialog -->
    <WorkoutEditDialog
      v-model="showEditDialog"
      :workout="workoutData"
      @saved="handleWorkoutSaved"
    />

    <!-- New Workout Confirmation Dialog -->
    <a-modal
      v-model:visible="showNewWorkoutDialog"
      title="Criar Novo Treino"
      :footer="null"
    >
      <div class="text-center">
        <p class="mb-6">Você já possui um treino ativo. Como deseja criar o novo treino?</p>
        <div class="flex gap-4 justify-center">
          <a-button 
            type="default" 
            @click="() => { 
              console.log('Iniciar do Zero - navigating to NewWorkout');
              showNewWorkoutDialog = false; 
              router.push({ 
                name: 'NewWorkout', 
                params: { clientId: userId } 
              }).then(() => {
                console.log('Navigation successful from dialog');
              }).catch((error) => {
                console.error('Navigation failed from dialog:', error);
              });
            }"
          >
            Iniciar do Zero
          </a-button>
          <a-button 
            type="primary" 
            @click="() => { 
              console.log('Copiar Treino - navigating to NewWorkout with copy');
              showNewWorkoutDialog = false; 
              router.push({ 
                name: 'NewWorkout', 
                params: { clientId: userId },
                query: { copy: 'true' }
              }).then(() => {
                console.log('Copy navigation successful from dialog');
              }).catch((error) => {
                console.error('Copy navigation failed from dialog:', error);
              });
            }"
          >
            Copiar Treino Atual
          </a-button>
        </div>
      </div>
    </a-modal>

  </div>
</template>

<script lang="ts">
import { ref, reactive, defineComponent, watch, computed } from "vue";
import {
  UserOutlined,
  EditOutlined,
  PlusOutlined,
  HistoryOutlined,
} from "@ant-design/icons-vue";
import { message } from "ant-design-vue";
import { IUserEntity, useUsers } from "@/composables/useUsers";
import { useRoute, useRouter } from "vue-router";
import EmptyWorkoutState from "./ClientEmptyWorkout.vue";
import WorkoutEditDialog from "@/components/WorkoutEditDialog.vue";
import WorkoutHistoryDashboard from "@/components/workout-history/WorkoutHistoryDashboard.vue";
import { useProcessWorkout } from "./useProcessWorkout";

export default defineComponent({
  name: "ClientWorkoutDetails",
  components: {
    UserOutlined,
    EditOutlined,
    PlusOutlined,
    HistoryOutlined,
    EmptyWorkoutState,
    WorkoutEditDialog,
    WorkoutHistoryDashboard,
  },
  setup() {
    const { processWorkout, loading } = useProcessWorkout();
    const route = useRoute();
    const router = useRouter();
    const userId = route.params.clientId as string;
    const workoutId = route.params.workoutId as string | undefined;
    const {
      user,
      userLoading: isLoading,
      refetch: refetchUser,
    } = useUsers({ userId });

    function handleFileChange(event: Event) {
      const target = event.target as HTMLInputElement;
      if (!target.files) return;

      const endDate = new Date();
      endDate.setFullYear(2025, 11, 11);
      processWorkout({
        input: {
          file: target.files[0],
          userId,
          weekStart: new Date().toISOString(),
          weekEnd: endDate.toISOString(),
          workoutName: "Treino de Força",
          workoutId: workoutId || undefined,
        },
      });
    }

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
      startedAt: null as Date | null,
    });

    interface WorkoutSheet {
      title: string;
      exercises: Array<{
        name: string;
        sets: string | number;
        reps: string;
        rest: string;
        order: number;
      }>;
    }
    const workoutSheets = ref<WorkoutSheet[]>([]);
    const hasWorkout = ref(false);
    const showEditDialog = ref(false);
    const showNewWorkoutDialog = ref(false);
    const workoutData = ref<any>({});

    // Observe as mudanças em user e atualize client e workouts quando os dados chegarem
    watch(
      user,
      (newUser) => {
        if (newUser?.user) {
          Object.assign(client, newUser.user);

          // Encontrar o workout específico pelo ID
          const foundWorkout = newUser.user.workouts?.find(
            (w) => w.id === workoutId || w.isActive
          );

          if (foundWorkout) {
            hasWorkout.value = true;
            // Atualizar dados do workout
            workout.id = foundWorkout.id;
            workout.name = foundWorkout.name;
            workout.weekStart = foundWorkout.weekStart;
            workout.weekEnd = foundWorkout.weekEnd;
            workout.isActive = foundWorkout.isActive || true;

            // Store complete workout data for editing
            workoutData.value = foundWorkout;
            
            // Sort training days by order first
            const sortedTrainingDays = [...(foundWorkout.trainingDays || [])].sort(
              (a, b) => (a.order || 0) - (b.order || 0)
            );

            const exercisesMap = new Map();

            sortedTrainingDays.forEach((trainingDay) => {
              // Sort exercises within each training day by order
              const sortedExercises = [...(trainingDay.trainingDayExercises || [])].sort(
                (a, b) => (a.order || 0) - (b.order || 0)
              );

              sortedExercises.forEach((trainingDayExercise) => {
                const exercise = trainingDayExercise.exercise;
                const repSchemes = trainingDayExercise.repSchemes || [];
                const restIntervals = trainingDayExercise.restIntervals || [];

                // Formatar as repetições
                let repsFormatted = "";
                if (repSchemes.length > 0) {
                  repsFormatted =
                    repSchemes.length > 1
                      ? repSchemes
                          .map(
                            (scheme) =>
                              `${scheme.sets}x ${scheme.minReps}-${scheme.maxReps}`
                          )
                          .join(", ")
                      : `${repSchemes[0].minReps}-${repSchemes[0].maxReps}`;
                }

                const restFormatted = restIntervals.reduce(
                  (acc, interval) => {
                    if (acc) {
                      return `${acc} - ${interval.intervalTime}s`;
                    }
                    return `${interval.intervalTime}s`;
                  },
                  ""
                );
                const sheetTitle = trainingDay.name;

                if (!exercisesMap.has(sheetTitle)) {
                  exercisesMap.set(sheetTitle, []);
                }

                exercisesMap.get(sheetTitle).push({
                  name: exercise?.name,
                  sets: repSchemes.reduce((acc, next) => acc + next.sets, 0),
                  reps: repsFormatted || "-",
                  rest: restFormatted || "-",
                  order: trainingDayExercise.order || 0,
                });
              });
            });

            // Convert to array and maintain the order from sorted training days
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


    const editWorkout = () => {
      showEditDialog.value = true;
    };

    const handleWorkoutSaved = async () => {
      // Refresh user data to get updated workout
      await refetchUser();
    };

    const formatDate = (dateValue: any) => {
      if (!dateValue) return '';
      const date = new Date(dateValue);
      return date.toLocaleDateString('pt-BR');
    };

    const createNewWorkout = () => {
      console.log('createNewWorkout called');
      console.log('userId:', userId);
      console.log('hasWorkout:', hasWorkout.value);
      console.log('workout.isActive:', workout.isActive);
      console.log('Current route:', route.fullPath);
      
      if (hasWorkout.value && workout.isActive) {
        console.log('Opening dialog');
        showNewWorkoutDialog.value = true;
      } else {
        console.log('Navigating to NewWorkout with userId:', userId);
        router.push({ 
          name: 'NewWorkout', 
          params: { clientId: userId } 
        }).then(() => {
          console.log('Navigation successful');
        }).catch((error) => {
          console.error('Navigation failed:', error);
        });
      }
    };

    const showHistoryView = () => {
      router.push({
        name: 'ClientWorkoutHistory',
        params: {
          clientId: userId,
          workoutId: workout.id
        }
      });
    };

    return {
      client,
      workout,
      workoutSheets,
      hasWorkout,
      isLoading,
      userId,
      handleFileChange,
      showEditDialog,
      showNewWorkoutDialog,
      workoutData,
      editWorkout,
      handleWorkoutSaved,
      formatDate,
      createNewWorkout,
      showHistoryView,
      router,
    };
  },
});
</script>
