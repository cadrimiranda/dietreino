<template>
  <div class="workout-history-dashboard">
    <!-- Header -->
    <div class="dashboard-header">
      <h1 class="dashboard-title">Histórico de Treinos</h1>
      <div class="header-actions">
        <button 
          class="view-toggle-btn"
          @click="toggleView"
        >
          {{ viewMode === 'exercises' ? 'Ver Por Treino' : 'Ver Por Exercício' }}
        </button>
        <button 
          class="export-btn"
          @click="exportData"
          :disabled="!hasData"
        >
          Exportar
        </button>
      </div>
    </div>

    <!-- Filters -->
    <WorkoutHistoryFilters
      v-model:filters="filters"
      :users="users"
      :workouts="workouts"
      :available-exercises="availableExercises"
      :show-user-filter="isTrainer"
    />

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Carregando histórico...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <h3>Erro ao carregar dados</h3>
      <p>{{ error.message }}</p>
      <button @click="refetch" class="retry-btn">Tentar Novamente</button>
    </div>

    <!-- No Data State -->
    <div v-else-if="!hasData" class="no-data-state">
      <div class="no-data-icon">📊</div>
      <h3>Nenhum histórico encontrado</h3>
      <p>Não há dados de treino para os filtros selecionados.</p>
    </div>

    <!-- Dashboard Content -->
    <div v-else class="dashboard-content">
      <!-- Summary Stats -->
      <div class="summary-stats">
        <div class="stat-card">
          <div class="stat-icon">🏋️</div>
          <div class="stat-content">
            <div class="stat-value">{{ workoutAnalytics.totalWorkouts }}</div>
            <div class="stat-label">Treinos Realizados</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⏱️</div>
          <div class="stat-content">
            <div class="stat-value">{{ formatDuration(workoutAnalytics.averageDuration) }}</div>
            <div class="stat-label">Duração Média</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📈</div>
          <div class="stat-content">
            <div class="stat-value">{{ workoutAnalytics.weeklyFrequency.toFixed(1) }}</div>
            <div class="stat-label">Treinos/Semana</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">💪</div>
          <div class="stat-content">
            <div class="stat-value">{{ exerciseAnalytics.length }}</div>
            <div class="stat-label">Exercícios Únicos</div>
          </div>
        </div>
      </div>

      <!-- Exercise View -->
      <div v-if="viewMode === 'exercises'" class="exercises-view">
        <div class="view-header">
          <h2>Evolução por Exercício</h2>
          <div class="exercise-filters">
            <input
              v-model="exerciseSearch"
              type="text"
              placeholder="Buscar exercício..."
              class="exercise-search"
            />
            <select v-model="exerciseSortBy" class="exercise-sort">
              <option value="name">Nome</option>
              <option value="sessions">Número de Sessões</option>
              <option value="volume">Volume Total</option>
              <option value="maxWeight">Peso Máximo</option>
            </select>
          </div>
        </div>

        <div class="exercises-grid">
          <ExerciseProgressChart
            v-for="exercise in filteredExerciseProgress"
            :key="exercise.exerciseId"
            :exercise-data="exercise"
          />
        </div>

        <div v-if="filteredExerciseProgress.length === 0" class="no-exercises">
          <p>Nenhum exercício encontrado com os filtros aplicados.</p>
        </div>
      </div>

      <!-- Workout View -->
      <div v-if="viewMode === 'workouts'" class="workouts-view">
        <div class="view-header">
          <h2>Histórico de Treinos</h2>
          <div class="workout-filters">
            <select v-model="workoutSortBy" class="workout-sort">
              <option value="date">Data (Mais Recente)</option>
              <option value="duration">Duração</option>
              <option value="volume">Volume Total</option>
            </select>
          </div>
        </div>

        <div class="workouts-timeline">
          <div
            v-for="workout in sortedWorkoutHistories"
            :key="workout.id"
            class="workout-card"
            @click="toggleWorkoutDetails(workout.id)"
          >
            <div class="workout-header">
              <div class="workout-info">
                <h3 class="workout-name">{{ workout.workoutName }}</h3>
                <p class="workout-date">{{ formatDate(workout.executedAt) }}</p>
                <p class="workout-day">{{ workout.trainingDayName }}</p>
              </div>
              <div class="workout-stats">
                <div class="workout-stat">
                  <span class="stat-value">{{ workout.durationMinutes || 0 }}</span>
                  <span class="stat-unit">min</span>
                </div>
                <div class="workout-stat">
                  <span class="stat-value">{{ getWorkoutVolume(workout) }}</span>
                  <span class="stat-unit">kg</span>
                </div>
              </div>
              <div class="workout-toggle">
                <span :class="['toggle-icon', { expanded: expandedWorkouts.has(workout.id) }]">
                  ▼
                </span>
              </div>
            </div>

            <div v-if="expandedWorkouts.has(workout.id)" class="workout-details">
              <div class="workout-exercises">
                <div
                  v-for="exercise in workout.workoutHistoryExercises"
                  :key="exercise.id"
                  class="exercise-detail"
                >
                  <div class="exercise-header">
                    <h4 class="exercise-name">{{ exercise.exerciseName }}</h4>
                    <span class="exercise-sets">
                      {{ exercise.completedSets }}/{{ exercise.plannedSets }} séries
                    </span>
                  </div>
                  <div class="exercise-sets">
                    <div
                      v-for="set in exercise.workoutHistoryExerciseSets"
                      :key="set.id"
                      :class="['set-chip', { completed: set.isCompleted, failed: set.isFailure }]"
                    >
                      {{ set.weight || 0 }}kg × {{ set.reps }}
                    </div>
                  </div>
                  <div v-if="exercise.notes" class="exercise-notes">
                    <p>{{ exercise.notes }}</p>
                  </div>
                </div>
              </div>
              <div v-if="workout.notes" class="workout-notes">
                <h5>Observações do Treino:</h5>
                <p>{{ workout.notes }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useWorkoutHistory } from '@/composables/useWorkoutHistory';
