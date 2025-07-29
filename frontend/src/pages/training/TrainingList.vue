<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Treinos dos Clientes</h1>
        <p class="text-gray-600">
          Visualize todos os treinos ativos dos seus clientes
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center py-12">
        <a-spin size="large" />
      </div>

      <!-- Content -->
      <div v-else>
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
              <div class="bg-blue-100 p-3 rounded-full">
                <team-outlined class="text-2xl text-blue-600" />
              </div>
              <div class="ml-4">
                <p class="text-gray-500 text-sm">Total de Clientes</p>
                <p class="text-2xl font-bold text-gray-900">{{ totalClients }}</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
              <div class="bg-green-100 p-3 rounded-full">
                <play-circle-outlined class="text-2xl text-green-600" />
              </div>
              <div class="ml-4">
                <p class="text-gray-500 text-sm">Treinos Ativos</p>
                <p class="text-2xl font-bold text-gray-900">{{ activeWorkouts }}</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
              <div class="bg-orange-100 p-3 rounded-full">
                <pause-circle-outlined class="text-2xl text-orange-600" />
              </div>
              <div class="ml-4">
                <p class="text-gray-500 text-sm">Sem Treino</p>
                <p class="text-2xl font-bold text-gray-900">{{ clientsWithoutWorkout }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Workouts Grid -->
        <div v-if="workoutsList.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="workout in workoutsList" 
            :key="workout.id"
            class="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
            @click="navigateToWorkout(workout.clientId, workout.id)"
          >
            <!-- Card Header -->
            <div class="p-6 border-b border-gray-200">
              <div class="flex items-center justify-between mb-4">
                <div class="bg-blue-100 p-3 rounded-full">
                  <schedule-outlined class="text-2xl text-blue-600" />
                </div>
                <a-tag :color="workout.isActive ? 'green' : 'gray'">
                  {{ workout.isActive ? 'Ativo' : 'Inativo' }}
                </a-tag>
              </div>
              
              <h3 class="text-xl font-bold text-gray-900 mb-2">{{ workout.name }}</h3>
              <p class="text-gray-600 text-sm">
                {{ formatDate(workout.weekStart) }} - {{ formatDate(workout.weekEnd) }}
              </p>
            </div>
            
            <!-- Card Body -->
            <div class="p-6">
              <!-- Client Info -->
              <div class="flex items-center gap-3 mb-4">
                <div class="bg-gray-100 p-2 rounded-full">
                  <user-outlined class="text-gray-600" />
                </div>
                <div>
                  <p class="font-medium text-gray-900">{{ workout.clientName }}</p>
                  <p class="text-sm text-gray-500">{{ workout.clientEmail }}</p>
                </div>
              </div>
              
              <!-- Workout Stats -->
              <div class="grid grid-cols-2 gap-4 mb-4">
                <div class="text-center p-3 bg-gray-50 rounded-lg">
                  <p class="text-2xl font-bold text-blue-600">{{ workout.trainingDaysCount }}</p>
                  <p class="text-xs text-gray-500">Dias de Treino</p>
                </div>
                <div class="text-center p-3 bg-gray-50 rounded-lg">
                  <p class="text-2xl font-bold text-green-600">{{ workout.totalExercises }}</p>
                  <p class="text-xs text-gray-500">Exercícios</p>
                </div>
              </div>
              
              <!-- Training Days Preview -->
              <div v-if="workout.trainingDays.length > 0" class="mb-4">
                <p class="text-sm font-medium text-gray-700 mb-2">Dias de Treino:</p>
                <div class="flex flex-wrap gap-1">
                  <a-tag 
                    v-for="day in workout.trainingDays.slice(0, 3)" 
                    :key="day.id"
                    color="blue"
                    size="small"
                  >
                    {{ day.name }}
                  </a-tag>
                  <a-tag v-if="workout.trainingDays.length > 3" color="gray" size="small">
                    +{{ workout.trainingDays.length - 3 }} mais
                  </a-tag>
                </div>
              </div>
            </div>
            
            <!-- Card Footer -->
            <div class="px-6 pb-6">
              <a-button type="primary" block>
                Ver Treino Completo
                <arrow-right-outlined />
              </a-button>
            </div>
          </div>
        </div>
        
        <!-- Empty State -->
        <div v-else class="bg-white rounded-lg shadow">
          <div class="py-12 text-center">
            <div class="bg-gray-100 p-6 rounded-full inline-flex mb-4">
              <schedule-outlined class="text-4xl text-gray-400" />
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">Nenhum treino encontrado</h3>
            <p class="text-gray-600">
              Seus clientes ainda não possuem treinos atribuídos.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import {
  TeamOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  UserOutlined,
  ArrowRightOutlined,
  ScheduleOutlined,
} from "@ant-design/icons-vue";
import { useUsers } from "@/composables/useUsers";

interface WorkoutItem {
  id: string;
  name: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  weekStart: string;
  weekEnd: string;
  isActive: boolean;
  trainingDaysCount: number;
  totalExercises: number;
  trainingDays: Array<{
    id: string;
    name: string;
    order: number;
  }>;
}

export default defineComponent({
  name: "TrainingList",
  components: {
    TeamOutlined,
    PlayCircleOutlined,
    PauseCircleOutlined,
    UserOutlined,
    ArrowRightOutlined,
    ScheduleOutlined,
  },
  setup() {
    const router = useRouter();
    const { users, userLoading: isLoading, refetch } = useUsers({});
    
    const workoutsList = ref<WorkoutItem[]>([]);

    const totalClients = computed(() => {
      return users.value?.length || 0;
    });

    const activeWorkouts = computed(() => {
      return workoutsList.value.filter(w => w.isActive).length;
    });

    const clientsWithoutWorkout = computed(() => {
      const clientsWithWorkouts = new Set(workoutsList.value.map(w => w.clientId));
      return totalClients.value - clientsWithWorkouts.size;
    });

    const processWorkouts = () => {
      if (!users.value) return;
      
      const workouts: WorkoutItem[] = [];
      
      users.value.forEach(user => {
        if (user.workouts && user.workouts.length > 0) {
          user.workouts.forEach(workout => {
            // Calculate total exercises across all training days
            const totalExercises = workout.trainingDays?.reduce((total, day) => {
              return total + (day.trainingDayExercises?.length || 0);
            }, 0) || 0;

            // Prepare training days data
            const trainingDays = workout.trainingDays?.map(day => ({
              id: day.id,
              name: day.name,
              order: day.order || 0,
            })).sort((a, b) => a.order - b.order) || [];

            workouts.push({
              id: workout.id,
              name: workout.name,
              clientId: user.id,
              clientName: user.name,
              clientEmail: user.email,
              weekStart: workout.weekStart,
              weekEnd: workout.weekEnd,
              isActive: workout.isActive || false,
              trainingDaysCount: workout.trainingDays?.length || 0,
              totalExercises,
              trainingDays,
            });
          });
        }
      });
      
      // Sort by active status first, then by client name
      workouts.sort((a, b) => {
        if (a.isActive === b.isActive) {
          return a.clientName.localeCompare(b.clientName);
        }
        return a.isActive ? -1 : 1;
      });
      
      workoutsList.value = workouts;
    };

    const formatDate = (dateValue: any) => {
      if (!dateValue) return '';
      const date = new Date(dateValue);
      return date.toLocaleDateString('pt-BR');
    };

    const navigateToWorkout = (clientId: string, workoutId: string) => {
      router.push({
        name: 'ClientView',
        params: { clientId }
      });
    };

    onMounted(async () => {
      await refetch();
      processWorkouts();
    });

    // Watch for changes in users data
    computed(() => {
      if (users.value) {
        processWorkouts();
      }
    });

    return {
      isLoading,
      workoutsList,
      totalClients,
      activeWorkouts,
      clientsWithoutWorkout,
      formatDate,
      navigateToWorkout,
    };
  },
});
</script>