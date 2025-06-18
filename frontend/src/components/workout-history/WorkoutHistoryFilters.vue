<template>
  <div class="workout-history-filters">
    <div class="filters-header">
      <h3 class="filters-title">Filtros</h3>
      <button 
        class="clear-filters-btn"
        @click="clearFilters"
        :disabled="!hasActiveFilters"
      >
        Limpar
      </button>
    </div>

    <div class="filters-grid">
      <!-- User Selection (for trainers) -->
      <div v-if="showUserFilter" class="filter-group">
        <label class="filter-label">Aluno</label>
        <select 
          v-model="localFilters.userId" 
          class="filter-select"
          @change="updateFilters"
        >
          <option value="">Todos os alunos</option>
          <option 
            v-for="user in users" 
            :key="user.id" 
            :value="user.id"
          >
            {{ user.name }}
          </option>
        </select>
      </div>

      <!-- Workout Selection -->
      <div class="filter-group">
        <label class="filter-label">Programa de Treino</label>
        <select 
          v-model="localFilters.workoutId" 
          class="filter-select"
          @change="updateFilters"
        >
          <option value="">Todos os programas</option>
          <option 
            v-for="workout in workouts" 
            :key="workout.id" 
            :value="workout.id"
          >
            {{ workout.name }}
          </option>
        </select>
      </div>

      <!-- Exercise Filter -->
      <div class="filter-group">
        <label class="filter-label">Exercício</label>
        <div class="exercise-filter">
          <input
            v-model="localFilters.exerciseName"
            type="text"
            class="filter-input"
            placeholder="Nome do exercício..."
            @input="updateFilters"
          />
          <select 
            v-if="availableExercises.length > 0"
            v-model="localFilters.exerciseId" 
            class="filter-select"
            @change="updateFilters"
          >
            <option value="">Todos os exercícios</option>
            <option 
              v-for="exercise in availableExercises" 
              :key="exercise.id" 
              :value="exercise.id"
            >
              {{ exercise.name }}
            </option>
          </select>
        </div>
      </div>

      <!-- Date Range -->
      <div class="filter-group">
        <label class="filter-label">Período</label>
        <div class="date-range">
          <input
            v-model="localFilters.dateFrom"
            type="date"
            class="filter-input"
            @change="updateFilters"
          />
          <span class="date-separator">até</span>
          <input
            v-model="localFilters.dateTo"
            type="date"
            class="filter-input"
            @change="updateFilters"
          />
        </div>
      </div>

      <!-- Quick Date Filters -->
      <div class="filter-group">
        <label class="filter-label">Período Rápido</label>
        <div class="quick-filters">
          <button 
            v-for="quick in quickDateFilters" 
            :key="quick.key"
            :class="['quick-filter-btn', { active: activeQuickFilter === quick.key }]"
            @click="applyQuickDateFilter(quick)"
          >
            {{ quick.label }}
          </button>
        </div>
      </div>

      <!-- Results Limit -->
      <div class="filter-group">
        <label class="filter-label">Limite de Resultados</label>
        <select 
          v-model="localFilters.limit" 
          class="filter-select"
          @change="updateFilters"
        >
          <option :value="undefined">Todos</option>
          <option :value="10">10 sessões</option>
          <option :value="25">25 sessões</option>
          <option :value="50">50 sessões</option>
          <option :value="100">100 sessões</option>
        </select>
      </div>
    </div>

    <!-- Active Filters Display -->
    <div v-if="hasActiveFilters" class="active-filters">
      <div class="active-filters-label">Filtros ativos:</div>
      <div class="active-filters-list">
        <span v-if="localFilters.userId" class="filter-tag">
          Aluno: {{ getUserName(localFilters.userId) }}
          <button @click="removeFilter('userId')">×</button>
        </span>
        <span v-if="localFilters.workoutId" class="filter-tag">
          Programa: {{ getWorkoutName(localFilters.workoutId) }}
          <button @click="removeFilter('workoutId')">×</button>
        </span>
        <span v-if="localFilters.exerciseName" class="filter-tag">
          Exercício: {{ localFilters.exerciseName }}
          <button @click="removeFilter('exerciseName')">×</button>
        </span>
        <span v-if="localFilters.exerciseId" class="filter-tag">
          Exercício ID: {{ getExerciseName(localFilters.exerciseId) }}
          <button @click="removeFilter('exerciseId')">×</button>
        </span>
        <span v-if="localFilters.dateFrom || localFilters.dateTo" class="filter-tag">
          Período: {{ formatDateRange() }}
          <button @click="removeDateFilter()">×</button>
        </span>
        <span v-if="localFilters.limit" class="filter-tag">
          Limite: {{ localFilters.limit }}
          <button @click="removeFilter('limit')">×</button>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import type { WorkoutHistoryFilters } from '@/types/workoutHistory';

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