import WorkoutHistoryFilters from './WorkoutHistoryFilters.vue';
import ExerciseProgressChart from './ExerciseProgressChart.vue';
import type { WorkoutHistoryFilters as WorkoutHistoryFiltersType, WorkoutHistoryType } from '@/types/workoutHistory';

interface User {
  id: string;
  name: string;
}

interface Workout {
  id: string;
  name: string;
}

interface Exercise {
  id: string;
  name: string;
}

interface Props {
  users?: User[];
  workouts?: Workout[];
  availableExercises?: Exercise[];
  isTrainer?: boolean;
  defaultFilters?: WorkoutHistoryFiltersType;
  userId?: string;
  preSelectedWorkoutId?: string;
}

const props = withDefaults(defineProps<Props>(), {
  users: () => [],
  workouts: () => [],
  availableExercises: () => [],
  isTrainer: false,
  defaultFilters: () => ({})
});

// Initialize filters with userId and preSelectedWorkoutId
const initFilters = (): WorkoutHistoryFiltersType => {
  const baseFilters = { ...props.defaultFilters };
  
  if (props.userId) {
    baseFilters.userId = props.userId;
  }
  
  if (props.preSelectedWorkoutId) {
    baseFilters.workoutId = props.preSelectedWorkoutId;
  }
  
  return baseFilters;
};

const filters = ref<WorkoutHistoryFiltersType>(initFilters());
const viewMode = ref<'exercises' | 'workouts'>('exercises');
const exerciseSearch = ref('');
const exerciseSortBy = ref<'name' | 'sessions' | 'volume' | 'maxWeight'>('sessions');
const workoutSortBy = ref<'date' | 'duration' | 'volume'>('date');
const expandedWorkouts = ref<Set<string>>(new Set());

const {
  workoutHistories,
  exerciseProgressData,
  exerciseAnalytics,
  workoutAnalytics,
  loading,
  error,
  refetch
} = useWorkoutHistory(filters);

const hasData = computed(() => workoutHistories.value.length > 0);

const filteredExerciseProgress = computed(() => {
  let filtered = [...exerciseProgressData.value];

  // Filter by search term
  if (exerciseSearch.value) {
    const search = exerciseSearch.value.toLowerCase();
    filtered = filtered.filter(exercise => 
      exercise.exerciseName.toLowerCase().includes(search)
    );
  }

  // Sort exercises
  filtered.sort((a, b) => {
    switch (exerciseSortBy.value) {
      case 'name':
        return a.exerciseName.localeCompare(b.exerciseName);
      case 'sessions':
        return b.sessions.length - a.sessions.length;
      case 'volume':
        const aVolume = a.sessions.reduce((sum, s) => sum + s.totalVolume, 0);
        const bVolume = b.sessions.reduce((sum, s) => sum + s.totalVolume, 0);
        return bVolume - aVolume;
      case 'maxWeight':
        const aMaxWeight = Math.max(...a.sessions.flatMap(s => s.sets.map(set => set.weight || 0)));
        const bMaxWeight = Math.max(...b.sessions.flatMap(s => s.sets.map(set => set.weight || 0)));
        return bMaxWeight - aMaxWeight;
      default:
        return 0;
    }
  });

  return filtered;
});

