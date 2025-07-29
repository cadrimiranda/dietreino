<!-- Dashboard.vue -->
<template>
  <div class="max-w-7xl mx-auto">
    <!-- Welcome section -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">
        Bem-vindo de volta, {{ currentUser?.name || 'Usuário' }}!
      </h1>
      <p class="text-gray-600">
        {{ formattedDate }} — Aqui está o que está acontecendo com seus clientes hoje
      </p>
    </div>

    <!-- Quick stats -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      <!-- Total Clients -->
      <div class="bg-white rounded-lg shadow-sm p-5">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-gray-500 text-sm">Total de Clientes</p>
            <h3 class="text-2xl font-bold mt-1">{{ totalClients }}</h3>
          </div>
          <div class="bg-blue-100 rounded-lg p-2 text-blue-700">
            <i class="fas fa-users"></i>
          </div>
        </div>
        <div class="flex items-center mt-3 text-sm">
          <span class="text-blue-600 flex items-center">
            <i class="fas fa-user-plus mr-1"></i> 
            {{ recentClients }} novos este mês
          </span>
        </div>
      </div>

      <!-- Active Workouts -->
      <div class="bg-white rounded-lg shadow-sm p-5">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-gray-500 text-sm">Treinos Ativos</p>
            <h3 class="text-2xl font-bold mt-1">{{ activeWorkouts }}</h3>
          </div>
          <div class="bg-green-100 rounded-lg p-2 text-green-700">
            <i class="fas fa-dumbbell"></i>
          </div>
        </div>
        <div class="flex items-center mt-3 text-sm">
          <span class="text-green-600 flex items-center">
            <i class="fas fa-check mr-1"></i>
            {{ workoutCompletionRate }}% taxa de conclusão
          </span>
        </div>
      </div>

      <!-- Total Exercises -->
      <div class="bg-white rounded-lg shadow-sm p-5">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-gray-500 text-sm">Total de Exercícios</p>
            <h3 class="text-2xl font-bold mt-1">{{ totalExercises }}</h3>
          </div>
          <div class="bg-purple-100 rounded-lg p-2 text-purple-700">
            <i class="fas fa-list"></i>
          </div>
        </div>
        <div class="flex items-center mt-3 text-sm">
          <span class="text-purple-600 flex items-center">
            <i class="fas fa-calendar mr-1"></i>
            {{ totalTrainingDays }} dias de treino
          </span>
        </div>
      </div>

      <!-- Clients Without Workout -->
      <div class="bg-white rounded-lg shadow-sm p-5">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-gray-500 text-sm">Sem Treino</p>
            <h3 class="text-2xl font-bold mt-1">{{ clientsWithoutWorkout }}</h3>
          </div>
          <div class="bg-orange-100 rounded-lg p-2 text-orange-700">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
        </div>
        <div class="flex items-center mt-3 text-sm">
          <span 
            class="text-orange-600 flex items-center" 
            v-if="clientsWithoutWorkout > 0"
          >
            <i class="fas fa-plus mr-1"></i>
            Precisam de treino
          </span>
          <span class="text-gray-500" v-else>Todos com treino</span>
        </div>
      </div>
    </div>

    <!-- Recent clients and quick actions -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Recent clients -->
      <div class="lg:col-span-2">
        <div class="bg-white rounded-lg shadow-sm p-5">
          <div class="flex justify-between items-center mb-5">
            <h3 class="font-bold text-gray-900">Clientes Recentes</h3>
            <button 
              @click="$router.push('/clients')"
              class="text-blue-600 text-sm hover:text-blue-800"
            >
              Ver Todos
            </button>
          </div>

          <div class="space-y-4">
            <div
              v-for="client in recentClientsList"
              :key="client.id"
              class="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold mr-4">
                    {{ getInitials(client.name) }}
                  </div>
                  <div>
                    <p class="text-gray-900 font-medium">{{ client.name }}</p>
                    <p class="text-gray-500 text-sm">{{ client.email }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-sm text-gray-500">
                    {{ formatDate(client.createdAt) }}
                  </div>
                  <div class="flex items-center mt-1">
                    <span 
                      v-if="client.hasWorkout" 
                      class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                    >
                      <i class="fas fa-dumbbell mr-1"></i>
                      Com treino
                    </span>
                    <span 
                      v-else 
                      class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800"
                    >
                      <i class="fas fa-exclamation-triangle mr-1"></i>
                      Sem treino
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            v-if="recentClientsList.length === 0"
            class="py-4 text-center text-gray-500"
          >
            Nenhum cliente recente para exibir
          </div>
        </div>
      </div>

      <!-- Quick actions -->
      <div class="lg:col-span-1">
        <div class="bg-white rounded-lg shadow-sm p-5">
          <h3 class="font-bold text-gray-900 mb-5">Ações Rápidas</h3>

          <div class="space-y-3">
            <button
              @click="showAddClient"
              class="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition duration-200"
            >
              <div class="bg-blue-100 rounded p-2 mr-3 text-blue-700">
                <i class="fas fa-user-plus"></i>
              </div>
              <span>Adicionar Cliente</span>
            </button>

            <button
              @click="$router.push('/clients')"
              class="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition duration-200"
            >
              <div class="bg-green-100 rounded p-2 mr-3 text-green-700">
                <i class="fas fa-users"></i>
              </div>
              <span>Ver Clientes</span>
            </button>

            <button
              v-if="currentUser?.role === 'TRAINER'"
              @click="$router.push('/training')"
              class="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition duration-200"
            >
              <div class="bg-purple-100 rounded p-2 mr-3 text-purple-700">
                <i class="fas fa-dumbbell"></i>
              </div>
              <span>Ver Treinos</span>
            </button>

            <button
              @click="$router.push('/workout-history')"
              class="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition duration-200"
            >
              <div class="bg-orange-100 rounded p-2 mr-3 text-orange-700">
                <i class="fas fa-chart-line"></i>
              </div>
              <span>Ver Histórico</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Client Dialog -->
    <ClientDialog
      v-model:visible="clientDialogVisible"
      v-model:is-processing="isProcessingClient"
      :is-editing="false"
      :client-to-edit="null"
      @client-saved="handleClientSaved"
    />

  </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted, ref } from "vue";