interface QuickDateFilter {
  key: string;
  label: string;
  days: number;
}

interface Props {
  filters: WorkoutHistoryFilters;
  users?: User[];
  workouts?: Workout[];
  availableExercises?: Exercise[];
  showUserFilter?: boolean;
}

interface Emits {
  (e: 'update:filters', filters: WorkoutHistoryFilters): void;
}

const props = withDefaults(defineProps<Props>(), {
  users: () => [],
  workouts: () => [],
  availableExercises: () => [],
  showUserFilter: false
});

const emit = defineEmits<Emits>();

const localFilters = reactive<WorkoutHistoryFilters>({ ...props.filters });
const activeQuickFilter = ref<string>('');

const quickDateFilters: QuickDateFilter[] = [
  { key: 'week', label: '7 dias', days: 7 },
  { key: 'month', label: '30 dias', days: 30 },
  { key: 'quarter', label: '90 dias', days: 90 },
  { key: 'year', label: '1 ano', days: 365 }
];

const hasActiveFilters = computed(() => {
  return !!(
    localFilters.userId ||
    localFilters.workoutId ||
    localFilters.exerciseId ||
    localFilters.exerciseName ||
    localFilters.dateFrom ||
    localFilters.dateTo ||
    localFilters.limit
  );
});

// Watch for external filter changes
watch(
  () => props.filters,
  (newFilters) => {
    Object.assign(localFilters, newFilters);
  },
  { deep: true }
);

function updateFilters() {
  emit('update:filters', { ...localFilters });
}

function clearFilters() {
  Object.keys(localFilters).forEach(key => {
    delete localFilters[key as keyof WorkoutHistoryFilters];
  });
  activeQuickFilter.value = '';
  updateFilters();
}

function removeFilter(key: keyof WorkoutHistoryFilters) {
  delete localFilters[key];
  if (key === 'dateFrom' || key === 'dateTo') {
    activeQuickFilter.value = '';
  }
  updateFilters();
}

function removeDateFilter() {
  delete localFilters.dateFrom;
  delete localFilters.dateTo;
  activeQuickFilter.value = '';
  updateFilters();
}

function applyQuickDateFilter(quickFilter: QuickDateFilter) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - quickFilter.days);

  localFilters.dateFrom = startDate.toISOString().split('T')[0];
  localFilters.dateTo = endDate.toISOString().split('T')[0];
  activeQuickFilter.value = quickFilter.key;
  
  updateFilters();
}

function getUserName(userId: string): string {
  const user = props.users.find(u => u.id === userId);
  return user ? user.name : userId;
}

function getWorkoutName(workoutId: string): string {
  const workout = props.workouts.find(w => w.id === workoutId);
  return workout ? workout.name : workoutId;
}

function getExerciseName(exerciseId: string): string {
  const exercise = props.availableExercises.find(e => e.id === exerciseId);
  return exercise ? exercise.name : exerciseId;
}

function formatDateRange(): string {
  if (localFilters.dateFrom && localFilters.dateTo) {
    const start = new Date(localFilters.dateFrom).toLocaleDateString('pt-BR');
    const end = new Date(localFilters.dateTo).toLocaleDateString('pt-BR');
    return `${start} - ${end}`;
  }
  if (localFilters.dateFrom) {
    return `A partir de ${new Date(localFilters.dateFrom).toLocaleDateString('pt-BR')}`;
  }
  if (localFilters.dateTo) {
    return `Até ${new Date(localFilters.dateTo).toLocaleDateString('pt-BR')}`;
  }
  return '';
}
</script>

<style scoped>
.workout-history-filters {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.filters-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.clear-filters-btn {
  padding: 6px 12px;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  color: #374151;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-filters-btn:enabled:hover {
  background: #e5e7eb;
}

.clear-filters-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.filter-select,
.filter-input {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.filter-select:focus,
.filter-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.exercise-filter {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-separator {
  font-size: 12px;
  color: #6b7280;
}

.quick-filters {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.quick-filter-btn {
  padding: 4px 8px;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 12px;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-filter-btn:hover {
  background: #e5e7eb;
}

.quick-filter-btn.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.active-filters {
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.active-filters-label {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 8px;
}

.active-filters-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-tag {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: #dbeafe;
  color: #1e40af;
  border-radius: 12px;
  font-size: 12px;
}

.filter-tag button {
  background: none;
  border: none;
  color: #1e40af;
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  padding: 0;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.filter-tag button:hover {
  background: rgba(30, 64, 175, 0.1);
}

@media (max-width: 768px) {
  .filters-grid {
    grid-template-columns: 1fr;
  }

  .date-range {
    flex-direction: column;
    align-items: stretch;
  }

  .date-separator {
    text-align: center;
  }

  .quick-filters {
    justify-content: center;
  }

  .active-filters-list {
    justify-content: center;
  }
}
</style>