const sortedWorkoutHistories = computed(() => {
  const sorted = [...workoutHistories.value];

  sorted.sort((a, b) => {
    switch (workoutSortBy.value) {
      case 'date':
        return new Date(b.executedAt).getTime() - new Date(a.executedAt).getTime();
      case 'duration':
        return (b.durationMinutes || 0) - (a.durationMinutes || 0);
      case 'volume':
        return getWorkoutVolume(b) - getWorkoutVolume(a);
      default:
        return 0;
    }
  });

  return sorted;
});

function toggleView() {
  viewMode.value = viewMode.value === 'exercises' ? 'workouts' : 'exercises';
}

function toggleWorkoutDetails(workoutId: string) {
  if (expandedWorkouts.value.has(workoutId)) {
    expandedWorkouts.value.delete(workoutId);
  } else {
    expandedWorkouts.value.add(workoutId);
  }
}

function getWorkoutVolume(workout: WorkoutHistoryType): number {
  return workout.workoutHistoryExercises.reduce((total, exercise) => {
    return total + exercise.workoutHistoryExerciseSets.reduce((exerciseTotal, set) => {
      return exerciseTotal + ((set.weight || 0) * set.reps);
    }, 0);
  }, 0);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${Math.round(minutes)}min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);
  return `${hours}h${remainingMinutes > 0 ? remainingMinutes + 'min' : ''}`;
}

function exportData() {
  // TODO: Implement data export functionality
  console.log('Exporting data...', {
    workoutHistories: workoutHistories.value,
    exerciseAnalytics: exerciseAnalytics.value,
    workoutAnalytics: workoutAnalytics.value
  });
}

// Watch for filter changes and clear expanded workouts
watch(filters, () => {
  expandedWorkouts.value.clear();
}, { deep: true });
</script>

<style scoped>
.workout-history-dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.dashboard-title {
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.view-toggle-btn,
.export-btn {
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  color: #374151;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.view-toggle-btn:hover,
.export-btn:enabled:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.export-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading-state,
.error-state,
.no-data-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon,
.no-data-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.retry-btn {
  padding: 8px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 16px;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 32px;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  display: block;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.view-header h2 {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.exercise-filters,
.workout-filters {
  display: flex;
  gap: 12px;
  align-items: center;
}

.exercise-search,
.exercise-sort,
.workout-sort {
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

.exercises-grid {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.no-exercises {
  text-align: center;
  padding: 48px 24px;
  color: #6b7280;
}

.workouts-timeline {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.workout-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
  cursor: pointer;
}

.workout-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.workout-header {
  display: flex;
  align-items: center;
  padding: 20px;
  gap: 16px;
}

.workout-info {
  flex: 1;
}

.workout-name {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 4px 0;
}

.workout-date,
.workout-day {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.workout-stats {
  display: flex;
  gap: 20px;
}

.workout-stat {
  text-align: center;
}

.workout-stat .stat-value {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  display: block;
}

.workout-stat .stat-unit {
  font-size: 12px;
  color: #6b7280;
}

.workout-toggle {
  padding: 8px;
}

.toggle-icon {
  font-size: 12px;
  color: #6b7280;
  transition: transform 0.2s;
}

.toggle-icon.expanded {
  transform: rotate(180deg);
}

.workout-details {
  border-top: 1px solid #e5e7eb;
  padding: 20px;
}

.workout-exercises {
  margin-bottom: 16px;
}

.exercise-detail {
  margin-bottom: 16px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
}

.exercise-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.exercise-name {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.exercise-sets {
  font-size: 12px;
  color: #6b7280;
}

.exercise-sets {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.set-chip {
  padding: 4px 8px;
  background: #e5e7eb;
  border-radius: 12px;
  font-size: 12px;
  color: #374151;
}

.set-chip.completed {
  background: #dcfce7;
  color: #166534;
}

.set-chip.failed {
  background: #fef2f2;
  color: #dc2626;
}

.exercise-notes,
.workout-notes {
  margin-top: 8px;
}

.exercise-notes p,
.workout-notes p {
  font-size: 14px;
  color: #4b5563;
  margin: 4px 0 0 0;
}

.workout-notes h5 {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 4px 0;
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .header-actions {
    justify-content: center;
  }

  .summary-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .view-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .exercise-filters,
  .workout-filters {
    justify-content: center;
  }

  .workout-header {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }

  .workout-stats {
    justify-content: center;
  }
}
</style>