import { useAuth } from "@/composables/useAuth";
import { useUsers } from "@/composables/useUsers";
import ClientDialog from "@/pages/client/components/ClientDialog.vue";

interface ClientSummary {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  hasWorkout: boolean;
}

export default defineComponent({
  name: "Dashboard",
  components: {
    ClientDialog,
  },
  setup() {
    const auth = useAuth();
    const { users, loading, refetch, upsertUser } = useUsers({});
    
    // Client dialog state
    const clientDialogVisible = ref(false);
    const isProcessingClient = ref(false);

    onMounted(() => {
      refetch();
    });

    const currentUser = computed(() => auth.currentUser.value);

    const totalClients = computed(() => {
      return users.value?.length || 0;
    });

    const recentClients = computed(() => {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      
      return users.value?.filter(user => {
        const createdDate = new Date(user.createdAt);
        return createdDate >= oneMonthAgo;
      }).length || 0;
    });

    const activeWorkouts = computed(() => {
      if (!users.value) return 0;
      
      return users.value.reduce((count, user) => {
        const hasActiveWorkout = user.workouts?.some(workout => workout.isActive);
        return hasActiveWorkout ? count + 1 : count;
      }, 0);
    });

    const totalExercises = computed(() => {
      if (!users.value) return 0;
      
      return users.value.reduce((total, user) => {
        return total + (user.workouts?.reduce((workoutTotal, workout) => {
          return workoutTotal + (workout.trainingDays?.reduce((dayTotal, day) => {
            return dayTotal + (day.trainingDayExercises?.length || 0);
          }, 0) || 0);
        }, 0) || 0);
      }, 0);
    });

    const totalTrainingDays = computed(() => {
      if (!users.value) return 0;
      
      return users.value.reduce((total, user) => {
        return total + (user.workouts?.reduce((workoutTotal, workout) => {
          return workoutTotal + (workout.trainingDays?.length || 0);
        }, 0) || 0);
      }, 0);
    });

    const clientsWithoutWorkout = computed(() => {
      if (!users.value) return 0;
      
      return users.value.filter(user => {
        return !user.workouts || user.workouts.length === 0 || 
               !user.workouts.some(workout => workout.isActive);
      }).length;
    });

    const workoutCompletionRate = computed(() => {
      const total = totalClients.value;
      const withWorkouts = activeWorkouts.value;
      return total > 0 ? Math.round((withWorkouts / total) * 100) : 0;
    });

    const recentClientsList = computed(() => {
      if (!users.value) return [];
      
      return users.value
        .slice()
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
        .map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
          hasWorkout: user.workouts?.some(workout => workout.isActive) || false,
        }));
    });

    const formattedDate = computed(() => {
      const options: Intl.DateTimeFormatOptions = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      return new Date().toLocaleDateString("pt-BR", options);
    });

    const getInitials = (name: string): string => {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);
    };

    const formatDate = (dateString: string): string => {
      const date = new Date(dateString);
      return date.toLocaleDateString("pt-BR");
    };

    const showAddClient = () => {
      clientDialogVisible.value = true;
    };

    const handleClientSaved = async (clientData: any) => {
      try {
        isProcessingClient.value = true;
        await upsertUser(clientData);
        clientDialogVisible.value = false;
        // Refresh the dashboard data
        await refetch();
      } catch (error) {
        console.error('Error saving client:', error);
      } finally {
        isProcessingClient.value = false;
      }
    };

    return {
      currentUser,
      totalClients,
      recentClients,
      activeWorkouts,
      totalExercises,
      totalTrainingDays,
      clientsWithoutWorkout,
      workoutCompletionRate,
      recentClientsList,
      formattedDate,
      getInitials,
      formatDate,
      showAddClient,
      handleClientSaved,
      clientDialogVisible,
      isProcessingClient,
      loading,
    };
  },
});
</script>
